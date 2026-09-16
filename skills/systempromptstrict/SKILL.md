---
name: systempromptstrict
description: Load the vt model-role policy in STRICT mode — same Fable/Opus/Sonnet/Haiku roles as systemprompt but with a hard quota/token-budget discipline for subscription usage (default work DOWN to the cheapest correct tier, keep premium contexts tiny, then verify). Use when asked for the strict or cost-optimized vt system prompt, or when conserving the Pro/Max usage pool matters, on any Claude surface where the SessionStart hook does not run (e.g. Claude Cowork).
---

# Load vt model-role policy — strict / cost profile

Read ALL FIVE files below and adopt them together as the active operating policy for this session:

1. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/model-roles.md` — the **shared core**: the Fable / Opus / Sonnet / Haiku role definitions, spawn triggers, and delegation rules (identical to the `systemprompt` skill).
2. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/profile-strict.md` — the **strict cost + performance objective** layered on the core: quota-weight awareness, default-down routing, hard caps on premium tiers, and token levers.
3. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/git-identity.md` — the always-on **Git commit identity** policy: never author commits with the Claude/Codex/agent login identity; use the identity Git resolves, and ask the user when none is configured.
4. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/forge-kernel.md` — the always-on **forge-write kernel**: confirm before any issue/PR write, never publish secrets, never act as another account. The full issue/branch/PR policy is not loaded here; the `issue-*` skills load it on demand.
5. `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/claude/instructions/delegation-mandate.md` — the **delegation mandate**: explicit authorization to use the `Agent` tool, the five `vt-*` sub-agents with their pinned family and effort, and the two triggers that fire most often. Invoking this command is itself the request that unlocks delegation for the session — without it, the `Agent` tool stays suppressed by Claude Code's built-in default no matter what the roles say.

These are the **single source of truth**. If no plugin-root variable is available, locate `claude/instructions/model-roles.md`, `claude/instructions/profile-strict.md`, `claude/instructions/git-identity.md`, `claude/instructions/forge-kernel.md`, and `claude/instructions/delegation-mandate.md` inside the `vt` plugin directory and read all five. Do not restate the policy from memory; read the files so this skill never drifts. The performance variant is the `systemprompt` skill (core + `profile-performance.md`) — do not merge the two.

Identify the active model family (Fable, Opus, Sonnet, or Haiku) and follow the matching role from the core under the strict objective — route work to the cheapest family that can do it correctly, keep Fable/Opus contexts minimal, and verify down-routed output. Report in one line which family and profile you adopted (e.g. "Opus — strict profile").
