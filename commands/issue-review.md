---
description: Review a pull request against the issue it claims to close — whether it truly resolves the report, whether its verification claims are real, and whether linking, base branch, and labels are correct.
---

Run the **VT issue review workflow** for the pull request the user names.

Read and follow, in order:

1. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/issue-policy.md` — safety, content, and organization rules.
2. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/pr-policy.md` — branch, worktree, and pull-request rules.
3. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/forge.md`
4. `${CLAUDE_PLUGIN_ROOT}/skills/issue-review/SKILL.md`

This is not a code-quality review — for that, use `/code-review`. Here the question is whether the change resolves what was actually reported. Fetch both the PR diff and the issue with its comments; a diff that looks correct in isolation may fix a different problem than the one filed.

Verify the PR's verification claims by running them. Check the closing keyword is in the description with one keyword per issue number, and that the base branch is the default branch — otherwise auto-close will not fire on merge. Give the verdict first, separate blocking from optional findings, and never approve or merge on the user's behalf.
