# VT

Cross-platform agent workflows for Codex, ChatGPT Work, Claude Code, and Claude Cowork, covering the whole Git surface: issues, branches, commits, and pull requests.

## Commands

- Claude Code and Claude Cowork: `/vt:commit`, `/vt:issue-create`, `/vt:issue-triage`, `/vt:issue-process`, `/vt:issue-review`, `/vt:systemprompt`, `/vt:systempromptstrict`, `/vt:codex-model-role`
- Codex: invoke the bundled `commit`, `issue-*`, `systemprompt`, or `systempromptstrict` skill explicitly, or describe what you want done
- ChatGPT Work: select `VT` or one of its skills

The commit workflow inspects all changes, protects secrets and generated files, creates focused Conventional Commits, verifies each staged diff, and pushes the current branch without force-pushing.

## Issue, branch, and pull-request workflows

Issues and pull requests are **not Git** — Git has no concept of them. They belong to the *forge* (GitHub, GitLab, Gitea/Forgejo) and are reached through its CLI or API. VT detects the host from `git remote get-url origin` and the CLIs actually installed, rather than assuming GitHub; the per-host command vocabulary lives in one file, `claude/instructions/forge.md`, so a CLI change is fixed in one place.

| Command | What it does |
|---|---|
| `/vt:issue-create` | Turns a sentence, a sentence plus a screenshot, or a rough idea into a well-formed issue — investigating the repository to fill in what the reporter did not write |
| `/vt:issue-triage` | Surveys open issues and saved idea drafts, classifies them, finds duplicates and stale threads, recommends what to do next |
| `/vt:issue-process` | Confirms the symptom, creates a branch or worktree, implements, tests, commits through the `commit` skill, pushes, and opens a linked pull request |
| `/vt:issue-review` | Checks whether a pull request truly resolves the issue it claims to close, and whether its verification claims are real |

### The asymmetry these workflows are built around

A commit is local until it is pushed. **Every forge write is public the instant it happens** — it notifies watchers, consumes a permanent number, and cannot be undone. An issue is never deleted, only closed. So reading (list, view, search) is free and used generously, while every write is shown in full and confirmed first.

Some consequences worth knowing before you use it:

- **You do not have to write the report.** Give it one line, or a line and a screenshot. It reproduces the failure, or maps the screenshot to a component by grepping the visible strings (following i18n keys when the app is localized), and reads versions from the machine. It asks at most three questions, and only ones it cannot look up itself.
- **It separates what it confirmed from what it inferred**, in every issue body. That is what lets it be useful without fabricating: a hypothesis is allowed, presenting it as established is not. The same rule governs a pull request's verification section, where a fabricated "tests pass" line would make a reviewer skip checking.
- **Ideas become local drafts**, in `.vt/drafts/`, not issues. Ideas are the category most often abandoned or rewritten; filing each one pollutes the tracker and notifies people for nothing. `/vt:issue-triage` lists drafts alongside issues and promotes them on request.
- **A branch is one root cause, not one issue.** Several issues with a shared root cause are fixed together with a closing keyword for each; issues with different causes stay separate even when they touch the same file, so a bad fix can be reverted on its own.
- **A dirty working tree means a separate worktree.** Your uncommitted work is never stashed or checked out over. A clean tree uses an ordinary branch, because a worktree checks out tracked files only — `node_modules`, `.venv`, and `.env` are absent, so tests will not run until dependencies are installed.
- **It asks in proportion to blast radius.** Branches, worktrees, local drafts, and self-assignment reach nobody but you, so it just does them. Anything landing in someone else's notifications is shown in full first; approving, merging, and closing another person's issue always need an explicit instruction. Say "just file issues, don't ask" and it lifts the middle tier for that conversation.
- **It will not run an outside contributor's code before reading it.** Checking out a PR and running its tests is arbitrary code execution under your credentials, so the diff is inspected for touched CI files, lifecycle hooks, swapped dependencies, and credential reads before anything is executed.
- **Review feedback arrives as one batched review**, not eight separate comments — eight comments is eight notifications, out of order and without the summary that explains them.
- **It replies when the state changes.** A forge cross-reference tells the reporter that a PR exists, never what was wrong — so the root cause, a refusal, a duplicate, a block, or a close each get a one-line reason. Empty "starting work" and "PR is open" comments do not.
- **Approving and merging happen only when you say so.** An approval is an attestation under your account, and a merge rewrites the default branch and often triggers a deploy. Neither is ever taken on the agent's own initiative, and a requested merge is preceded by checking the rollup, the approvals, the draft state, conflicts, and the base branch — with the merge method left to you.
- **In an organization it checks before acting**: who the issue is assigned to (it will not duplicate a colleague's in-flight work), whether you have write access at all, whether the default branch is protected, and what `CONTRIBUTING.md`, the PR template, and `CODEOWNERS` require. It self-assigns when it starts, and assigns other people or requests a team review when you tell it to — never off its own guess about whose area the code is.

The rules are split by what each workflow needs: `claude/instructions/issue-policy.md` (safety, content, organization) is loaded by all four skills, and `claude/instructions/pr-policy.md` (branch, worktree, pull request) only by `issue-process` and `issue-review` — so filing and triaging issues does not pay for the pull-request half. Only a four-rule kernel (`claude/instructions/forge-kernel.md`) is always on, so a session that never touches the forge pays almost nothing.

## Model-role guidance

VT's model-role policy is split into a **shared core** plus two **profiles**, so both variants stay in sync and only their optimization objective differs:

- `claude/instructions/model-roles.md` — the **shared core (ref)**: the Fable / Opus / Sonnet / **Haiku** role definitions, spawn triggers, and delegation rules. Fable orchestrates and plans (never codes), Opus reasons and researches, Sonnet executes, Haiku handles mechanical and I/O work. This is the single source of truth for the roles; it is never loaded alone.
- `claude/instructions/profile-performance.md` — the **performance** objective: route each task to its strongest-fit family for correctness first; when a tier might be too weak, go up.
- `claude/instructions/profile-strict.md` — the **strict / cost** objective: same quality bar with a hard quota/token-budget discipline for subscription (Pro/Max) usage — default work down to the cheapest correct tier, keep premium contexts tiny, then verify.
- `claude/instructions/git-identity.md` — the always-on **Git commit identity** policy, loaded next to whichever profile is active (see below).
- `claude/instructions/forge-kernel.md` — the always-on **forge-write kernel**: three rules covering any issue, comment, label, or pull-request write, including ad-hoc `gh`/`glab`/`tea` calls made outside the `issue-*` skills.

Each surface loads the core **together with** one profile, plus the Git identity policy and the forge-write kernel:

- **Claude Code** injects the core + performance profile + Git identity policy + forge kernel automatically through a `SessionStart` hook, which prefixes the active role for Fable, Opus, Sonnet, or Haiku. A `UserPromptSubmit` hook also detects commit or push intent and directs Claude to use `/vt:commit`.
- **Claude Cowork** runs its own harness and does **not** fire plugin hooks, so nothing is injected automatically. Load the policy on demand: `/vt:systemprompt` (core + performance) or `/vt:systempromptstrict` (core + strict). Both read the same core and apply the role for the active model family.
- **Codex and ChatGPT Work** do not register the Claude hooks; use the bundled `systemprompt` or `systempromptstrict` skill to load the same core + profile.

Because the hook, both commands, and both skills read `model-roles.md` for the roles rather than embedding a copy, editing that one core file updates every surface and both profiles at once; the two profile files carry only the objective that differs between them. The same holds for the forge: `issue-policy.md` and `forge.md` are read by the `issue-*` skills rather than restated in them.

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
