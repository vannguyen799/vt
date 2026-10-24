# VT

Cross-platform agent workflows for Codex, ChatGPT Work, Claude Code, and Claude Cowork, covering the whole Git surface: issues, branches, commits, and pull requests.

## Commands

- Claude Code and Claude Cowork: `/vt:commit`, `/vt:issue-create`, `/vt:issue-triage`, `/vt:issue-process`, `/vt:issue-review`, `/vt:test`, `/vt:systemprompt`, `/vt:systempromptstrict`, `/vt:codex-model-role`
- Codex: invoke the bundled `commit`, `issue-*`, `test`, `systemprompt`, or `systempromptstrict` skill explicitly, or describe what you want done
- ChatGPT Work: select `VT` or one of its skills

The commit workflow inspects all changes, protects secrets and generated files, creates focused Conventional Commits, verifies each staged diff, and pushes the current branch without force-pushing. Invoked inside a working session, it commits only the changes that session produced and reports the rest as skipped; it falls back to the whole working tree only when the session has no work of its own to attribute.

## Issue, branch, and pull-request workflows

Issues and pull requests are **not Git** — Git has no concept of them. They belong to the *forge* (GitHub, GitLab, Gitea/Forgejo) and are reached through its CLI or API. VT detects the host from `git remote get-url origin` and the CLIs actually installed, rather than assuming GitHub; the per-host command vocabulary lives in one file, `claude/instructions/forge.md`, so a CLI change is fixed in one place.

| Command | What it does |
|---|---|
| `/vt:issue-create` | Turns a sentence, a sentence plus a screenshot, or a rough idea into a well-formed issue — investigating the repository to fill in what the reporter did not write |
| `/vt:issue-triage` | Surveys open issues and saved idea drafts, classifies them, finds duplicates and stale threads, recommends what to do next |
| `/vt:issue-process` | Confirms the symptom, creates a branch or worktree, implements, tests, commits through the `commit` skill, pushes, and opens a linked pull request |
| `/vt:issue-review` | Checks whether a pull request truly resolves the issue it claims to close, and whether its verification claims are real |

### The asymmetry these workflows are built around

A commit is local until it is pushed. **Every forge write is public the instant it happens** — it notifies watchers, consumes a permanent number, and cannot be undone. An issue is never deleted, only closed. So reading (list, view, search) is free and used generously, while every write is shown in full and confirmed first.

Some consequences worth knowing before you use it:

- **You do not have to write the report.** Give it one line, or a line and a screenshot. It reproduces the failure, or maps the screenshot to a component by grepping the visible strings (following i18n keys when the app is localized), and reads versions from the machine. It asks at most three questions, and only ones it cannot look up itself.
- **It separates what it confirmed from what it inferred**, in every issue body. That is what lets it be useful without fabricating: a hypothesis is allowed, presenting it as established is not. The same rule governs a pull request's verification section, where a fabricated "tests pass" line would make a reviewer skip checking.
- **Ideas become local drafts**, in `.vt/drafts/`, not issues. Ideas are the category most often abandoned or rewritten; filing each one pollutes the tracker and notifies people for nothing. `/vt:issue-triage` lists drafts alongside issues and promotes them on request.
- **A branch is one root cause, not one issue.** Several issues with a shared root cause are fixed together with a closing keyword for each; issues with different causes stay separate even when they touch the same file, so a bad fix can be reverted on its own.
- **A dirty working tree means a separate worktree.** Your uncommitted work is never stashed or checked out over. A clean tree uses an ordinary branch, because a worktree checks out tracked files only — `node_modules`, `.venv`, and `.env` are absent, so tests will not run until dependencies are installed.
- **It asks in proportion to blast radius.** Branches, worktrees, local drafts, and self-assignment reach nobody but you, so it just does them. Anything landing in someone else's notifications is shown in full first; approving, merging, and closing another person's issue always need an explicit instruction. Say "just file issues, don't ask" and it lifts the middle tier for that conversation.
- **It will not run an outside contributor's code before reading it.** Checking out a PR and running its tests is arbitrary code execution under your credentials, so the diff is inspected for touched CI files, lifecycle hooks, swapped dependencies, and credential reads before anything is executed.
- **Review feedback arrives as one batched review**, not eight separate comments — eight comments is eight notifications, out of order and without the summary that explains them.
- **It replies when the state changes.** A forge cross-reference tells the reporter that a PR exists, never what was wrong — so the root cause, a refusal, a duplicate, a block, or a close each get a one-line reason. Empty "starting work" and "PR is open" comments do not.
- **Approving and merging happen only when you say so.** An approval is an attestation under your account, and a merge rewrites the default branch and often triggers a deploy. Neither is ever taken on the agent's own initiative, and a requested merge is preceded by checking the rollup, the approvals, the draft state, conflicts, and the base branch — with the merge method left to you.
- **In an organization it checks before acting**: who the issue is assigned to (it will not duplicate a colleague's in-flight work), whether you have write access at all, whether the default branch is protected, and what `CONTRIBUTING.md`, the PR template, and `CODEOWNERS` require. It self-assigns when it starts, and assigns other people or requests a team review when you tell it to — never off its own guess about whose area the code is.

The rules are split by what each workflow needs: `claude/instructions/issue-policy.md` (safety, content, organization) is loaded by all four skills, and `claude/instructions/pr-policy.md` (branch, worktree, pull request) only by `issue-process` and `issue-review` — so filing and triaging issues does not pay for the pull-request half. Only a four-rule kernel (`claude/instructions/forge-kernel.md`) is always on, so a session that never touches the forge pays almost nothing.

## Model-role guidance

VT selects model routing for the executing harness before loading a provider's roles. `claude/instructions/runtime-routing.md` is the entry point: Claude loads the core and profiles below; Codex loads `claude/instructions/codex-model-roles.md`, which has its own performance and strict objectives. The Codex reference includes dated official sources, model/effort starting points, and fallback rules for the live tool schema. These are workload heuristics awaiting benchmarks, rather than a proven optimum.

Claude's model-role policy is split into a **shared core** plus two **profiles**, so both variants stay in sync and only their optimization objective differs:

- `claude/instructions/model-roles.md` — the **shared core (ref)**: the Fable / Opus / Sonnet / **Haiku** role definitions, spawn triggers, and delegation rules. Fable orchestrates and plans (never codes), Opus reasons and researches, Sonnet executes, Haiku handles mechanical and I/O work. This is the single source of truth for the roles; it is never loaded alone.
- `claude/instructions/profile-performance.md` — the **performance** objective: route each task to its strongest-fit family for correctness first; when a tier might be too weak, go up.
- `claude/instructions/profile-strict.md` — the **strict / cost** objective: same quality bar with a hard quota/token-budget discipline for subscription (Pro/Max) usage — default work down to the cheapest correct tier, keep premium contexts tiny, then verify.
- `claude/instructions/git-identity.md` — the always-on **Git commit identity** policy, loaded next to whichever profile is active (see below).
- `claude/instructions/forge-kernel.md` — the always-on **forge-write kernel**: three rules covering any issue, comment, label, or pull-request write, including ad-hoc `gh`/`glab`/`tea` calls made outside the `issue-*` skills.
- `claude/instructions/agent-docs-policy.md` — the always-on **agent-docs** rule: `CLAUDE.md` / `AGENTS.md` keep only rules and a reference index; structure, descriptions, and definitions live in `.claude/` or `.agent/` files referenced by path, with no bloat and no content repeated from other files.
- `claude/instructions/delegation-mandate.md` — the **delegation mandate**: the authorization that actually lets routing happen, plus the `vt-*` sub-agent table. See *Making delegation actually fire* below — without it the policy is advisory only.

Each surface loads its own routing policy, plus the Git identity policy and the forge-write kernel:

- **Claude Code** injects a compact brief through a `SessionStart` hook: the active role when the family is recognized, the most common spawn triggers, and one short line plus a file path per always-on rule (Git identity, tests, forge writes, agent docs). The `vt-*` sub-agent descriptions are not repeated — Claude Code already lists them. It points at the full files instead of inlining them, so the full policy is read only when needed or loaded explicitly with `/vt:systemprompt`. A `UserPromptSubmit` hook also detects commit or push intent and points Claude at `/vt:commit` and `git-identity.md` without restating them.
- **Claude Cowork** runs its own harness and does **not** fire plugin hooks, so nothing is injected automatically. Load the policy on demand: `/vt:systemprompt` (core + performance) or `/vt:systempromptstrict` (core + strict). Both read the same core and apply the role for the active model family.
- **Codex and ChatGPT Work** register their own `SessionStart` and `SubagentStart` hooks through `.codex-plugin/plugin.json`. After the host reviews and trusts the hooks, and where Node and the scripts are available, the main thread receives Codex reference pointers and children receive a compact policy brief. If hooks are unavailable, use the bundled `systemprompt` or `systempromptstrict` skill; it selects the native Codex policy instead of Claude's model table. Installing the plugin alone does not grant hook trust.

Commands, skills, and hooks reference the selected policy rather than embedding separate copies. The Claude profiles carry their differing objectives; native Codex objectives live in its own reference. The forge likewise uses `issue-policy.md` and `forge.md` from the `issue-*` skills.

The hook command explicitly identifies its harness (`--runtime=claude` or `--runtime=codex`). Its environment fallback checks Codex's `PLUGIN_ROOT` before `CLAUDE_PLUGIN_ROOT`, since Codex supplies both. Model family detection stays separate: calling the Codex MCP specialist from Claude does not turn the parent into a Codex session.

Both harnesses have separate main and child briefs. `SubagentStart` injects references and shared rules into each child, including generic agents; Claude's named `vt-*` agents also keep their own role definitions. The child brief preserves the assigned model/effort and bounded task. The parent still supplies task context and the active strict/performance objective; hook injection does not copy session history or require recursive delegation. Hook output cannot change the child's model/effort. See [Claude SubagentStart](https://code.claude.com/docs/en/hooks#subagentstart) and [Codex hooks](https://learn.chatgpt.com/docs/hooks).

### Sub-agents and effort

In Claude Code, VT ships five sub-agents, each configured with a model family **and** a reasoning effort. Codex uses its native tools and the separate reference above; these Markdown agent definitions are for Claude. Host-level overrides can still take precedence over an agent definition.

| `subagent_type` | Family / effort | Dispatch for |
|---|---|---|
| `vt-mechanic`         | Haiku / `low`     | reads, greps, symbol lookup, running a command, log triage |
| `vt-implementer`      | Sonnet / `medium` | implementation from a complete brief (what / why / how) |
| `vt-deep-implementer` | Opus / `high`     | coding whose design resolves only while it is written |
| `vt-reasoner`         | Opus / `xhigh`    | analysis, research, architecture, debugging strategy — read-only |
| `vt-verifier`         | Opus / `xhigh`    | adversarial verification of a high-stakes result — read-only |

There is deliberately no Fable sub-agent: Fable is the orchestrator, so it is the parent in this tree, never a child of it.

**Effort is the second dial.** Tier decides *who* thinks; effort decides *how hard*, on a `low` → `medium` → `high` → `xhigh` → `max` scale, and a step costs roughly `tier weight x effort`. Two rules follow, and they point in opposite directions by design:

- **Raise effort before raising tier.** Thinking longer on the family that owns the work is cheaper and usually more accurate than escalating to one that does not. Escalate only when the *kind* of judgment needed is beyond the current tier — not when it merely needs longer.
- **Lower effort before lowering tier.** A `medium`-effort Opus answer beats an `xhigh` Haiku one on work Haiku does not own. Routing down while leaving effort at maximum saves nothing.

`max` effort on a rename wastes exactly as much as Fable running greps; `low` effort on an architectural call is the same defect as handing reasoning to Haiku. The per-family defaults and the full table live in `model-roles.md`.

### Making delegation actually fire

Claude Code's built-in default is to leave the `Agent` tool alone unless **the user, a `CLAUDE.md`, or a skill** asks for it. A `SessionStart` hook injects *context*, which does not clear that bar — so VT's roles could load correctly on every session and still produce no sub-agent calls at all. The roles describe the routing; they do not authorize it.

`claude/instructions/delegation-mandate.md` is the authorization, and it has to arrive through a channel that counts. Pick one:

- **User-level (recommended)** — add `claude/instructions/claude-md-stub.md` to `~/.claude/CLAUDE.md`. It is a few lines: the one-sentence authorization (which must live in `CLAUDE.md` itself) plus *detect → file* pointers, so the full mandate and policies are read only when their trigger fires. Do not `@`-import the full files there — an import inlines them into every session.
- **Per project** — add the one-sentence authorization to the repository's `CLAUDE.md` and reference `delegation-mandate.md` by path (an `@`-import would inline it into every session). This repo's own `CLAUDE.md` does exactly that.
- **Per session** — run `/vt:systemprompt` or `/vt:systempromptstrict`. Invoking the command is itself the request, so it unlocks delegation for that conversation without any file change.

Two failure modes the mandate is written to block. **Resolving to delegate is not delegating** — a turn that concludes the work belongs to Sonnet and then writes the code anyway has mis-routed, because delegation is a tool call. And **a generic sub-agent inherits the parent's model** — if you fall back off the `vt-*` agents to a generic `subagent_type`, pass `model:` explicitly, or your "delegation to Sonnet" silently runs on Opus and saves nothing.

### Git commit identity

`claude/instructions/git-identity.md` is loaded on every surface alongside the model-role core, and the `commit` skill repeats it as a workflow step. The rule: commits carry the **user's own** Git identity, never one derived from an agent's login or auth session — not the Claude/Anthropic or Codex/OpenAI account, not the harness-provided session email, not a bot or no-reply address.

Before the first commit, VT resolves `git config user.email` / `user.name`:

- Configured (globally, or via a deliberate repository-local override) and not an agent identity → commit with it silently, no questions.
- Missing, or set to an agent identity → stop and ask the user for the name and email, offering `git config --global user.name/user.email` (or `--local` for a per-repository identity).

VT never writes identity configuration on its own and never passes `git -c user.email=…`, `--author=…`, or `GIT_AUTHOR_*` / `GIT_COMMITTER_*`; Git resolves the author from the verified configuration. AI-attribution trailers stay off unless the user asks for them.

### Test policy and the `test` runner

`claude/instructions/test-policy.md` is summarized by the `SessionStart` hook and referenced by `vt-implementer`, `vt-deep-implementer`, `vt-verifier`, and `/vt:issue-process`. The rules:

- **Scope every run to the change.** Run the tests the change can affect and type-check only the packages that changed; the whole suite runs once at the end of a cross-cutting change, on request, or in CI.
- **Run proportionally.** Docs, copy, and styling need nothing; a small local edit needs a type check; a behaviour change adds the affected tests. A skipped run is reported as skipped, never as passing.
- **Write only tests that earn their cost**: business rules with branches, pure planners and resolvers, data mapping, migrations, and a regression test per bug — not wiring, thin controllers, UI layout, snapshots, or mock-restating tests.

`/vt:test` ships `skills/test/scripts/vt-test.sh` for JavaScript/TypeScript repositories: `changed [ref]` (vitest `--changed`, following the import graph), `files <path...>`, `typecheck` (tsc / vue-tsc for changed packages only), and `full`. It handles monorepos with several vitest configs, runs `--no-isolate` (about twice as fast) and re-runs failing files isolated so leaked state cannot fake a failure, uses half the cores, and — where `nice`, `ionice`, and `flock` exist — lowers priority and takes a machine-wide lock so parallel agents and projects queue instead of overloading a shared machine. `VT_TEST_WORKERS` pins the worker count (e.g. `2` on a small VPS).

### Codex review and testing role

This role is opt-in and disabled by default. Run `/vt:codex-model-role` in Claude Code or Claude Cowork to enable it for the current conversation, or add an explicit enabling directive to an applicable `CLAUDE.md` for repository-scoped activation. Ordinary chat prompts, merely installing VT, and having its MCP tools available do not activate the role; new conversations start with normal VT routing unless an applicable `CLAUDE.md` enables it.

Recommended `CLAUDE.md` directive:

```md
Enable the VT Codex model role for this repository. Prefer the
`mcp__plugin_vt_codex__codex` agent for review, testing, and the VT commit
workflow; use `codex-reply` for focused follow-ups. Do not override the model
configured in Codex. Validate Codex's output, and fall back to normal VT model
routing if the Codex MCP server is unavailable.
```

Once enabled, Codex acts as an external specialist for code review, test planning and execution, coverage gaps, regression checks, and independent verification. VT starts `codex mcp-server` from its bundled `.mcp.json`, giving Claude the `codex` and `codex-reply` MCP tools. Claude Code's built-in `Agent` tool cannot switch to a Codex provider; the MCP server is the provider bridge. Non-interactive `codex review` and `codex exec` remain fallbacks when MCP is unavailable.

VT deliberately does not send the MCP `model` override or CLI `--model`. Codex uses the concrete model and profile already selected in the user's Codex configuration. Claude scopes the task, invokes Codex, validates its evidence, and integrates the result. While this role is active, `/vt:commit` also prefers the Codex MCP agent over the normal Sonnet delegation path; Sonnet remains the fallback if MCP is unavailable.

## Install in Claude Code

```text
/plugin marketplace add vannguyen799/vt
/plugin install vt@vt
/reload-plugins
```

**Then do the one step the installer cannot do for you:** add the compact delegation stub to
`~/.claude/CLAUDE.md`, or the `CLAUDE.md` of each project you want it in.

```bash
cat ~/.claude/plugins/marketplaces/vt/claude/instructions/claude-md-stub.md >> ~/.claude/CLAUDE.md
```

The stub keeps `CLAUDE.md` to *detect → reference file*: it carries only the authorization
sentence and paths to the full mandate and policies. Other plugins (e.g. vtspec, vtmigr) can
add their own one-line pointers in the same list.

Without it the plugin installs cleanly, the roles load on every session, and the `Agent`
tool still never fires — Claude Code only delegates when a user, a `CLAUDE.md`, or a skill
asks, and a `SessionStart` hook is none of the three. If you would rather not touch a
`CLAUDE.md`, run `/vt:systemprompt` at the start of a session instead; it unlocks
delegation for that conversation. See *Making delegation actually fire* above.

For local development:

```bash
claude --plugin-dir /home/user/plugins/vt
```

## Install in Codex and ChatGPT Work

Add the repository as a plugin marketplace, install `vt`, and start a new session so the bundled skill is discovered. During local development, the personal marketplace entry points to `/home/user/plugins/vt`.
