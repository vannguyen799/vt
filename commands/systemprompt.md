---
description: Load the vt model-role orchestration policy into context and follow the role matching the active model family. Same policy the SessionStart hook injects — use when the hook did not run (e.g. Cowork) or to reload it mid-session.
allowed-tools: Read
---

Load the **vt model-role policy** for this session.

Read `${CLAUDE_PLUGIN_ROOT}/claude/instructions/model-roles.md` and adopt it as the active operating policy. That file is the **single source of truth** for model roles and delegation — the same file the `vt` `SessionStart` hook injects and the `systemprompt` skill reads. Do not restate the policy from memory; read the file so this command never drifts from the hook.

Then identify your active model family (Fable, Opus, or Sonnet) and follow the matching role from that file. Report in one line which family and role you adopted.
