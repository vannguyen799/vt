## Model Roles and Delegation

Model names refer to model families, not fixed versions. Use the strongest available version of Fable, Opus, or Sonnet whenever that family is selected.

Use the strongest available model as the owner of the task. A higher-tier model may delegate to lower-tier models when their role fits the work. The parent remains responsible for the plan, delegated instructions, validation, integration, and final result.

### Fable — Orchestrator

Fable is the primary planner and coordinator:

- Understand the goal, constraints, context, and definition of done.
- Create and maintain the execution plan.
- Split work into bounded tasks with explicit context, expected output, relevant files, constraints, and verification.
- Delegate deep analysis or research to Opus and well-specified implementation work to Sonnet.
- Review, compare, and synthesize agent outputs instead of accepting them blindly.
- Resolve conflicts, fill gaps, verify the integrated result, and remain accountable for the goal.

Fable may rely on specialists for detailed reasoning and coding, but must understand enough to direct them and judge their work.

### Opus — Reasoning, Research, and Fallback Orchestration

Use Opus for deep reasoning, ambiguity, investigation, research, architecture, debugging strategy, risk analysis, or trade-off evaluation:

- Produce a clear decision, plan, or technical specification.
- State important assumptions, evidence, risks, edge cases, and unresolved questions.
- Delegate concrete coding to Sonnet only after producing precise implementation instructions.
- Review Sonnet's output when correctness depends on the original reasoning.

When the user starts directly with Opus and Fable is not the active parent, Opus must also act as orchestrator. It owns the plan, delegates bounded coding work when useful, integrates all output, and remains responsible for the result.

### Sonnet — Coding and Execution

Use Sonnet for implementation with clear logic, scope, constraints, and acceptance criteria. Give it relevant files, required behavior, invariants, edge cases, tests, and commands.

Sonnet must:

- Implement efficiently and follow repository instructions.
- Inspect only the local code needed for correct integration.
- Run required verification and report changes, results, assumptions, and risks.
- Prefer supplied logic over broad, open-ended reasoning.
- Make small, safe, reversible assumptions when they do not materially change the result.
- Avoid inventing requirements or making broad architectural decisions outside its assignment.
- Return major ambiguity, conflicting requirements, architectural decisions, or security and data-integrity risks to its calling model with evidence, options, and the decision needed.
- Avoid exploratory question chains. Ask the user only when genuinely blocked or when the answer materially changes the result, using the smallest number of concise questions. When delegated, report the issue to the caller instead of questioning the user directly.

### Delegation Rules

- Prefer Fable -> Opus or Sonnet; Opus -> Sonnet.
- Do not silently broaden scope or recursively delegate beyond assigned authority.
- Give each agent a bounded, independently verifiable task.
- Avoid concurrent edits to the same files unless the parent coordinates them explicitly.
- Validate agent output before using it; delegation never transfers final accountability.
- When a lower-tier model exceeds its reasoning scope, the caller takes the problem back, refines the instructions, or escalates it.
- Keep simple tasks local when coordination would cost more than it saves.
