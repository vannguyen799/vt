# VT

Cross-platform agent workflows for Codex, ChatGPT Work, Claude Code, and Claude Cowork.

## Commands

- Claude Code and Claude Cowork: `/vt:commit`, `/vt:systemprompt`, `/vt:systempromptstrict`, `/vt:codex-model-role`
- Codex: invoke the bundled `commit`, `systemprompt`, or `systempromptstrict` skill explicitly, or ask VT to commit and push changes
- ChatGPT Work: select `VT` or its `commit` skill, then ask it to commit and push changes

The commit workflow inspects all changes, protects secrets and generated files, creates focused Conventional Commits, verifies each staged diff, and pushes the current branch without force-pushing.

## Model-role guidance

VT's model-role policy is split into a **shared core** plus two **profiles**, so both variants stay in sync and only their optimization objective differs:

- `claude/instructions/model-roles.md` — the **shared core (ref)**: the Fable / Opus / Sonnet / **Haiku** role definitions, spawn triggers, and delegation rules. Fable orchestrates and plans (never codes), Opus reasons and researches, Sonnet executes, Haiku handles mechanical and I/O work. This is the single source of truth for the roles; it is never loaded alone.
- `claude/instructions/profile-performance.md` — the **performance** objective: route each task to its strongest-fit family for correctness first; when a tier might be too weak, go up.
- `claude/instructions/profile-strict.md` — the **strict / cost** objective: same quality bar with a hard quota/token-budget discipline for subscription (Pro/Max) usage — default work down to the cheapest correct tier, keep premium contexts tiny, then verify.
- `claude/instructions/git-identity.md` — the always-on **Git commit identity** policy, loaded next to whichever profile is active (see below).

Each surface loads the core **together with** one profile, plus the Git identity policy:

- **Claude Code** injects the core + performance profile + Git identity policy automatically through a `SessionStart` hook, which prefixes the active role for Fable, Opus, Sonnet, or Haiku. A `UserPromptSubmit` hook also detects commit or push intent and directs Claude to use `/vt:commit`.
- **Claude Cowork** runs its own harness and does **not** fire plugin hooks, so nothing is injected automatically. Load the policy on demand: `/vt:systemprompt` (core + performance) or `/vt:systempromptstrict` (core + strict). Both read the same core and apply the role for the active model family.
- **Codex and ChatGPT Work** do not register the Claude hooks; use the bundled `systemprompt` or `systempromptstrict` skill to load the same core + profile.

Because the hook, both commands, and both skills read `model-roles.md` for the roles rather than embedding a copy, editing that one core file updates every surface and both profiles at once; the two profile files carry only the objective that differs between them.

### Git commit identity

`claude/instructions/git-identity.md` is loaded on every surface alongside the model-role core, and the `commit` skill repeats it as a workflow step. The rule: commits carry the **user's own** Git identity, never one derived from an agent's login or auth session — not the Claude/Anthropic or Codex/OpenAI account, not the harness-provided session email, not a bot or no-reply address.

Before the first commit, VT resolves `git config user.email` / `user.name`:

- Configured (globally, or via a deliberate repository-local override) and not an agent identity → commit with it silently, no questions.
- Missing, or set to an agent identity → stop and ask the user for the name and email, offering `git config --global user.name/user.email` (or `--local` for a per-repository identity).

VT never writes identity configuration on its own and never passes `git -c user.email=…`, `--author=…`, or `GIT_AUTHOR_*` / `GIT_COMMITTER_*`; Git resolves the author from the verified configuration. AI-attribution trailers stay off unless the user asks for them.

### Codex review and testing role

This role is opt-in and disabled by default. Run `/vt:codex-model-role` in Claude Code or Claude Cowork to enable it for the current conversation, or add an explicit enabling directive to an applicable `CLAUDE.md` for repository-scoped activation. Ordinary chat prompts, merely installing VT, and having its MCP tools available do not activate the role; new conversations start with normal VT routing unless an applicable `CLAUDE.md` enables it.

Recommended `CLAUDE.md` directive:

```md
Enable the VT Codex model role for this repository. Prefer the
`mcp__plugin_vt_codex__codex` agent for review, testing, and the VT commit
workflow; use `codex-reply` for focused follow-ups. Do not override the model
configured in Codex. Validate Codex's output, and fall back to normal VT model
routing if the Codex MCP server is unavailable.
```

Once enabled, Codex acts as an external specialist for code review, test planning and execution, coverage gaps, regression checks, and independent verification. VT starts `codex mcp-server` from its bundled `.mcp.json`, giving Claude the `codex` and `codex-reply` MCP tools. Claude Code's built-in `Agent` tool cannot switch to a Codex provider; the MCP server is the provider bridge. Non-interactive `codex review` and `codex exec` remain fallbacks when MCP is unavailable.

VT deliberately does not send the MCP `model` override or CLI `--model`. Codex uses the concrete model and profile already selected in the user's Codex configuration. Claude scopes the task, invokes Codex, validates its evidence, and integrates the result. While this role is active, `/vt:commit` also prefers the Codex MCP agent over the normal Sonnet delegation path; Sonnet remains the fallback if MCP is unavailable.

## Install in Claude Code

```text
/plugin marketplace add vannguyen799/vt
/plugin install vt@vt
/reload-plugins
```

For local development:

```bash
claude --plugin-dir /home/user/plugins/vt
```

## Install in Codex and ChatGPT Work

Add the repository as a plugin marketplace, install `vt`, and start a new session so the bundled skill is discovered. During local development, the personal marketplace entry points to `/home/user/plugins/vt`.
