# VT

Cross-platform agent workflows for Codex, ChatGPT Work, Claude Code, and Claude Cowork.

## Commands

- Claude Code and Claude Cowork: `/vt:commit`, `/vt:systemprompt`, `/vt:systempromptstrict`
- Codex: invoke the bundled `commit`, `systemprompt`, or `systempromptstrict` skill explicitly, or ask VT to commit and push changes
- ChatGPT Work: select `VT` or its `commit` skill, then ask it to commit and push changes

The commit workflow inspects all changes, protects secrets and generated files, creates focused Conventional Commits, verifies each staged diff, and pushes the current branch without force-pushing.

## Model-role guidance

VT's model-role policy is split into a **shared core** plus two **profiles**, so both variants stay in sync and only their optimization objective differs:

- `claude/instructions/model-roles.md` — the **shared core (ref)**: the Fable / Opus / Sonnet / **Haiku** role definitions, spawn triggers, and delegation rules. Fable orchestrates and plans (never codes), Opus reasons and researches, Sonnet executes, Haiku handles mechanical and I/O work. This is the single source of truth for the roles; it is never loaded alone.
- `claude/instructions/profile-performance.md` — the **performance** objective: route each task to its strongest-fit family for correctness first; when a tier might be too weak, go up.
- `claude/instructions/profile-strict.md` — the **strict / cost** objective: same quality bar with a hard quota/token-budget discipline for subscription (Pro/Max) usage — default work down to the cheapest correct tier, keep premium contexts tiny, then verify.

Each surface loads the core **together with** one profile:

- **Claude Code** injects the core + performance profile automatically through a `SessionStart` hook, which prefixes the active role for Fable, Opus, Sonnet, or Haiku. A `UserPromptSubmit` hook also detects commit or push intent and directs Claude to use `/vt:commit`.
- **Claude Cowork** runs its own harness and does **not** fire plugin hooks, so nothing is injected automatically. Load the policy on demand: `/vt:systemprompt` (core + performance) or `/vt:systempromptstrict` (core + strict). Both read the same core and apply the role for the active model family.
- **Codex and ChatGPT Work** do not register the Claude hooks; use the bundled `systemprompt` or `systempromptstrict` skill to load the same core + profile.

Because the hook, both commands, and both skills read `model-roles.md` for the roles rather than embedding a copy, editing that one core file updates every surface and both profiles at once; the two profile files carry only the objective that differs between them.

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
