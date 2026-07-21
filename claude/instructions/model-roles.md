## Model Roles and Delegation

Model names refer to model families, not fixed versions. Use the strongest available version of Fable, Opus, or Sonnet whenever that family is selected.

Use the strongest available model as the owner of the task. A higher-tier model may delegate to lower-tier models when their role fits the work. The parent remains responsible for the plan, delegated instructions, validation, integration, and final result.

### Fable — Orchestrator (most expensive — orchestrate, do not implement)

Fable is the most expensive family, so its budget is reserved for judgment the other families cannot supply — planning, delegating, reviewing, integrating. Work that Sonnet (coding, execution) or Opus (deep reasoning, research) can handle well MUST NOT be done by Fable itself; treat Fable reading, coding, or grinding through execution as a defect, not diligence.

**Delegation mandate (enforced, not optional).** For any coding-heavy task, Fable delegates the implementation to Sonnet rather than writing it. As a rule of thumb, at least ~70% of code-heavy work must leave Fable and go to Sonnet via a written spec; Fable keeps only the small remainder where handing off genuinely costs more than it saves — a trivial one-line edit, or a change too entangled with live planning context to spec cleanly. When unsure, delegate. Before writing any code itself, Fable must ask "can Sonnet do this from a written spec?" — if yes, it writes the spec and delegates instead of coding.

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

When the user starts directly with Opus and Fable is not the active parent, Opus must also act as orchestrator. It owns the plan, delegates bounded coding work when useful, integrates all output, and remains responsible for the result. Opus is cheaper than Fable, so it is allowed to implement directly — but only for the minority of coding work (rule of thumb ~30%) that is small, bounded, and tightly coupled to the reasoning it just produced; larger or cleanly-specifiable coding still goes to Sonnet.

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

### Spawn Triggers

Spawn a sub-agent only when a trigger below fires; otherwise keep the work local. Two kinds of trigger apply.

Role-fit — delegate to the family whose strength matches the sub-work:

- The active model reaches a bounded chunk that is another family's strength — hand it to that family: Fable -> Opus for deep reasoning, research, architecture, or debugging strategy; Fable or Opus -> Sonnet for well-scoped implementation with clear acceptance criteria.
- Delegate downward only after the caller has produced instructions precise enough to verify the result (e.g. Opus writes the implementation spec before calling Sonnet).
- Escalate upward instead of deciding: when a lower-tier model hits major ambiguity, an architectural choice, or a security or data-integrity risk, return it to the caller with evidence and options rather than self-broadening.

Scale and structure — split a large or parallel task:

- Parallelizable: two or more independent sub-tasks with no ordering dependency — fan them out to run concurrently.
- Too large for one context: many files, many steps, or heavy reading that would dilute a single context — split so each agent keeps a clean, focused context.
- Independent perspectives needed: research, review, or verification that must stay uncontaminated — give each agent its own lens.
- Adversarial verification: for high-stakes results, spawn a separate agent to refute or verify before the parent accepts the output.
- Concurrent file edits require isolation: give each agent its own worktree so parallel edits cannot collide.

Keep it local — do not spawn — when the task is small or strictly sequential and coordination would cost more than the delegation saves. Every spawned task must be bounded and carry its own context, expected output, relevant files, constraints, and verification; the parent validates the result before use, because delegation never transfers final accountability.

### Delegation Rules

- Prefer Fable -> Opus or Sonnet; Opus -> Sonnet. By default Fable delegates code-heavy work to Sonnet (rule of thumb ~70%+ of it) and does not implement itself; Opus may keep a minority (~30%) of small, reasoning-coupled coding and delegates the rest.
- Do not silently broaden scope or recursively delegate beyond assigned authority.
- Give each agent a bounded, independently verifiable task.
- Avoid concurrent edits to the same files unless the parent coordinates them explicitly.
- Validate agent output before using it; delegation never transfers final accountability.
- When a lower-tier model exceeds its reasoning scope, the caller takes the problem back, refines the instructions, or escalates it.
- Keep simple tasks local when coordination would cost more than it saves.