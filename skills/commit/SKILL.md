---
name: commit
description: Analyze Git working-tree changes, organize them into focused Conventional Commits, create the commits, and push the current branch safely. Use when the user asks to commit, commit and push, create logical commits, run a smart commit workflow, or explicitly invokes commit or vt:commit.
---

# Smart Commit

Create focused commits from the current repository and push them without mixing unrelated work or exposing secrets.

## Model Delegation (Claude only)

This rule applies only when this skill runs on Claude (Claude Code or Claude Cowork); it does not apply on Codex or ChatGPT Work.

Only if the VT Codex model role was activated by `/vt:codex-model-role` in the current conversation or by an explicit directive in an applicable `CLAUDE.md` does its **Commit workflow override** take precedence: delegate this entire workflow to the plugin's Codex MCP agent rather than Sonnet. An ordinary chat prompt or MCP availability alone is not activation, and command activation from a previous conversation does not carry over. Pass this skill's complete instructions and the user's request, do not override the user's configured Codex model, and validate the resulting Git state. If Codex MCP is unavailable or fails, fall back to the normal rules below. Never run Codex and Sonnet concurrently against the same Git index or working tree.

Sonnet is the execution tier for this workflow (see `claude/instructions/model-roles.md`). Before doing any of the steps below, check the active model:

- If the active/orchestrating model is a higher tier than Sonnet (Fable or Opus), do not run the workflow yourself. Spawn a Sonnet sub-agent and delegate the entire commit workflow to it — inspection, staging, commit creation, verification, and the push — passing it this skill's instructions plus any user-specific context. Review and validate the sub-agent's result before reporting it to the user; delegation does not transfer final accountability.
- If the active model is Sonnet or a lower tier (Sonnet, Haiku), run the workflow directly without spawning a sub-agent.

## Inspect the Repository

1. Confirm that the current directory is inside a Git repository.
2. Run `git status --short --branch`, `git diff --stat`, `git diff`, and `git diff --cached`.
3. Inspect every untracked file that may be included. Do not infer its purpose from its name alone when its contents can be checked safely.
4. Identify the current branch, upstream, and remotes before committing or pushing.
5. Treat all existing changes as user work. Do not rewrite, discard, or revert them.

If there are no changes to commit, report that and stop. If the repository is in the middle of a merge, rebase, cherry-pick, or revert, stop and explain the state instead of creating commits.

## Protect Sensitive and Generated Files

Never stage secrets, credentials, private keys, local environment files, logs, caches, dependencies, coverage, or build output. Common exclusions include:

```text
.env
.env.*
*.pem
*.key
*.crt
*.log
node_modules/
dist/
build/
coverage/
.cache/
.next/
.nuxt/
```

Honor repository-specific ignore rules and instructions. If a suspicious file is already staged, stop and tell the user before committing it. If an untracked file's purpose is ambiguous, ask before including it.

## Plan Logical Commits

Classify changes with Conventional Commit types:

- `fix`: bug fixes
- `refactor`: restructuring without behavior changes
- `style`: formatting, whitespace, or lint-only changes
- `perf`: performance improvements
- `chore`: tooling, dependencies, or configuration
- `feat`: new functionality
- `docs`: documentation only
- `test`: tests without production behavior changes
- `build`: build-system or dependency changes
- `ci`: continuous-integration changes

Use one purpose per commit. Keep files from the same implementation together, including its tests. Separate unrelated features and fixes. When practical, order independent commits as `fix`, `refactor`, `style`, `perf`, `chore`, `build`, `ci`, `feat`, `test`, then `docs`; dependency or prerequisite relationships take precedence.

Preserve the user's staging intent. If the existing index combines unrelated changes or conflicts with the required grouping, ask before reorganizing it. Use non-interactive staging where possible; use patch staging only when a file genuinely contains separable changes.

## Verify Before Committing

Run focused tests, lint, type checks, or other repository-prescribed validation appropriate to the affected code when feasible. Do not silently fix unrelated failures. Report validation failures and do not commit known-broken changes unless the user explicitly directs otherwise.

Review the staged diff before every commit with `git diff --cached --check`, `git diff --cached --stat`, and `git diff --cached`. Confirm that it contains exactly one planned purpose.

## Create Commits

Stage only the paths or hunks for the current logical change and commit with:

```text
<type>(<scope>): <description>
```

The scope is optional. Use an imperative, lowercase description with no trailing period and keep the subject under 72 characters. Do not add `Co-Authored-By`, AI attribution, or signatures unless the user explicitly requests them.

After each commit, record its short hash, subject, and file count. Continue until every intended change is committed or explicitly skipped.

## Push Safely

Push only the current branch. If it already has an upstream, run `git push`. Otherwise, when `origin` is clearly the correct remote, run `git push -u origin <current-branch>`.

Never force-push. If the remote is ambiguous, the branch is detached, the push is rejected, or authentication fails, stop and report the exact issue rather than changing history or credentials.

## Report Results

Summarize:

- commits created, with short hashes and subjects
- validation performed and its result
- files or changes intentionally skipped
- push destination and outcome

If any step was not completed, state it explicitly.
