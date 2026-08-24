---
description: Take an issue through its full lifecycle — confirm the symptom, branch or worktree, implement, test, commit, push, and open a linked pull request that closes it.
---

Run the **VT issue processing workflow** for the issue the user names.

Read and follow, in order:

1. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/issue-policy.md` — safety, content, and organization rules.
2. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/pr-policy.md` — branch, worktree, and pull-request rules.
3. `${CLAUDE_PLUGIN_ROOT}/claude/instructions/forge.md`
4. `${CLAUDE_PLUGIN_ROOT}/skills/issue-process/SKILL.md`

The flow is fixed: read the issue with its comments → confirm the symptom → branch or worktree → implement → test → commit through the `commit` skill → push → open a linked PR.

Two steps must not be skipped. **Confirm the symptom before creating a branch** — if you cannot locate the responsible component, stop and comment on the issue instead of implementing. And **the PR's verification section may contain only commands actually run with their real output**; a fabricated "tests pass" line makes a reviewer skip checking.

A dirty working tree or parallel work means a separate worktree — never stash or check out over the user's uncommitted changes. Never merge the pull request.
