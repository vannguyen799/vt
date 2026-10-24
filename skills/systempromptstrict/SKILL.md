---
name: systempromptstrict
description: Load VT model and effort routing in STRICT mode for the executing Claude, Codex, or ChatGPT Work surface. Use when asked to load VT model roles or the STRICT objective, at session start, or where hooks are unavailable. The alternative objective uses systemprompt.
---

# Load VT model routing — strict profile

Resolve the installed VT root from `${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}` or from
the directory containing this `SKILL.md` (resolve `../..` from that directory). Read
`<VT root>/claude/instructions/runtime-routing.md` first and identify the executing
surface using the host identity and live tools. A Codex MCP call from Claude does
not change the parent's surface.

Read the matching files under `<VT root>/claude/instructions/`:

- **Claude:** `model-roles.md`, `profile-strict.md`, and `delegation-mandate.md`.
- **Codex / ChatGPT Work with Codex tools:** `codex-model-roles.md`, adopting its
  **strict** objective. Do not load Claude's model table or quota profiles.
- **Unknown surface:** preserve the current model; inspect tools before choosing
  a routing policy. Do not guess a provider from a model name.

On every surface, also read `git-identity.md` and `forge-kernel.md`. Read other
policies when their triggers fire, as indexed by the runtime reference and hook.
These files are the source of truth; read them rather than reconstructing them
from memory. Keep the performance and strict objectives separate.

Invoking this skill explicitly requests delegation using the selected runtime's
tools when its routing rules call for it. Pass the active objective, relevant
constraints, reference paths, and a self-contained task brief to each child.
Preserve the user's parent model; select a child model/effort only when the host
exposes those controls. Validate delegated results against the same acceptance
criteria. Report the surface, known model, and strict objective in one line;
report unknown model information as unknown.
