---
name: issue-triage
description: Survey open issues and local idea drafts, classify and prioritize them, detect duplicates and stale threads, and recommend what to work on next. Use when the user asks what is pending, what to work on, to triage or label the backlog, to check issue status, or to promote a saved idea draft into an issue.
---

# Triage the Backlog

Answer "what is waiting, and what should I do next" — with a recommendation, not a dump of
the tracker the user could have read themselves.

Read `${CLAUDE_PLUGIN_ROOT}/claude/instructions/issue-policy.md` (safety, content, organization) and
`${CLAUDE_PLUGIN_ROOT}/claude/instructions/forge.md` first.

## Model Delegation (Claude only)

Applies on Claude Code and Claude Cowork only. This is read-heavy classification work —
Sonnet's tier. Fable or Opus delegates the whole skill to a Sonnet sub-agent and validates
the result; Sonnet or Haiku runs it directly.

## Gather from both sources

Detect the host and check auth (`forge.md`), then collect:

```bash
gh issue list --state open --limit 50 --json number,title,labels,updatedAt,author,assignees
```

And the local drafts in `.vt/drafts/` (B12) — ideas saved earlier that never became issues.
They are part of the backlog even though the tracker has never seen them.

Reading is free (A1). Read the bodies and discussions of anything you intend to classify;
do not judge an issue from its title.

## Classify

For each item, establish:

- **Type and area** — from the existing label set (B5), or from the body when unlabelled.
- **Blocked or actionable** — is it waiting on information, a decision, another issue, or
  is it ready to pick up?
- **Age and movement** — last update, whether anyone has responded, whether the reporter
  went quiet.
- **Evidence quality** — does it have a reproduction, or is it a bare symptom? An issue
  with no reproduction is not ready to work on, whatever its priority.

## Detect duplicates and staleness

Compare open issues against each other and against closed ones. Where several issues share
a root cause, say so explicitly — that is the difference between four tickets and one
branch (C7).

Flag threads that are stale: no movement, reporter unresponsive, or already fixed by a
change that landed without a link. Verify "already fixed" against the code before claiming
it (B1).

## Recommend

Rank what to do next, with a stated reason for the ordering — user impact, blocking other
work, cheapness, or evidence quality. Name the top candidates for `/vt:issue-process` and
say what each would involve.

Where evidence is missing, say precisely what is needed, so the follow-up is one question
rather than a round trip.

## Act only with confirmation

Every change here is a public write (A1): applying labels, closing a duplicate, commenting
to ask for information, promoting a draft. Show exactly what you propose to write and to
which issue, then wait.

Use only labels that already exist (B5, D8, D10). Never close a duplicate without evidence
(C4), and never close or reopen someone else's issue without asking (A4).

In an organization, do not preempt the team's own process (E6). Where a triage rotation or
a bot already applies labels, assigns areas, or requests reviewers, recommend rather than
act — relabelling around an automated process makes the backlog lie. Note an issue's
assignee in the listing: one assigned to someone else is not a candidate to pick up (E2).

**Promoting a draft**: the user picks one from `.vt/drafts/`, you re-verify it against
current code — an idea saved weeks ago may already be implemented (B14) — then file it
through the normal creation rules and delete the draft file.

## Report

A ranked, compact list: number, title, state, why it is where it is. Then what you changed,
what you propose changing, and which drafts are still waiting.
