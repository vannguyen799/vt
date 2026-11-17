# Change scope policy

Agents may fix basic technical errors autonomously only when the fix preserves
the system's business rules. Examples include syntax errors, broken imports, and
type errors whose correction leaves intended behavior unchanged. These examples
never authorize weakening validation, authentication, or authorization.

Always ask the user and wait for explicit authorization before implementing any
change that affects business logic, including workflows, calculations, eligibility,
permissions, validation rules, or data semantics. Calling a change a bug fix,
refactor, or technical improvement does not exempt it from this rule.

Inspect the relevant specs and code first to establish the intended behavior;
existing code behavior alone is not proof of the intended business rule.
If it remains unclear whether a proposed fix changes a business rule, ask the user
and wait before implementing it; do not resolve that uncertainty by guessing.

An existing explicit user authorization for the same concrete business change
counts; do not ask again unless the scope changes or a business decision remains
unresolved. Broad requests to fix, improve, or refactor do not authorize unspecified
business-rule changes. Delegation does not expand the authorized scope.
