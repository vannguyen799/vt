---
description: Survey open issues and saved idea drafts, classify and prioritize them, spot duplicates and stale threads, and recommend what to work on next.
---

Run the **VT issue triage workflow**.

Read and follow, in order:

1. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/issue-policy.md` — safety, content, and organization rules. (Branch and pull-request rules live in `pr-policy.md`; this workflow does not need them.)
2. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/forge.md`
3. `${CLAUDE_PLUGIN_ROOT}/skills/issue-triage/SKILL.md`

Cover both the tracker and the local drafts in `.vt/drafts/`. Reading is free — read the bodies and discussions of anything you classify rather than judging from titles. End with a ranked recommendation and a stated reason for the ordering, not a dump of the tracker. Every label change, comment, or close is a public write: show it and wait for confirmation.
