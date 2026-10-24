# VT model routing for Codex

Read after `runtime-routing.md` selects Codex or ChatGPT Work with Codex tools.
This is native Codex guidance, separate from the opt-in Claude-to-Codex MCP role
in `codex-model-role.md`. Keep the user's selected parent model and effort.

## Evidence and scope

Research checked 2026-10-24. OpenAI describes GPT-6.1 Sol as a balanced option for
complex work, GPT-6 Luna for focused tasks, and GPT-6 Astra for the most demanding
reasoning. Availability depends on the current host/account. Recheck the official
[model guide](https://developers.openai.com/api/docs/guides/latest-model) when
those names are unavailable or the user asks for current model advice.

The table below is VT's starting heuristic, not an official benchmark or a
guarantee of the cheapest successful run. The effort choice depends on ambiguity
and validation cost. Do not apply Claude family roles or subscription quota
multipliers to OpenAI models.

## Child model and effort starting points

| Assignment | Model when available | Effort | Return |
|---|---|---|---|
| Exact lookup, fixed command, mechanical extraction | `gpt-6-luna` | `low` | Evidence and concise result |
| Bounded exploration or synthesis needing judgment | `gpt-6-luna` | `high` | Relevant paths and findings |
| Implementation from a complete brief | `gpt-6.1-sol` | `medium` | Changes and affected verification |
| Implementation whose design needs resolving | `gpt-6.1-sol` | `high` | Changes, rationale, verification |
| Ambiguous architecture or difficult debugging strategy | `gpt-6-astra` | `low` | Decision and implementation brief |
| Independent review | `gpt-6.1-sol` | `high` | Findings with evidence |

For a difficult verification pass, consider `xhigh` on Sol or a supported Astra
configuration when extra reasoning could change the decision. Reserve `max` or
`ultra` for an explicit need and host/model support. Text instructions to think
harder do not change the configured reasoning effort.

**Performance objective:** use the table, move to a stronger configuration when
the task requires it, and validate the result. **Strict objective:** use Luna for
bounded reads, consider Sol `low` for fully specified small edits, avoid duplicated
investigation, and increase effort only to resolve a concrete uncertainty. Keep
the same acceptance criteria. Neither objective requires spawning for a tiny
dependent step where coordination would cost more than the work.

When evaluating these defaults, compare representative tasks using acceptance
rate, retries, total tokens/cost, and elapsed time. Include parent coordination
and validation in the comparison. No benchmark has been run for this table.

## Dispatch using the tools actually available

Invoking VT's systemprompt skill requests delegation for independent, bounded
work under this policy. An applicable `AGENTS.md` can also authorize it. Hook
context alone is not that request; obey the host's delegation rules.

- Check the live tool schema and available models. Use native Codex agent types
  when configured; Claude's `agents/vt-*.md` are not native Codex definitions.
- When the spawn tool exposes `model` and `reasoning_effort`, pass both explicitly
  for a routed child. If model overrides require `fork_turns: "none"`, use it and
  provide a self-contained brief with constraints and the active objective.
- A full-history fork may inherit the parent's model and effort. Do not label
  inherited work as a cheaper model merely because the child has a role name.
- If per-child controls are absent, preserve the host defaults and report the
  limitation. Do not invent arguments, silently substitute a model, or rewrite
  the user's global configuration.
- Treat unavailable models as unavailable: use an appropriate model actually
  exposed by the host, or keep the work in the parent. Validate the outcome.
- The child brief must carry the safety and verification constraints relevant
  to its task; see `runtime-routing.md`. A child escalates to its parent instead
  of recursively spawning to evade its assigned scope.

Local Codex clients can also configure native custom agents with `model`,
`model_reasoning_effort`, and `developer_instructions`. Unconfigured children
can inherit parent settings. Use the current
[Codex subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents)
for the file format and setting precedence; this plugin does not install or
overwrite personal agent definitions.

Git identity, forge writes, agent docs, and verification still follow the shared
`git-identity.md`, `forge-kernel.md`, `agent-docs-policy.md`, and `test-policy.md`.
Report the executing surface, active objective, and any actual child model/effort
chosen. Do not claim to have switched the running parent's configuration.
