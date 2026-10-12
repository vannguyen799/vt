#!/usr/bin/env bash
# VT test runner: only the tests and type checks a change can affect, cheap on CPU. Rules: ../../../claude/instructions/test-policy.md
#
#   vt-test.sh changed [since]   vitest tests affected (import graph) by uncommitted changes, or by changes since <ref>
#   vt-test.sh files <path...>   only these test files / dirs
#   vt-test.sh typecheck [since] tsc / vue-tsc only for the packages that have changes
#   vt-test.sh full              whole suite of every vitest root that has changes
#
# Run from anywhere inside a git repo. A "vitest root" is the nearest dir (walking up from a changed file) that has a
# vitest.config.* and node_modules/.bin/vitest, so monorepos with several vitest configs are handled per root.
#
# Speed: --no-isolate (~2x faster: modules are imported once per worker, not once per file). If that run fails, the
# failing files are re-run isolated and THAT result is final, so state leaking between files cannot fake a failure.
# CPU: workers = half the cores; lower CPU/IO priority and a machine-wide lock (concurrent runs queue instead of
# piling up) when nice/ionice/flock exist. Env: VT_TEST_WORKERS, VT_TEST_ISOLATE=1, VT_TEST_REPORTER (default agent),
# VT_TEST_LOCK (default /tmp/vt-test.lock, "none" disables).
set -uo pipefail

cores="$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 2)"
WORKERS="${VT_TEST_WORKERS:-$(( cores / 2 > 0 ? cores / 2 : 1 ))}"
LOCK="${VT_TEST_LOCK:-/tmp/vt-test.lock}"
GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "vt-test: not inside a git repo" >&2; exit 2; }
mode="${1:-changed}"; shift || true

PREFIX=()
[ "$LOCK" != none ] && command -v flock >/dev/null && PREFIX+=(flock "$LOCK")
command -v nice >/dev/null && PREFIX+=(nice -n 5)
command -v ionice >/dev/null && PREFIX+=(ionice -c2 -n7)
run() { ${PREFIX[@]+"${PREFIX[@]}"} "$@"; }

has_vitest_config() { compgen -G "$1/vitest.config.*" >/dev/null; }

# nearest ancestor dir (inside the repo) of $1 matching predicate $2
nearest() {
  local d; d="$(cd "$GIT_ROOT" && dirname "$1")"; d="$GIT_ROOT/$d"
  while :; do
    [ -d "$d" ] && "$2" "$d" && { echo "$d"; return 0; }
    [ "$d" = "$GIT_ROOT" ] && return 1
    d="$(dirname "$d")"
  done
}
is_vitest_root() { has_vitest_config "$1" && [ -x "$1/node_modules/.bin/vitest" ]; }
is_ts_root() { [ -f "$1/tsconfig.json" ] && { [ -x "$1/node_modules/.bin/tsc" ] || [ -x "$1/node_modules/.bin/vue-tsc" ]; }; }

changed_files() { # repo-relative, since $1 (default: working tree vs HEAD) + untracked
  { git -C "$GIT_ROOT" diff --name-only "${1:-HEAD}" --; git -C "$GIT_ROOT" ls-files --others --exclude-standard; } \
    | grep -E '\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|vue|json)$' | sort -u
}

roots_for() { # $1 predicate, files on stdin -> unique roots
  local f r
  while read -r f; do r="$(nearest "$f" "$1")" && echo "$r"; done | sort -u
}

# vitest in <root> with args; on failure re-run failed files isolated
vitest_root() {
  local root="$1"; shift
  local json; json="$(mktemp)"
  local iso="--no-isolate"; [ "${VT_TEST_ISOLATE:-0}" = 1 ] && iso="--isolate"
  # the failures-only `agent` reporter exists from vitest 4.1; older versions get `dot`
  local REPORTER="${VT_TEST_REPORTER:-$(cd "$root" && node -e '
    try { const [a,b]=require(require.resolve("vitest/package.json")).version.split(".").map(Number);
          console.log(a>4||(a===4&&b>=1)?"agent":"dot") } catch { console.log("dot") }' 2>/dev/null || echo dot)}"
  echo "== vitest ${root#"$GIT_ROOT"/} $*"
  (cd "$root" && run node_modules/.bin/vitest run --maxWorkers="$WORKERS" "$iso" --passWithNoTests \
    --reporter="$REPORTER" --reporter=json --outputFile.json="$json" "$@")
  local status=$?
  if [ $status -ne 0 ] && [ "$iso" = "--no-isolate" ] && [ -s "$json" ]; then
    failed=()
    while IFS= read -r line; do failed+=("$line"); done < <(node -e '
      const r=require(process.argv[1]);
      for (const t of r.testResults||[]) if (t.status!=="passed") console.log(t.name);' "$json")
    if [ ${#failed[@]} -gt 0 ]; then
      echo "== re-running ${#failed[@]} failed file(s) isolated (final result)"
      (cd "$root" && run node_modules/.bin/vitest run --maxWorkers="$WORKERS" --isolate --reporter="$REPORTER" "${failed[@]}")
      status=$?
    fi
  fi
  rm -f "$json"
  return $status
}

status=0
case "$mode" in
  changed)
    since="${1:-HEAD}"
    roots="$(changed_files "$since" | roots_for is_vitest_root)"
    [ -z "$roots" ] && { echo "vt-test: no changes under a vitest root since $since"; exit 0; }
    for r in $roots; do vitest_root "$r" --changed "$since" || status=$?; done
    ;;
  files)
    [ $# -eq 0 ] && { echo "usage: vt-test.sh files <path...>" >&2; exit 2; }
    pairs=""   # "<root>\t<path relative to root>" lines (bash 3.2 has no associative arrays)
    for p in "$@"; do
      abs="$(cd "$(dirname "$p")" && pwd)/$(basename "$p")"; rel="${abs#"$GIT_ROOT"/}"
      r="$(nearest "$rel/x" is_vitest_root)" || { echo "vt-test: no vitest root for $p" >&2; status=2; continue; }
      relr="${abs#"$r"/}"; [ "$abs" = "$r" ] && relr="."
      pairs+="$r"$'\t'"$relr"$'\n'
    done
    for r in $(printf '%s' "$pairs" | cut -f1 | sort -u); do
      paths=()
      while IFS=$'\t' read -r pr pp; do [ "$pr" = "$r" ] && [ "$pp" != "." ] && paths+=("$pp"); done <<< "$pairs"
      vitest_root "$r" "${paths[@]}" || status=$?
    done
    ;;
  typecheck)
    roots="$(changed_files "${1:-HEAD}" | roots_for is_ts_root)"
    [ -z "$roots" ] && { echo "vt-test: no changes under a tsconfig root"; exit 0; }
    for r in $roots; do
      bin=tsc; [ -x "$r/node_modules/.bin/vue-tsc" ] && bin=vue-tsc
      echo "== $bin ${r#"$GIT_ROOT"/}"
      (cd "$r" && run env NODE_OPTIONS=--max-old-space-size=6144 "node_modules/.bin/$bin" --noEmit -p tsconfig.json --pretty false) \
        || status=$?
    done
    ;;
  full)
    roots="$(changed_files HEAD | roots_for is_vitest_root)"
    [ -z "$roots" ] && roots="$(nearest "$(git -C "$GIT_ROOT" ls-files '*vitest.config.*' | head -1)" is_vitest_root)"
    for r in $roots; do vitest_root "$r" || status=$?; done
    ;;
  *) echo "unknown mode: $mode (changed | files | typecheck | full)" >&2; exit 2 ;;
esac
exit $status
