# Briefing a refactor agent

Write the shared rules once into a file (e.g. `/tmp/<repo>-refactor-rules.md`) and point every agent at it, so that
briefs stay short and identical. Each brief adds only:

1. **Ownership:** the files and globs it may edit, plus what is explicitly not its own (sibling areas, baseline files,
   consumers owned by another agent).
2. **Targets:** the largest files, the suspected duplication and the payloads to trim, with line counts from the survey.
3. **Depth:** behaviour-preserving only, or which kinds of API change are allowed.
4. **Contracts to keep:** exported names, component props/events, generator workflow, routes that other sessions use.
5. **Verification commands:** the exact test invocation, the serialised typecheck, the generator check.
6. **Report shape:** see SKILL.md §6.

The shared rules file carries:
- Repo path and branch, with: no branch changes, no stash, no commit.
- The path of the baseline dirty-file list and the rule to re-check `git status` before each edit.
- SKILL.md §4, condensed.
- The machine's CPU limits: only related tests, and a typecheck serialised with
  `flock /tmp/<repo>-typecheck.lock nice -n 5 <cmd>`.

Resuming an interrupted agent: tell it to inspect its own diff, finish half-written edits so everything compiles, then
continue. Hand it follow-ups that sibling agents left in its area.
