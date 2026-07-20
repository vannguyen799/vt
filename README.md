# VT

Cross-platform agent workflows for Codex, ChatGPT Work, Claude Code, and Claude Cowork.

## Commands

- Claude Code and Claude Cowork: `/vt:commit`
- Codex: invoke the bundled `commit` skill explicitly or ask VT to commit and push changes
- ChatGPT Work: select `VT` or its `commit` skill, then ask it to commit and push changes

The commit workflow inspects all changes, protects secrets and generated files, creates focused Conventional Commits, verifies each staged diff, and pushes the current branch without force-pushing.

## Claude-only startup guidance

Claude Code and Claude Cowork load `claude/instructions/model-roles.md` through a `SessionStart` hook. The hook adapts the active role for Fable, Opus, or Sonnet. The Codex manifest does not register this hook, so Codex and ChatGPT Work do not receive the Claude startup guidance.

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
