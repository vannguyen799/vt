---
name: issue-review
description: Review a pull request against the issue it claims to close — whether it actually resolves the reported problem, whether its verification claims are real, and whether the linking and labels are correct. Use when the user asks to review a PR or merge request, check whether a change resolves an issue, or verify a PR before merging.
---

# Review a PR Against Its Issue

Ordinary code review asks "is this code good". This asks a different question: **does this
change actually resolve what was reported, and are its claims true?**

For pure code quality — bugs, simplification, efficiency — use `/code-review` instead. This
skill covers the issue-to-PR relationship that a diff-only review cannot see.

Read `${CLAUDE_PLUGIN_ROOT}/claude/instructions/issue-policy.md` (safety, content,
organization), `${CLAUDE_PLUGIN_ROOT}/claude/instructions/pr-policy.md` (branch, worktree, pull request), and
`${CLAUDE_PLUGIN_ROOT}/claude/instructions/forge.md` first.

## Model Delegation (Claude only)

Applies on Claude Code and Claude Cowork only. Judging whether a change resolves a reported
problem is reasoning work — Opus's tier. Sonnet may gather the diff, the issue text, and the
test results; the verdict belongs to Opus or above. If the VT Codex model role is active,
Codex is the preferred independent reviewer, and its findings are validated rather than
relayed.

## Gather both sides

```bash
gh pr view <n> --json number,title,body,state,isDraft,baseRefName,files,labels
gh pr diff <n>
gh issue view <linked-issue> --comments
```

You cannot review the PR without the issue. A diff that looks correct in isolation may fix
a different problem than the one reported.

## Before running anything from the PR (A7)

Reading the diff is safe. **Checking it out and running it is arbitrary code execution on
the user's machine**, under the user's credentials and environment. For any PR from a fork
or an outside contributor, read the diff first and look for:

- Changes to CI/workflow files, `Makefile`, build scripts, task runners
- New or changed lifecycle hooks — `postinstall`, `prepare`, `.git/hooks`, fixtures that
  execute on import
- New dependencies, changed lockfiles, a swapped registry or URL
- Code reading environment variables, credential files, SSH keys, cloud metadata
- Network calls added to a build or test path
- Obfuscated, minified, or encoded content in a source change

Anything on that list → **stop and report it; do not run it to find out**. Nothing on it →
say what you checked, then proceed. Verifying the PR's test claims below requires running
its code, so this gate comes first.

## Check that it resolves the reported problem

Start from the issue's symptom, not from the diff.

- **Does the change address the root cause, or the symptom?** A fix that masks the symptom
  will produce a reopened issue later.
- **Would the reported reproduction now pass?** Trace it through the modified code. Where
  the app can be run, run it and check directly rather than reasoning about it.
- **Are the acceptance criteria met** — every one, not most? If the issue lists three
  conditions and the PR satisfies two, that is a `Refs`, not a `Closes` (D5).
- **What did the issue ask for that the diff does not touch?** Name it explicitly.

## Verify the verification claims (D1)

This is where review adds the most, because it is where fabrication does the most damage:
a "✅ tests pass" line nobody ran causes the reviewer to skip checking.

Every claim in the PR's verification section must be checkable. Run the commands it cites.
If a claimed test does not exist, or does not cover the change, or was never run, say so
plainly — that is a finding, not a nitpick.

Then ask what is *not* covered: is there a regression test for the reported bug? A fix
without one invites the same issue to return.

## Check the linking and metadata

Mechanical, but each of these silently produces a wrong outcome (see `forge.md`):

- Closing keyword in the **description**, not in a comment.
- One keyword per issue number — `Closes #12, closes #13`, not `Closes #12, #13`.
- **Base branch**: if the PR does not target the default branch, auto-close will not fire
  on merge. Flag it so the issue is closed deliberately rather than forgotten (D6).
- Partial work carries `Refs`, not a closing keyword (D5).
- Title is Conventional (D12) — under squash-merge it becomes the permanent commit message.
- Labels inherit the issue's type and area (D9), and none was invented (D10).
- Scope matches one root cause (C7): unrelated changes riding along belong in another PR.
- Repository conventions were followed where they differ from the defaults — `CONTRIBUTING.md`,
  the PR template, and `CODEOWNERS` review coverage for the paths touched (E3).

## Report — and only then, if asked, post

Give the verdict first: does it resolve the issue, and can it be merged? Then the findings,
most consequential first, each with `file:line` and what would go wrong.

Separate what is **blocking** from what is **optional**. A reviewer who marks everything
blocking gets ignored.

Posting the review is a public write (A1): show the exact comment text and wait for
confirmation. If the PR is a draft, review it as a draft — do not treat unfinished work as
if it were submitted.

## Replying — the default

Post a **plain comment**. Reviewing, finding something wrong, disagreeing, or relaying the
user's rejection all go in a comment; it carries the same information as a formal verdict
and leaves the PR's state untouched.

Post it as **one batched review**, not a stream of separate comments — each comment is its
own notification, arriving out of order and without the summary that explains it (D14):

```bash
gh api repos/{owner}/{repo}/pulls/<n>/reviews --input - <<'JSON'
{
  "event": "COMMENT",
  "body": "<verdict and summary>",
  "comments": [{"path": "src/auth.ts", "line": 42, "body": "<finding>"}]
}
JSON
```

Never press **approve** on your own initiative — it is an attestation under the user's
account and in a protected repository it unlocks merging. Never press **request changes**
on your own initiative either: it is sticky, blocking the PR until that same reviewer
clears it, so setting it and moving on leaves the author waiting for a re-review that never
comes. Both are available when the user explicitly asks, under D13.

## Merging

Merging is the most irreversible action in the whole workflow: it rewrites the default
branch and in many repositories triggers a deployment. Never merge to finish the task, and
never merge on your own initiative (C5).

When the user explicitly asks, check every precondition first and report each:

```bash
gh pr view <n> --json mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,baseRefName,isDraft
```

Required checks actually green — read the rollup, do not assume. Required approvals
present. Not a draft. No conflicts, correct base branch. The **merge method is the user's
choice** — under squash the PR title becomes the permanent commit message.

Any precondition unmet → stop and report, rather than merging and mentioning it after.
`--auto` is a delayed merge that fires unattended; it needs the same explicit instruction,
and say that it is queued rather than done. `--delete-branch` is a separate ask.

Afterwards, verify the linked issue actually closed — it will not have, if the base was not
the default branch (D6).
