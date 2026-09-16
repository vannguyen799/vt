# VT delegation mandate

Claude Code's built-in default is to avoid the `Agent` tool unless **the user, a
`CLAUDE.md`, or a skill** asks for it. A `SessionStart` hook injects *context*, which
does not meet that bar — so VT's model-role policy can be loaded and still never
produce a single sub-agent call. This file is the authorization that closes that gap,
and it is deliberately short and version-stable so it can be pasted into a user-level
or project-level `CLAUDE.md` and left alone.

## Authorization

Using the `Agent` tool is **explicitly requested** for this project. When a VT spawn
trigger fires, delegate — do not keep the work local out of caution. VT ships five
sub-agents, each pinned to a model family and a tuned reasoning effort:

| `subagent_type` | Family / effort | Dispatch for |
|---|---|---|
| `vt-mechanic`         | Haiku / `low`     | reads, greps, symbol lookup, running a command, log triage |
| `vt-implementer`      | Sonnet / `medium` | implementation from a complete brief (what / why / how) |
| `vt-deep-implementer` | Opus / `high`     | coding whose design resolves only while writing it |
| `vt-reasoner`         | Opus / `xhigh`    | analysis, research, architecture, debugging strategy (read-only) |
| `vt-verifier`         | Opus / `xhigh`    | adversarial verification of a high-stakes result (read-only) |

## The two triggers that fire most often

- **You can write the brief → delegate it.** The moment you can state what changes,
  why, and how to code it, hand it to `vt-implementer`. Being able to specify the work
  is exactly what makes it Sonnet's, not yours.
- **You are about to gather context rather than decide something** — two or more reads,
  greps, or command runs in a row on one question → dispatch `vt-mechanic` and take back
  the conclusion, keeping the raw output out of the premium context.

Keep work local only when it touches one or two files, the edit is small, and it is
inseparable from the reasoning just done. "Faster to just do it myself" is not a reason.

## Two failure modes to avoid

- **Resolving to delegate is not delegating.** Delegation is a tool call. A turn that
  concludes the work belongs to Sonnet and then writes the code anyway has mis-routed.
- **A generic sub-agent inherits the parent's model.** If a `vt-*` agent is unavailable
  and you fall back to a generic `subagent_type`, pass `model:` explicitly — otherwise
  the "delegation to Sonnet" silently runs on Opus and saves nothing.

The full role definitions, effort table, and spawn triggers live in the VT policy loaded
by the `SessionStart` hook, `/vt:systemprompt`, and `/vt:systempromptstrict`.
