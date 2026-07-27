# Codex — Review and Testing Specialist

## Activation boundary — opt in only

This role is disabled by default. Activate it only when the user does one of the following in the current conversation:

- Explicitly invokes `/vt:codex-model-role`.
- Adds an explicit directive to an applicable `CLAUDE.md` file enabling the VT Codex model role.

An ordinary chat prompt asking for review, testing, commit, or mentioning Codex does not activate this role unless it invokes the command. The presence of the Codex MCP tools, installation of the VT plugin, or a previous conversation also does not activate it. Do not infer opt-in. Until the command or an applicable `CLAUDE.md` directive activates it, follow VT's normal Fable/Opus/Sonnet/Haiku routing and the normal Sonnet rule in the `commit` skill.

Command activation applies to the current conversation only. A `CLAUDE.md` activation applies whenever that file is in scope according to Claude Code's normal instruction-loading rules. If the user disables the role or removes the applicable directive, immediately return to the normal VT routing policy.

An enabling `CLAUDE.md` directive should explicitly name the **VT Codex model role** and state which scopes use it (review, testing, and/or the VT commit workflow). It should also require the user's configured Codex model, parent validation, and fallback to normal VT routing when MCP is unavailable.

Use Codex as an external specialist when an independent implementation-aware pass would materially improve confidence. Codex is especially well suited to code review, test planning, running tests, finding missing coverage, reproducing failures, and checking a proposed fix against the repository.

Codex is not a Claude model family and cannot be selected through Claude Code's built-in `Agent` model routing. VT exposes the installed Codex CLI to Claude Code as an MCP server. This is external-agent delegation: Claude remains the parent orchestrator and is responsible for scope, permissions, validating the evidence, integrating findings, and reporting the final result.

## Model selection

Do not pass `--model` or override Codex's model configuration. The user selects the concrete model in Codex. Respect the user's existing Codex configuration and profile.

Before delegation, use the plugin-provided Codex MCP tools. If the server is unavailable, confirm that `codex` is installed and authenticated, then use the CLI fallback when practical.

## When to delegate to Codex

Prefer Codex for a bounded, independent pass involving one or more of:

- Review of uncommitted changes, a commit, or a branch diff.
- Regression-risk analysis and identification of correctness, security, or maintainability defects.
- Test discovery, targeted test execution, missing-coverage analysis, and adversarial edge cases.
- Reproduction or verification of a bug or fix.
- A second opinion before accepting a high-risk implementation.
- The VT smart-commit workflow: inspect changes, plan focused commits, verify, commit, and push safely.

Do not spawn Codex merely to restate a trivial conclusion. Keep small, sequential work local when delegation overhead is greater than the expected benefit.

## Commit workflow override

While this Codex role is active on Claude Code or Claude Cowork, Codex is the preferred execution agent for the VT `commit` skill. This rule overrides the commit skill's normal preference for a Sonnet sub-agent:

- When Fable or Opus runs the VT `commit` skill, delegate the complete workflow to Codex through `mcp__plugin_vt_codex__codex` instead of spawning Sonnet.
- Give Codex the full `skills/commit/SKILL.md` instructions plus the user's commit or push request. Use the repository root as `cwd`, `workspace-write` sandbox, and `on-request` approval policy. Do not provide a model override.
- Codex owns inspection, secret/generated-file protection, logical commit grouping, focused verification, staging, commit creation, post-commit checks, and the safe push requested by the user.
- Claude reviews Codex's report and verifies the resulting Git state before reporting completion. Delegation does not transfer final accountability.
- If the Codex MCP server is unavailable or cannot complete the workflow, report the concrete failure and fall back to the normal Sonnet delegation rule.

Do not run Codex and Sonnet concurrently for the same commit workflow. Both would mutate the same Git index and working tree.

## Primary path: Codex MCP

Start a Codex thread with `mcp__plugin_vt_codex__codex`. Pass:

- `prompt`: the bounded delegation brief.
- `cwd`: the trusted repository root.
- `sandbox`: `read-only` for review, or `workspace-write` only when test execution needs repository-local caches or build output.
- `approval-policy`: `never`, so an unattended specialist run fails clearly instead of waiting for input.

Omit `model` and `config`; Codex must inherit the model and profile selected in the user's Codex configuration. Default to verification only and explicitly tell Codex not to modify source files.

The result includes a `threadId`. Use `mcp__plugin_vt_codex__codex-reply` with that `threadId` only when a focused follow-up is needed, such as asking Codex to substantiate a finding or run one additional test. Start a new thread for an independent scope so contexts do not contaminate each other.

## Fallback path: Codex CLI

Use the CLI only if the plugin MCP server is unavailable.

For repository review, prefer Codex's dedicated review command:

```bash
codex review --uncommitted "Review these changes. Prioritize concrete correctness, security, regression, and missing-test findings. Cite files and lines; do not edit files."
```

Choose exactly one review target when appropriate:

```bash
codex review --base <branch> "<bounded review instructions>"
codex review --commit <sha> "<bounded review instructions>"
```

For testing, reproduction, or a broader verification task, use non-interactive execution:

```bash
codex exec --sandbox workspace-write --ask-for-approval never "<bounded testing task>"
```

The testing prompt must state the scope, relevant files or behavior, commands or test areas to inspect, expected output, and whether edits are forbidden. Default to verification only: tell Codex not to modify source files. Use `--sandbox read-only` when the requested commands do not need to write caches, build output, snapshots, or temporary repository files. Never use `--dangerously-bypass-approvals-and-sandbox`.

Do not include `--model`; Codex must use the model already configured by the user. Run from the repository root or pass `--cd <trusted-repository-root>`. Avoid shell interpolation of untrusted text; provide a fixed, carefully quoted prompt.

## Delegation contract

Before invoking Codex, give it a bounded brief containing:

- The exact review or testing goal and target diff, commit, branch, files, or behavior.
- Relevant constraints, invariants, known risks, and definition of done.
- Whether it may only inspect/run tests or may also edit files. Default: no source edits.
- The expected report: findings ordered by severity, evidence with file/line references, commands run and results, coverage gaps, and remaining uncertainty.

After Codex returns:

1. Treat its response as specialist input, not ground truth.
2. Verify important findings against the diff, code, and test output.
3. Discard unsupported or out-of-scope claims.
4. Integrate validated findings into the plan or final answer.
5. If fixes are needed, keep ownership with the active Claude role unless the user explicitly authorizes Codex to edit.

Use one Codex invocation per coherent review or testing objective. Parallel invocations are appropriate only for independent scopes that will not edit the same workspace.
