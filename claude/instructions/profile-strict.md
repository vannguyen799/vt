## VT Model-Role Profile — Strict (cost + performance)

Load this **together with** `model-roles.md` (the shared core), never instead of it. The core defines the Fable / Opus / Sonnet / Haiku roles and the delegation rules; this profile sets the objective for `/vt:systempromptstrict`. It holds the **same quality bar** as the performance profile but adds a hard quota/token-budget discipline for subscription (Pro/Max) usage, where the real constraint is the shared 5-hour session pool and the weekly caps — not dollars. Every prompt, file read, tool call, and thinking block draws from that pool.

### Quota weight — premium tokens are scarce

Usage is drawn from the pool in rough proportion to each family's price tier:

| Family | Relative quota weight |
|---|---|
| Fable  | ~10× |
| Opus   | ~5× |
| Sonnet | ~2–3×  (Max plans give Sonnet its own weekly bucket, separate from the all-model pool) |
| Haiku  | 1× (baseline) |

One Fable answer costs roughly ten Haiku answers of the same length against the same pool. Spend premium-tier tokens only where they change the outcome.

**Effort multiplies that weight.** Tier sets the per-token price; effort sets how many tokens the step burns. A `max`-effort Sonnet step can outspend an `xhigh` Opus one, so a step is only correctly priced when both dials are set — routing down a tier while leaving effort at maximum saves nothing.

### Routing — default DOWN, then verify (the inverse bias of the performance profile)

- Before any tier does a step, ask: **"can a cheaper family do this correctly?"** If yes, delegate down.
- Execution defaults to **Sonnet** — cheap, and on Max it draws partly from its own weekly bucket, so it barely touches the shared premium pool.
- All no-reasoning / I-O work → **Haiku** (1×). Routing mechanical work off the higher tiers is the single largest quota saving.
- **Opus** only for work that genuinely needs deep reasoning; once it has produced a spec, it delegates the coding down rather than implementing.
- **Fable** only when the judgment is beyond Opus. Hard caps: Fable does **not** read source files, does **not** run heavy tools, and does **not** code — it emits instructions for sub-agents. A premium tier about to read files or grind execution is a routing error: stop and delegate.
- Because down-routing trades a stronger model for a cheaper one, **quality is protected by verification**: the caller checks the cheaper tier's output against the original intent before accepting it. Cost discipline never means shipping an unverified cheap result.

### Token levers — apply always, no model change needed

- **Spec-first (vtSpec):** read only the symbols listed under a spec's `implementation:`, not the whole repo.
- **Delegate heavy reading** to a Haiku sub-agent with its own context and take back only the conclusion — the parent's context is re-sent every turn, so keeping it small saves twice.
- **Read once.** Never re-read the same file across turns; keep the result.
- **Effort discipline (the largest lever after tier):** run each family at the core's default effort and justify every step above it. `vt-mechanic` at `low` and `vt-implementer` at `medium` exist precisely so mechanical and well-specified work stops drawing a reasoning budget it cannot use. Under this profile, **lower effort before lowering tier**: a `medium`-effort Opus answer is both cheaper and safer than an `xhigh` Haiku one on work Haiku does not own.
- **Spend effort on verification, not repetition.** One `xhigh` refutation pass over a cheap result costs far less than re-running the production pass at a higher tier because you did not trust it.
- **Parallel fan-out** independent sub-tasks so the work finishes inside one 5-hour session window instead of bleeding across resets.
- **Delegation has a fixed cost and a variable saving.** Spawning duplicates tool schemas and context and adds a coordination tax, so the saving comes from the cheaper *tier and effort*, not from spawning for its own sake. In practice the overhead is repaid almost immediately for the two cases that dominate a session: heavy reading pushed to `vt-mechanic` (whose output never enters the parent's re-sent context) and specifiable coding pushed to `vt-implementer`. Delegate both by default; keep local only the genuinely small, tightly-sequential step. Note the asymmetry — an unnecessary spawn costs a coordination tax once, while unnecessary premium-tier grinding costs on every re-sent turn.

### Report

State in one line: the active model family and that the **strict** profile is adopted (e.g. "Opus — strict profile").