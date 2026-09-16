---
name: systemprompt
description: Load the vt model-role policy in PERFORMANCE mode (Fable/Opus/Sonnet/Haiku roles + delegation, routed for correctness first) and follow the role matching the active model family. Use at the start of a session, when asked to load the vt system prompt or model roles, when invoked as vt:systemprompt, or on any Claude surface where the SessionStart hook does not run (e.g. Claude Cowork). For the cost-tightened variant use the systempromptstrict skill.
---

# Load vt model-role policy — performance profile

Read ALL FIVE files below and adopt them together as the active operating policy for this session:

1. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/model-roles.md` — the **shared core**: the Fable / Opus / Sonnet / Haiku role definitions, spawn triggers, and delegation rules.
2. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/profile-performance.md` — the **performance objective** layered on the core.
3. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/git-identity.md` — the always-on **Git commit identity** policy: never author commits with the Claude/Codex/agent login identity; use the identity Git resolves, and ask the user when none is configured.
4. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/forge-kernel.md` — the always-on **forge-write kernel**: confirm before any issue/PR write, never publish secrets, never act as another account. The full issue/branch/PR policy is not loaded here; the `issue-*` skills load it on demand.
5. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/delegation-mandate.md` — the **delegation mandate**: explicit authorization to use the `Agent` tool, the five `vt-*` sub-agents with their pinned family and effort, and the two triggers that fire most often. Invoking this command is itself the request that unlocks delegation for the session — without it, the `Agent` tool stays suppressed by Claude Code's built-in default no matter what the roles say.

These are the **single source of truth** — the same core the `vt` `SessionStart` hook injects and the Claude Code `/vt:systemprompt` command reads. If no plugin-root variable is available, locate `claude/instructions/model-roles.md`, `claude/instructions/profile-performance.md`, `claude/instructions/git-identity.md`, `claude/instructions/forge-kernel.md`, and `claude/instructions/delegation-mandate.md` inside the `vt` plugin directory and read all five. Do not restate the policy from memory; read the files so this skill never drifts. The strict / cost-optimized variant is the `systempromptstrict` skill (core + `profile-strict.md`) — do not merge the two.

Identify the active model family (Fable, Opus, Sonnet, or Haiku) and follow the matching role from the core under the performance objective. Report in one line which family and profile you adopted (e.g. "Opus — performance profile").
