---
name: issue-process
description: Take an issue through its full lifecycle — confirm the symptom, create a branch or worktree, implement, test, commit, push, and open a linked pull request that closes it. Use when the user asks to work on, fix, implement, or process an issue by number, or to turn a filed issue into a pull request.
---

# Process an Issue

One issue in, one linked pull request out. The flow is fixed:

```
read issue → confirm the symptom → branch (or worktree) → implement → test
           → commit skill → push → open PR (Closes #N)
```

Read `${CLAUDE_PLUGIN_ROOT}/claude/instructions/issue-policy.md` (safety, content,
organization), `${CLAUDE_PLUGIN_ROOT}/claude/instructions/pr-policy.md` (branch, worktree, pull request), and
`${CLAUDE_PLUGIN_ROOT}/claude/instructions/forge.md` before starting.

## Model Delegation (Claude only)

Applies on Claude Code and Claude Cowork only. This is implementation work — Sonnet's tier.
Fable or Opus does not run it: delegate the whole workflow to a Sonnet sub-agent with this
file's instructions, the issue's full text, and the confirmed root cause, then validate the
diff, the tests, and the resulting PR before reporting. Sonnet or Haiku runs it directly.

If the VT Codex model role is active in this conversation, prefer the Codex MCP agent for
implementation and verification, and never run it concurrently with Sonnet against the same
working tree.

## Read the issue completely

Fetch the issue with its comments. The decisive information — a narrowed reproduction, a
maintainer's constraint, a rejected approach — is usually in the discussion, not the
description.

Establish what "done" means before writing code. If the issue has acceptance criteria,
those are the target. If it does not, state your interpretation before implementing, so a
wrong reading costs a sentence rather than a branch.

## Confirm the symptom before creating anything (C6)

**This is the step that must not be skipped.** Without it you may spend a session fixing
something that was never broken.

Verify by whatever means the symptom allows:

- Can the app or test be run? Run it and observe the failure directly. On Claude Code the
  `run` skill can launch the app and capture a screenshot to compare against a reported one.
- Cannot run it? Then at minimum locate the responsible component and be able to explain
  the mechanism that produces the symptom.

If you cannot locate the component, **stop**. Do not create a branch, do not implement.
Comment on the issue describing what you searched and what you would need.

## Check ownership and access before creating anything

Read the issue's **assignee** (E2). Already assigned to someone else → do not start; ask
the user, or comment offering to help. Duplicating a colleague's in-flight work wastes a
session and creates a conflict nobody asked for. Unassigned or assigned to you is clear.

Then check what you are actually allowed to do (E5):

```bash
gh repo view --json viewerPermission,defaultBranchRef
```

No write access means the contribution goes through a **fork**, not a branch on the origin
— establish that now, not after the push fails. A protected default branch is normal in an
organization, never something to work around.

Self-assign as you begin (E1) — no confirmation needed; that is the signal that stops
someone else picking up the same issue. Assigning *another* person or a team is allowed
only when the user asks for it, and never to take an assignment away from someone.

Read `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, and `CODEOWNERS` if present;
where they contradict the defaults here, they win and you say so in the report (E3).

## Decide branch or worktree (C8)

| Situation | Decision |
|---|---|
| Working tree has uncommitted changes | **Worktree.** Never stash, never check out over the user's work. |
| Clean tree, single issue | Ordinary branch in place. |
| Several issues in parallel | Worktree per issue. |

Existing changes are the user's work and are never rewritten, discarded, or reverted — the
same rule the `commit` skill states.

```bash
git worktree add ../<repo>-<type>-<issue> -b <type>/<issue>-<slug>
```

A worktree checks out **tracked files only**. Before testing in one: identify the gitignored
files the build needs (`.env`, `.env.local`), and **ask** whether to symlink or copy —
prefer a symlink, which avoids duplicating a secret on disk (C10). Then install
dependencies. Count that cost when choosing.

Branch name is `<type>/<issue-number>-<slug>` (C1), reusing the Conventional type from the
issue's title.

## Scope: one root cause, not one issue (C7)

Several issues sharing a root cause may be handled on one branch, with a closing keyword
for each. Issues with different root causes stay separate **even when they touch the same
file** — otherwise a single bad fix forces a revert of both, and `git bisect` can only
narrow to "one of these two changes".

Exception: when one issue is a technical prerequisite for another, share the branch but
keep the commits separate and state the dependency in the PR body.

If, while implementing, you find the issue actually has two unrelated causes, stop and say
so rather than quietly widening the branch.

## Implement and test

Write the fix in the style of the surrounding code. Fix the root cause the investigation
identified, not the symptom.

Then run the repository's own validation — focused tests for the affected area, plus lint
and type checks where they exist. Record the exact commands and their real results; you
will need them for the PR body, and inventing them there is the worst failure mode in this
workflow (D1).

Tests failing means the work is not done. Do not proceed to a ready-for-review PR with red
tests; open a draft instead (D3).

## Commit through the commit skill (C2)

Do not hand-roll `git commit`. Invoke the plugin's `commit` skill, which owns identity
verification, secret protection, logical grouping, staged-diff review, and safe push. Pass
it the issue context so the commit messages carry the same Conventional type and scope.

Do not duplicate its rules here; if something about identity or secrets is in question,
that skill decides.

## Open the pull request

Target the **default branch** unless the repository's contribution guide says otherwise.
Title is Conventional (D12) — remember that a squash-merging repository turns it into the
permanent commit message.

Body follows the structure in D12: what changed, why this approach, what was verified with
real commands and real output, review notes, and before/after images for UI changes
(subject to A6).

Linking (D4, and the four traps in `forge.md`):

- The closing keyword goes in the **description**, never a comment.
- Every issue number gets its own keyword: `Closes #12, closes #13`.
- Partial work uses `Refs #142`, never a closing keyword (D5).

Labels inherit the issue's type and area (D9); never invent one (D10). Apply a disclosure
label if the repository has one (D11). Let `CODEOWNERS` drive reviewer requests rather than
hand-picking on your own initiative — if the user names reviewers or a team, add them
(`gh pr edit <n> --add-reviewer <org>/<team>`; on GitHub a team can be a reviewer but never
an assignee). Never `@`-mention a person to draw attention (E3, E4).

Show the full PR title and body before creating it (A1).

Do not merge, and do not approve — this workflow ends at an open pull request. If the user
explicitly asks for either, they are governed by C5 and D13, and `issue-review` carries the
preconditions to check first.

## Close out

Comment on the issue with the **root cause you found** — one line (B15). The forge's
cross-reference tells the reporter that a PR exists; it never tells them what was actually
wrong, which is the part they are waiting for. Do not comment merely to announce the PR
(D7), and do not post progress updates that carry no new information.

The same rule applies to every other state change the reporter cannot infer: could not
reproduce, declined, duplicate, blocked, deferred, or closed — each gets a reason (B15).

If the PR targets a non-default branch, auto-close will not fire on merge; note that, and
check the issue's state afterwards rather than assuming (D6).

Remove a worktree only after the branch is pushed, and never with `--force` over unpushed
commits (C9).

## Report

Issue number, branch name, whether a worktree was used and where; the commits created;
validation commands and their real results; the PR number and URL; the linking keyword
used; and anything left undone or deliberately out of scope.
