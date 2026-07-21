# VT

Cross-platform agent workflows for Codex, ChatGPT Work, Claude Code, and Claude Cowork.

## Commands

- Claude Code and Claude Cowork: `/vt:commit`, `/vt:systemprompt`
- Codex: invoke the bundled `commit` or `systemprompt` skill explicitly, or ask VT to commit and push changes
- ChatGPT Work: select `VT` or its `commit` skill, then ask it to commit and push changes

The commit workflow inspects all changes, protects secrets and generated files, creates focused Conventional Commits, verifies each staged diff, and pushes the current branch without force-pushing.

## Model-role guidance

`claude/instructions/model-roles.md` is the **single source of truth** for VT's model-role and delegation policy (Fable orchestrates, Opus reasons, Sonnet executes). Every surface reads that one file — the text is never duplicated:

- **Claude Code** injects it automatically through a `SessionStart` hook, which prefixes the active role for Fable, Opus, or Sonnet. A `UserPromptSubmit` hook also detects commit or push intent and directs Claude to use `/vt:commit`.
- **Claude Cowork** runs its own harness and does **not** fire plugin hooks, so the policy is not injected automatically there. Load it on demand with `/vt:systemprompt` (or ask VT to load its system prompt). The command reads the same `model-roles.md` and applies the role for the active model family.
- **Codex and ChatGPT Work** do not register the Claude hooks; use the bundled `systemprompt` skill to load the same policy.

Because the hook, the `/vt:systemprompt` command, and the `systemprompt` skill all read `model-roles.md` rather than embedding a copy, updating that one file updates every surface at once.

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