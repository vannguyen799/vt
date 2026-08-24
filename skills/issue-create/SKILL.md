---
name: issue-create
description: Turn a one-line description, a screenshot, or a rough idea into a well-formed issue on GitHub, GitLab, or Gitea — investigating the repository to fill in what the reporter did not. Use when the user reports a bug, describes something broken in the UI, asks to file or open an issue, or floats a feature idea to capture.
---

# Create an Issue

The user gives you one sentence, or a sentence and a screenshot, or a half-formed idea.
You do the reporting work they did not want to do — and you do it by investigating, never
by inventing.

Read `${CLAUDE_PLUGIN_ROOT}/claude/instructions/issue-policy.md` (safety, content, organization) and
`${CLAUDE_PLUGIN_ROOT}/claude/instructions/forge.md` before the first forge call.

## Model Delegation (Claude only)

Applies on Claude Code and Claude Cowork; not on Codex or ChatGPT Work.

This workflow is investigation plus careful writing — Sonnet's tier. If the active model is
Fable or Opus, delegate the whole skill to a Sonnet sub-agent with this file's instructions
and the user's exact words, then validate what comes back before posting. If the active
model is Sonnet or Haiku, run it directly.

If the VT Codex model role was activated in this conversation, prefer the Codex MCP agent
for the investigation, then apply these rules to its findings yourself.

## Classify the input first

The three input shapes need different verification, and picking the wrong one wastes effort.

| Input | Verification | Default outcome |
|---|---|---|
| Bug, described in prose | Reproduce it, or trace the code path | File the issue |
| Bug, UI, with a screenshot | Locate the component (B11) | File the issue; image only via A6 |
| Feature idea | Search the tracker *and* the code (B14) | **Local draft**, not an issue (B12) |

## Detect the host and check for duplicates

Follow `forge.md` step 1 and step 2 — remote, CLI, auth, visibility, default branch. Report
which account would post.

Then search before anything else (B2), `--state all` so closed issues count. A close match
means proposing a comment on the existing issue rather than a new one.

## Investigate — this is the whole value of the skill

Spend reads freely; they are free (A1). What you gather here is the difference between a
useful issue and a restatement of the user's sentence.

**If the failure just happened in this session**, quote the output you already have (B8).
Do not re-run and paraphrase; do not throw away a real stack trace.

**For a described bug**: try to reproduce. Run the test, run the command, read the code
path. Record the real commands and their real output, plus versions and the current SHA
read from the machine — never from memory.

**For a UI bug with a screenshot**: read the visible strings, grep them verbatim in the
repository, and follow i18n keys if the app is localized, until you have a real
`file:line`. That mapping is the most valuable thing in the issue.

**For an idea**: find out what already exists. "60% of this is already in
`useFilterState.ts:34`" is worth more than a new issue.

## Ask at most three questions, and only unanswerable ones

Never ask what you can look up — versions, branch, file, current behavior, reproduction
steps you could try yourself (B6). Ask only what genuinely lives in the user's head: which
environment, which browser, which data state, whether this is a bug or a deliberate change
of behavior.

Past three questions, stop (B7). File at the confidence level you reached and put the rest
under "Not checked". Never invent content to fill a gap.

## Write the body

Use the repository's template if one exists (B3). Otherwise use the structure for the input
shape — bug (B9), feature request (B10), or idea draft (B12) — keeping the confirmed and
inferred zones strictly separate.

Title follows the Conventional vocabulary (B4). Labels come only from the existing set
(B5, D8); if nothing fits, leave it unlabelled. Apply a disclosure label if the repository
has one (D11).

## Post, or draft

Show the exact title, body, and labels, then wait for confirmation (A1) — unless the user
already gave standing authorization in this conversation.

An **idea** goes to `.vt/drafts/<slug>.md` instead, and you report the path (B12). It
becomes an issue only when the user asks. If the repository has Discussions with an Ideas
category, offer that as the destination instead (`forge.md`).

Before attaching any image, review it and enumerate what is visible in it (A6). On a public
repository, do not attach until the user confirms.

## Report

State the issue number and URL, or the draft path; which account posted; what you verified
versus what you inferred; and anything you deliberately left out — a redacted screenshot, a
skipped label, an unanswered question.
