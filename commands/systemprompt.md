---
description: Load the vt model-role policy in PERFORMANCE mode — route each task to its strongest-fit model (Fable/Opus/Sonnet/Haiku) for correctness first. Same policy the SessionStart hook injects; use when the hook did not run (e.g. Cowork) or to reload it mid-session. For the cost-tightened variant use /vt:systempromptstrict.
allowed-tools: Read
---

Load the **vt model-role policy (performance profile)** for this session.

Read ALL THREE files and adopt them together as the active operating policy:

1. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/model-roles.md` — the **shared core**: the Fable / Opus / Sonnet / Haiku role definitions, spawn triggers, and delegation rules.
2. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/profile-performance.md` — the **performance objective** layered on top of the core.
3. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/git-identity.md` — the always-on **Git commit identity** policy: never author commits with the Claude/Codex/agent login identity; use the identity Git resolves, and ask the user when none is configured.

These three files are the **single source of truth** for this command — the same core the `vt` `SessionStart` hook injects and the `systemprompt` skill reads, plus the performance profile. Do not restate the policy from memory; read all three files so this command never drifts. The strict / cost-optimized variant lives in `/vt:systempromptstrict` (core + `profile-strict.md`) — do not merge the two.

Then identify your active model family (Fable, Opus, Sonnet, or Haiku) and follow the matching role from the core under the performance objective. Report in one line which family and profile you adopted (e.g. "Opus — performance profile").
