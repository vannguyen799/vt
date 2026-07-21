---
description: Load the vt model-role policy in STRICT mode — same quality bar as /vt:systemprompt but with a hard quota/token-budget discipline for subscription usage (default work DOWN to the cheapest correct tier, keep premium contexts tiny, then verify). Use when conserving your Pro/Max usage pool matters.
allowed-tools: Read
---

Load the **vt model-role policy (strict / cost profile)** for this session.

Read BOTH files and adopt them together as the active operating policy:

1. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/model-roles.md` — the **shared core**: the Fable / Opus / Sonnet / Haiku role definitions, spawn triggers, and delegation rules (identical to `/vt:systemprompt`).
2. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/profile-strict.md` — the **strict cost + performance objective** layered on top of the core: quota-weight awareness, default-down routing, hard caps on premium tiers, and token levers.

These two files are the **single source of truth** for this command. Do not restate the policy from memory; read both files so this command never drifts. The performance variant lives in `/vt:systemprompt` (core + `profile-performance.md`) — do not merge the two.

Then identify your active model family (Fable, Opus, Sonnet, or Haiku) and follow the matching role from the core under the strict objective — route work to the cheapest family that can do it correctly, keep Fable/Opus contexts minimal, and verify down-routed output. Report in one line which family and profile you adopted (e.g. "Opus — strict profile").
