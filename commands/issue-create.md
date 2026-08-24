---
description: Turn a one-line description, a screenshot, or a rough idea into a well-formed issue — investigating the repository to fill in what you did not write. Ideas are saved as local drafts instead of filed.
---

Run the **VT issue creation workflow** for what the user is reporting.

Read and follow, in order:

1. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/issue-policy.md` — safety, content, and organization rules. (Branch and pull-request rules live in `pr-policy.md`; this workflow does not need them.)
2. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/forge.md` — host detection and the per-host command vocabulary.
3. `${CLAUDE_PLUGIN_ROOT}/skills/issue-create/SKILL.md` — the workflow itself.

Do not restate the policy from memory; read the files so this command never drifts.

The user's input may be a sentence, a sentence plus a screenshot, or a rough idea — classify it first, because each needs different verification. Investigate the repository to fill the gaps rather than asking the user to; ask at most three questions, and only ones you cannot look up yourself. Never fabricate a reproduction, an error message, or a test result. Show the exact title, body, and labels before posting.
