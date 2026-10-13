# Agent Docs Policy — keep `CLAUDE.md` / `AGENTS.md` lean

Applies to every agent that writes `CLAUDE.md` or `AGENTS.md` (any casing, any level), and to text a plugin hook
injects (`SessionStart`, `UserPromptSubmit`, …). All of it loads into every session, so every line costs on every
turn: inject one line per rule plus the path of the file that holds the detail.

## Keep in the file

- Hard rules: what must / must never be done (git, deploy, data, secrets, tests).
- Non-obvious conventions a wrong guess would break (build/test commands, required tools).
- Authorizations that only count when written there (e.g. the VT delegation mandate).
- An index: one line per detail file — path + when to read it.

One imperative line per rule. No narrative, history, or anything the code / `git log` already shows.

## Move out

Structure, architecture, module maps, descriptions, glossaries, definitions, long procedures → topic files under
`.claude/` (Claude Code) or `.agent/` (agent-neutral `AGENTS.md`), e.g. `.claude/docs/architecture.md`. Reuse an
existing docs folder if the repo has one; with both index files, keep one copy and point both at it.

## Rules

- **Don't bloat.** Before adding, check whether a line can be cut or merged; prefer tightening over appending.
- **Don't repeat.** If another file (README, docs, skill, spec, another instruction file) already describes it, link
  to it — never restate it. One fact, one place; delete the old copy when moving content out.
- **Reference by plain path + trigger**, not `@`-import — `@path` inlines the file into every session. `@` only for
  short rule files that must always be in context.
- Editing an existing bloated file: move content out only when asked for a cleanup; otherwise flag it as a follow-up.
