# Git Commit Identity — always the user's own, never the agent's

This policy is part of VT's always-on operating context: it is injected by the `SessionStart` hook and loaded by `/vt:systemprompt`, `/vt:systempromptstrict`, and their skill equivalents, alongside the model-role core and its profile. It applies to **every** commit you create on any surface (Claude Code, Claude Cowork, Codex, ChatGPT Work), whether through the VT `commit` skill or an ad-hoc `git commit`.

## Hard rule — never author with an agent identity

Commits must carry the **human user's** Git identity. Never author, commit, or amend using an identity that comes from an agent's login or auth session, including:

- The email or account name of the Claude / Anthropic login used by this session — including any address the harness exposes as session context (e.g. a `userEmail` field, account profile, or environment variable).
- The Codex / OpenAI / ChatGPT login, or any other external-agent auth session.
- Assistant, bot, or no-reply addresses such as `noreply@anthropic.com`, `*@users.noreply.github.com` belonging to an agent or bot account, `claude@…`, `codex@…`.
- Any address you inferred, guessed, or reconstructed rather than read from Git configuration.

A session login address identifies *who is driving the agent*, not who Git should record as author. The two are not interchangeable: treat the harness-provided email as identification context only, never as a commit identity.

Equally forbidden, unless the user explicitly asks for it in this conversation:

- Setting or changing `user.name` / `user.email` on your own — via `git config`, `git config --global`, `git -c user.email=…`, `--author=…`, or the `GIT_AUTHOR_*` / `GIT_COMMITTER_*` environment variables.
- Adding `Co-Authored-By`, `Signed-off-by`, or any AI-attribution trailer.

Git's own configuration is the single source of truth for identity. Read it; do not supply it.

## Required check before the first commit

Before creating the first commit in a repository during this session, resolve the effective identity:

```bash
git config user.email
git config user.name
```

This resolves local → global → system in Git's normal precedence. Then:

- **Both resolve, and neither is an agent/auth-derived identity** → this is the user's configured identity. Commit normally with it, silently. Do not ask, do not confirm, do not mention it.
- **A repository-local override is set** (`git config --local user.email`) and is not an agent identity → the user set it deliberately for this repo. Use it as-is; do not override it with the global value.
- **Either value is missing** (no global identity set and no local override) → **stop before committing and ask the user** which name and email to use. Do not guess, do not fall back to the session login address, and do not commit with a partial identity.
- **The configured value is an agent/auth-derived identity** (matches the forbidden list above) → stop and ask as well, reporting exactly what is configured and where it came from (`git config --show-origin user.email`).

## When you have to ask

Ask once, concisely, and give the user the concrete commands rather than running them yourself:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Offer `--local` instead when the user wants a per-repository identity. Apply the setting yourself only if the user explicitly tells you to, and use exactly the name and email they provide. Once identity is configured, continue the commit workflow without repeating the check.

If the user declines to set an identity, do not commit — report that commits are blocked on a missing Git identity and leave the working tree untouched.
