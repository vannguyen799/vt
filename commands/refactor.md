---
description: Review and refactor a codebase or area — dedupe into shared utils and abstractions, split oversized modules, delete dead code, trim API/stream payloads — behaviour preserved and verified.
---

Run the **VT refactor workflow** on the scope the user names (the whole repository if none).

Read and follow `${CLAUDE_PLUGIN_ROOT}/skills/refactor/SKILL.md`, and only the `references/` files for the stacks you touch.

Survey first, ask every open decision (isolation, scope, depth) in one batch, then execute without stopping. End with the net line delta, the API/payload change table, behaviour differences, and the real verification results.
