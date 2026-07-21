---
name: systemprompt
description: Load the vt model-role orchestration policy (Fable/Opus/Sonnet roles + delegation rules) into context and follow the role matching the active model family. Use at the start of a session, when asked to load the vt system prompt or model roles, when invoked as vt:systemprompt, or on any Claude surface where the SessionStart hook does not run (e.g. Claude Cowork).
---

# Load vt model-role policy

Read `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/model-roles.md` and adopt it as the active operating policy for this session. That file is the **single source of truth** for model roles and delegation — the same file the `vt` `SessionStart` hook injects and the Claude Code `/vt:systemprompt` command reads. If no plugin-root variable is available, locate `claude/instructions/model-roles.md` inside the `vt` plugin directory and read it. Do not restate the policy from memory; read the file so this skill never drifts from the hook.

Identify the active model family (Fable, Opus, or Sonnet) and follow the matching role from that file. Report in one line which family and role you adopted.
