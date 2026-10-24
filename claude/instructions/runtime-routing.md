# VT runtime routing

Read before choosing a model, effort, or delegation tool. Detect the executing
harness separately from the model family: a Claude session calling Codex over MCP
is still a Claude parent. A configured model name is not proof of the harness.

## Select the reference

| Executing surface | Load for model routing |
|---|---|
| Claude Code / Claude Cowork | `model-roles.md` + the requested `profile-performance.md` or `profile-strict.md` + `delegation-mandate.md` |
| Codex / ChatGPT Work with Codex tools | `codex-model-roles.md`, applying its performance or strict objective |
| Unknown | Shared task constraints only; preserve the current model and inspect available tools before routing |

Resolve these paths beside this file. Do not load both providers' model tables.
The external specialist's opt-in policy is `codex-model-role.md` (singular); it is
separate from native Codex routing in `codex-model-roles.md` (plural).

## Identify the surface

1. Use the host's explicit identity and actual tool schema. Claude's `Agent`
   with `subagent_type` uses Claude agents; Codex's `spawn_agent` (possibly under
   `collaboration`) uses the model and effort settings that tool exposes.
2. In VT hooks, the manifest's `--runtime=claude` or `--runtime=codex` argument is
   authoritative. Without it, `PLUGIN_ROOT` indicates the Codex plugin environment;
   check it before `CLAUDE_PLUGIN_ROOT`, which Codex also sets for compatibility.
3. Resolve the plugin root from the active hook's environment or the loaded
   skill's directory (resolve `../..` from the directory containing `SKILL.md`). Installed
   plugin files are the reference, not the current repository's lookalike paths.

Do not infer the surface from the existence of a `codex` or `claude` executable,
the repository's name, or an agent's login. Missing evidence stays unknown.

## Propagate constraints to subagents

Give every child its task, relevant paths, constraints, acceptance criteria, and
verification scope. Include this reference and the selected routing reference by
absolute path when accessible. Carry the active performance/strict objective in
the brief; do not assume session history or a hook carries that selection.

VT registers `SessionStart` and `SubagentStart` for Claude Code and Codex. The
child hook adds a small reference brief through `additionalContext`; it does not
copy the conversation, change model/effort, authorize new capabilities, or require
the child to delegate again. Each child preserves its assigned model and effort
and returns to the parent when the assignment needs a stronger model.

Codex plugin hooks require the host's hook review/trust and scripts available in
the execution environment. If hooks are unavailable (including a surface that
does not run them), explicitly load the systemprompt skill and put constraints
and reference paths in the child prompt. Never claim automatic injection worked
without observing it in that host. [Codex hook lifecycle and trust](https://learn.chatgpt.com/docs/hooks),
[plugin hook packaging](https://developers.openai.com/plugins/build/plugins#plugin-bundled-hooks).

Claude also supports child context through its `SubagentStart` event. Agent
definitions and the caller's brief remain relevant even with that hook.
[Claude SubagentStart](https://code.claude.com/docs/en/hooks#subagentstart).
