# vt

- Using the `Agent` tool with `vt-*` sub-agents is explicitly authorized for this repo — delegate when a VT spawn
  trigger fires. Mandate: `claude/instructions/delegation-mandate.md`.
- Don't bump the plugin version: CI (`auto-patch-version.yml`) does it on every push to `main`, so `git pull --rebase`
  before pushing.
- Changing a file in `claude/instructions/` → update its line in the SessionStart brief
  (`claude/scripts/session-start.mjs`) in the same change.
- Writing this file or any hook-injected text → `claude/instructions/agent-docs-policy.md`.

Reference (read when needed): layout, surfaces and policies → `README.md`; full policy files → `claude/instructions/`.
