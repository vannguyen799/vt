# Test Policy — verify proportionally, write only tests that earn their cost

Applies to every agent and sub-agent that runs or writes tests, on every surface. The `test` skill carries a runner
for JavaScript/TypeScript repositories (vitest + tsc/vue-tsc); for other stacks apply the same rules with the stack's
own tools (table at the end).

## 1. Scope every run to the change

- **Never run the whole suite while iterating.** Run the tests the change can affect: for vitest,
  `--changed [ref]` (follows the import graph) or the test files/dirs of the touched area.
- **Type-check only the packages that changed**, incrementally where the tsconfig allows.
- Iterate on one failing test file at a time; re-run the affected set once it passes.
- Do not re-run a green run "to be sure", and do not start several heavy runs in parallel — on a shared machine
  they only queue or thrash.
- The **whole suite** runs once at the end of a cross-cutting change (shared types, schema, contracts, build config),
  when the user asks, or in CI. CI is the backstop for everything else.

## 2. Run proportionally to the change

| Change | Verify with |
|---|---|
| Docs, comments, copy/i18n strings, styling, logs, formatting | nothing |
| Small local edit (one function, no change to a behaviour branch), UI-only component tweak | type check |
| Behaviour change in one area | type check + affected tests |
| Cross-cutting refactor (shared types, schema, contracts) | type check + affected tests while iterating; whole suite once at the end |
| Bug fix | the new regression test + affected tests |

A run that was skipped under this table is reported as skipped, with the reason — never as passing.

## 3. Write only the tests that earn their cost

Write a test where a bug would be expensive **and** the logic can actually be wrong:

- **Yes:** business rules with branches (access/entitlement, billing and money, permissions, quotas, expiry),
  pure planners/resolvers/reducers, data mapping and parsing, date/timezone math, data migrations and import
  scripts, and a regression test for every bug fixed.
- **No:** thin controllers and route handlers, DI/module wiring, re-exports, trivial getters, type-only code,
  UI layout and styling, snapshot tests, tests that only restate the implementation through mocks, one test per
  CRUD endpoint.
- Prefer one table-driven test over many near-identical cases. Test through the public function, not internals.
- Keep business rules in pure functions so they test without infrastructure. Database-backed suites (in-process
  Postgres/PGlite, testcontainers, in-memory Mongo) are slow to boot — use them only for non-trivial query logic.
- When a feature is deleted, delete its tests. When behaviour changes, update the existing test instead of adding a
  parallel one.

## 4. Other stacks

| Stack | Affected tests | Type check |
|---|---|---|
| vitest / jest | `vitest run --changed`, `jest --onlyChanged` / `--findRelatedTests <files>` | `tsc --noEmit -p <pkg>` |
| pytest | `pytest <touched test paths>`, `--lf` while iterating, `-x` | `mypy <pkg>` / `pyright <pkg>` |
| go | `go test ./<touched pkg>/...` | `go vet ./<touched pkg>/...` |
| cargo | `cargo test -p <crate>` | `cargo check -p <crate>` |

Limit parallelism to about half the cores on a shared machine (`--maxWorkers`, `-n`, `-p`).
