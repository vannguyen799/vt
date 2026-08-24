# Branch and pull-request policy

The second half of VT's forge policy, loaded by `issue-process` and `issue-review`. Its
companion `issue-policy.md` holds the safety, content, and organization rules that apply to
every forge interaction; `forge.md` holds the per-host command syntax.

Creating and triaging issues does not need this file — which is why it is separate.

## C — Lifecycle rules

### C1 — One issue, one branch, one PR

Branch name: `<type>/<issue-number>-<slug>`, e.g. `fix/142-token-refresh-race`.

### C2 — Commit through the `commit` skill

Never hand-roll `git commit` in this workflow. Identity verification, secret protection,
logical grouping, and safe push all live in that skill; invoke it rather than restating it.

### C3 — Close through the PR

Put the closing keyword in the PR description and let the forge link and close. Do not
close by hand when a merge will do it.

### C4 — Never close without evidence

A closing action requires a commit hash or a passing test. Without evidence, comment with
the current status and leave it open.

### C5 — Merge only on explicit instruction, and only after checking

Merging is the most irreversible action in this workflow. It rewrites the default branch
and, in many repositories, triggers a deployment. Never merge to "finish the task", never
merge to unblock yourself, and never merge your own unreviewed work.

When the user explicitly asks you to merge, verify **all** of these first and report each:

```bash
gh pr view <n> --json mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,baseRefName,isDraft
```

- Required checks green — not "probably fine", read the rollup.
- Required approvals present (`reviewDecision`), and the PR is not a draft.
- No conflicts, and the base branch is the one intended.
- The **merge method** is the user's choice, not yours: squash, merge commit, or rebase
  permanently shapes the history and, under squash, makes the PR title the commit message.

Any precondition unmet → stop and report it. Do not merge and mention the problem after.

`--auto` (merge when checks pass) is a *delayed* merge that fires when nobody is watching;
it needs the same explicit instruction, and say clearly that it is queued rather than done.

`--delete-branch` is a separate action — ask before it.

After merging, verify the linked issue actually closed (D6).

### C6 — Confirm the symptom before creating a branch

Verify by whatever means the symptom allows: if the app can be run, run it and look; if
not, at minimum locate the responsible component and be able to explain the mechanism.

If you cannot locate the component, do not create a branch and do not start implementing.
Comment on the issue describing what you searched.

### C7 — One branch is one root cause

Not one issue. Several issues sharing a root cause may be fixed together, with a closing
keyword for each. Issues with different root causes stay separate **even when they touch
the same file** — shared location is a coincidence, not a relationship.

Separate because: a combined branch cannot be partially reverted; a reviewer must hold two
unrelated arguments at once; `git bisect` can only narrow to "one of these two changes".

The one further exception: when one issue is a technical prerequisite for another, share a
branch but keep the commits separate and state the dependency in the PR body.

### C8 — Dirty tree or parallel work means a worktree

| Situation | Decision |
|---|---|
| Working tree has uncommitted changes | **Worktree required.** Never stash, never check out over the user's work. |
| Clean tree, one issue | Ordinary branch in place. Cheaper, keeps installed dependencies. |
| Several issues in parallel | Worktree per issue. |

A worktree is not free: `git worktree add` checks out **tracked files only**, so
`node_modules/`, `.venv/`, `.env`, and build caches are absent — which means tests will not
run until dependencies are installed. That cost is why this is conditional rather than
universal.

Express this with plain `git worktree` commands so it works on every surface. On Claude
Code, `EnterWorktree` and `Agent(isolation: "worktree")` are equivalent native options.

### C9 — Remove a worktree only after the branch is pushed

Never `git worktree remove --force` over unpushed commits. That is permanent deletion of
the user's work, in the same class as the force-push the commit workflow forbids.

### C10 — Ask before copying ignored files into a worktree

When the build or tests need a gitignored file such as `.env`, ask whether to symlink or
copy. Prefer a symlink: it avoids duplicating a secret to a second location on disk.

## D — Pull-request rules

### D1 — "Verified" means commands actually run

The PR body's verification section may contain only commands that were really executed and
their real output. This is the most dangerous place to fabricate in the whole workflow: a
"✅ tests pass" line that nobody ran causes a reviewer to skip checking. If you could not
run it, write that, with the reason.

### D2 — Do not restate the issue

Link to it. Two parallel descriptions diverge at the first edit.

### D3 — Incomplete work opens as a draft

If the scope is unfinished or tests are not green, `--draft`. Never open as ready-for-review.

### D4 — Closing keyword in the description, one per issue

See `forge.md` for the four traps. `Closes #12, closes #13`, never `Closes #12, #13`.

### D5 — Partial work uses `Refs`, not a closing keyword

### D6 — Verify the close actually happened

When the PR targets a non-default branch, auto-close does not fire. Check the issue's state
after merge and close it manually if needed, rather than reporting success by assumption.

### D7 — Do not comment on the issue just to announce the PR

The forge already creates the cross-reference. Comment only to add something the PR does
not carry — the root cause you found, a temporary workaround, a reason for deferral. B15
lists the state changes that must always be explained; this rule bars the empty ones.

### D8 — No approximate labels

If nothing in the existing set fits, leave it unlabelled. A wrong label is worse than none,
because it corrupts the filters other people rely on.

### D9 — A PR inherits its issue's type and area labels

### D10 — Never create a label

Propose a scheme to the user instead. Four orthogonal axes work well:

| Axis | Example | Note |
|---|---|---|
| type | `bug`, `feature`, `docs`, `chore` | mirrors the Conventional type |
| area | `area/auth`, `area/ui` | mirrors the Conventional scope |
| status | `needs-info`, `blocked`, `ready` | what triage manipulates |
| priority | `p0`…`p2` | only if the repository already has it |

### D11 — Disclosure order

A label is a better disclosure mechanism than a trailer in the body: it is filterable, it
does not clutter the text, and a maintainer who does not want it simply never creates it.

1. Repository has a label like `agent-drafted` or `ai-assisted` → apply it, add no trailer.
2. No such label, but `CONTRIBUTING.md` requires disclosure → follow exactly what it asks.
3. Neither → no disclosure, consistent with VT's commit-attribution rule.

### D12 — PR titles are Conventional too

`<type>(<scope>): <description>`, under the same constraints as B4. Many repositories
squash-merge, which makes the **PR title the permanent commit message** on the default
branch. A careless title becomes careless history.

```md
Closes #142

### What changed
### Why this approach
<trade-offs, alternatives rejected and why>
### Verified
- <command actually run> → <real result>
### Review notes
<risk, uncertainty, migrations, breaking changes>
### Before / After
<UI changes only, subject to A6>
```

### D13 — Reply with a comment; formal review verdicts only when told to

A pull-request review has three forms, and they are not interchangeable:

| Form | Effect |
|---|---|
| **Comment** | Feedback. Touches no state, blocks nothing. |
| **Approve** | An attestation under your account. In a protected repository it unlocks merging. |
| **Request changes** | **Blocks the PR** until that same reviewer dismisses it or approves. |

**The default is a plain comment.** Reviewing, spotting something wrong, disagreeing,
relaying the user's rejection — all of it goes in a comment. A comment carries exactly the
same information as a verdict and leaves the PR's state alone.

```bash
gh pr comment <n> --body-file -            # default: plain feedback
gh pr review <n> --comment --body-file -   # same, filed under Reviews
```

Never press **approve** on your own initiative — not because CI is green, not to unblock a
merge, and never on your own work. When the user asks for it, approve only if the review
actually ran, produced **no blocking findings**, and the PR's verification claims were
re-run rather than believed (D1). Put optional findings in the approval body. If something
blocking stands, say so and do not approve; the user may overrule, but should be overruling
a stated objection.

Never press **request changes** on your own initiative either, and be wary of it even when
asked. It is sticky: the PR stays blocked until that reviewer clears it, so an agent that
sets it and moves on leaves the author waiting on a re-review that never comes. Say this
before using it, and prefer a comment that states the objection just as plainly.
---

### D14 — One batched review, not a stream of comments

Every comment posted separately is a separate notification. A review with eight inline
comments posted one at a time is eight interruptions for the author, arriving out of order
and without the summary that explains them.

Collect all inline comments plus the summary, then submit them as a **single review**:

```bash
gh api repos/{owner}/{repo}/pulls/<n>/reviews --input - <<'JSON'
{
  "event": "COMMENT",
  "body": "<the verdict and summary>",
  "comments": [
    {"path": "src/auth.ts", "line": 42, "body": "<finding>"},
    {"path": "src/auth.ts", "line": 88, "body": "<finding>"}
  ]
}
JSON
```

`event` stays `COMMENT` by default — `APPROVE` and `REQUEST_CHANGES` are governed by D13.
Show the whole batch, with each file and line, before submitting it (A1).

On GitLab, `glab mr note` posts one note; group the findings into that single note rather
than sending several.
