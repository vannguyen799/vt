# Plugin policies — detect, then read the file

P = `~/.claude/plugins/marketplaces`. Read a file only when its trigger fires; never preload.

- **Always:** using the `Agent` tool with `vt-*` sub-agents is explicitly authorized — delegate when a VT spawn trigger fires. If `vt-*` is unavailable, pass `model:` explicitly on the fallback. Details: `P/vt/claude/instructions/delegation-mandate.md` (a compact role brief is injected by the VT SessionStart hook).
- **Issue / branch / PR work** → `P/vt/claude/instructions/issue-policy.md`, `pr-policy.md`.
