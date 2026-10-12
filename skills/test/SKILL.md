---
name: test
description: Verify code changes cheaply — run only the tests and type checks a change can affect (vitest import graph, changed packages only), scaled to the change, with the rules for when to skip a run and which tests are worth writing. Use before running any test suite or type check (vitest, jest, tsc, vue-tsc, pytest, go test, cargo test, `pnpm test`, `npm test`), before writing tests, and when the user asks to test, verify, or check changes.
---

# Test — affected only, proportional to the change

Read `${CLAUDE_PLUGIN_ROOT}/claude/instructions/test-policy.md` first: it is the single source of truth for when to
run what and which tests to write. If no plugin-root variable is available, locate `claude/instructions/test-policy.md`
inside the `vt` plugin directory. This skill adds the runner for JavaScript/TypeScript repositories.

## Runner (vitest + tsc / vue-tsc)

The runner is `scripts/vt-test.sh` in this skill's directory (`${CLAUDE_PLUGIN_ROOT}/skills/test/scripts/vt-test.sh`).
Run it from anywhere inside the repository, in the foreground:

```bash
vt-test.sh changed              # tests affected by uncommitted changes (vitest --changed)
vt-test.sh changed origin/main  # ... by everything since a ref (a whole branch)
vt-test.sh files <path...>      # only these test files / dirs; iterate on one failing file this way
vt-test.sh typecheck            # tsc / vue-tsc only for the packages with changes
vt-test.sh full                 # whole suite of the changed vitest roots — end of a cross-cutting change only
```

What it does for you:

- Finds each vitest root (nearest `vitest.config.*` with its own `node_modules/.bin/vitest`), so monorepos with
  several configs run per root.
- Runs with `--no-isolate` (about twice as fast, modules are imported once per worker). Files that fail are re-run
  isolated and that result is final, so state leaking between files cannot produce a false failure.
- Uses half the cores, lower CPU/IO priority, and a machine-wide lock (`/tmp/vt-test.lock`) when `nice`, `ionice`,
  and `flock` exist, so runs from parallel agents or projects queue instead of overloading the machine.
- Prints failures only (vitest ≥ 4.1 `agent` reporter, `dot` before that).

Environment: `VT_TEST_WORKERS` (fixed worker count, e.g. `2` on a small shared VPS), `VT_TEST_ISOLATE=1`,
`VT_TEST_REPORTER`, `VT_TEST_LOCK` (`none` disables the lock).

Other stacks: use the commands in the policy's last table.

## Reporting

State exactly which runs you did, with the real result, and which you skipped under the policy and why. A skipped run
is never reported as passing.
