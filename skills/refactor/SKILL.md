---
name: refactor
description: Review and refactor a codebase or an area of it — dedupe logic into shared utils, interfaces and abstractions, split oversized modules, delete dead code, and trim API and stream payloads to what consumers use — with behaviour preserved and every change verified. Use when the user asks to review, clean up, simplify, shorten, restructure, or optimize code, or to make APIs or streams send less data.
---

# Refactor — less code, same behaviour, proven

A refactor succeeds when the code is **smaller or clearly simpler**, its **behaviour is unchanged** (or changed only
where the user allowed it, and listed), and **every claim is verified**. Moving code around is not success.

```
survey → ask (one batch) → plan areas → execute (parallel when areas are disjoint) → integrate → verify → report
```

Language-specific traps live in `references/` — read only the ones for the stacks you touch (see *References*).

## Model Delegation (Claude only)

The survey and plan need reasoning (Opus tier). Execution across disjoint areas fans out to `vt-deep-implementer`
(design adapts while coding) or `vt-implementer` (mechanical codemods with a complete brief). The parent integrates and
verifies; use `vt-verifier` on payload or contract changes. Every brief points to `references/agent-brief.md` and
names the agent's ownership area. Never run two agents on overlapping files.

## 1. Survey before deciding

- Read the repo's agent instructions and any spec index (e.g. `.vtspec/`) first. Spec-first rules apply.
- **Cover every file in scope, not just the large ones.** Most duplication hides in many small files that each copy
  the same few lines. File size is only one signal.
- Measure: file counts per area, the largest files, generated vs hand-written code, test runner and typecheck commands.
- Build a **duplication map** across the whole scope. Group copies of the same helper, pattern, type shape, query or
  schema into clusters, with every location and a proposed single home. Then add dead exports, boilerplate that a
  generator or base helper could absorb, and payloads larger than their consumers need.
- Learn the repo's structure conventions (where utils, types, composables or services live; naming; layering) and
  place every new shared piece inside them. Redesign for reuse within the existing structure, not beside it.
- Check the working tree: uncommitted files and other live sessions in the same checkout. Snapshot the dirty file list
  as the **baseline**, because those files belong to someone else.

## 2. Ask once, then run

Ask every open decision in one batch, each with a recommended option, then don't stop to ask again:

- **Isolation:** a separate branch or worktree (recommended when the tree is dirty or shared) or the current checkout.
  Never create either without the user's explicit OK.
- **Scope:** which areas, in order of payoff.
- **Depth:** behaviour-preserving only, or API and payload changes allowed.

## 3. Plan areas

Split the work into **ownership areas with disjoint files**. Assign each shared surface (a stream, a generator, a
types module) to exactly one owner. Cross-area contracts stay compatible: same exported names and signatures, and
re-exports from the old path when a module moves.

## 4. Rules while executing

**Goal — the result must be shorter or simpler**
- Prefer, in order: **delete** (dead code, unused fields) → **dedupe** (one helper for N copies) → **use what exists**
  (a library already in the dependency manifest, an existing util) → **restructure**.
- An abstraction must remove real duplication: at least three call sites, or two with substantial logic. No
  speculative layers, no pass-through wrappers, no barrel files except to keep an old import path working.
- **Splitting a file has a cost.** Every new module adds imports, a props/params contract and glue. Split only along
  independent concerns, and say so if the total line count rises. A smaller largest file at the price of 20% more code
  overall is a trade-off to report, not a win to claim.
- Change generators, not their generated output. Keep the regenerate/check workflow working for everyone else.

**Behaviour**
- Same behaviour by default. List every edge-case difference you introduce, even small ones (error text precedence,
  ordering of equal keys, swallowed vs. thrown errors).
- Pre-existing bugs you find: report them. Don't fix them silently inside a refactor.

**Leaner APIs and streams** (only when the user allowed it)
- Remove a field only after proving no consumer reads it: grep every client, server module, script, test, and any
  tool or agent output that is built from it. Change the producer and its consumers in the same run.
- Streams: deltas carry only what changed. Never duplicate a value already carried by the transport (event id, URL).
  A fresh connect or resume still gets a complete snapshot, and a sequence gap still forces a resync.
- When a consumer you may not edit reads a field, keep that field.

**Shared working tree**
- Never edit a baseline file, or a file another session dirtied after the baseline was taken. Re-read a file right
  before you edit it, and use exact-match edits.
- Never stash, reset, restore, switch branches, or commit unless the user asked you to.
- Leave every file compiling at every stopping point. An interrupted agent must first finish its half-written edits
  when it resumes.

**Docs and specs:** when you move or rename a symbol that a spec or doc index names, update it in the same change.

## 5. Verify

Follow `${CLAUDE_PLUGIN_ROOT}/claude/instructions/test-policy.md`:
- Run the tests affected by each area, not the whole suite.
- Run the typecheck once per area near the end, serialised machine-wide (`flock`) when agents run in parallel.
- Run the generator's `check` mode if one exists.
- Never point tests at a production database. A run you skipped is reported as skipped, not passed.
- Attribute failures: yours, another agent's in-flight work, or a baseline file. Fix only yours.
- Visible UI changes: capture before/after screenshots against a non-production server. If none is available, say so.

## 6. Report

Lead with the result, not the process:
- **Net line delta per area**, from `git diff --shortstat` plus new files. Say plainly when a delta is positive.
- What was deduped into what (helper → number of copies replaced), what was split, and what was deleted.
- An **API/payload change table**: endpoint or event, fields removed or reshaped, consumers updated.
- Behaviour differences, pre-existing bugs found, and skipped items with their reasons (baseline files, ownership).
- Verification: the exact commands and their real results.

## References

Read only what applies:

| Stack touched | Reference |
|---|---|
| TypeScript / JavaScript (Node, bundlers) | `references/typescript.md` |
| Vue / Nuxt | `references/vue-nuxt.md` |
| Python | `references/python.md` |
| Go | `references/go.md` |
| Briefing parallel agents | `references/agent-brief.md` |

No reference for your stack: apply the rules above as written. They are language-neutral.
