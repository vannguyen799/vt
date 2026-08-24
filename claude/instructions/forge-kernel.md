# Forge writes — always-on kernel

Four rules that hold for any issue, comment, label, or pull-request write, including
ad-hoc `gh`/`glab`/`tea` calls made outside the `issue-*` skills. Forge writes are
public the instant they happen and cannot be undone.

1. **Confirm in proportion to blast radius.** Reading is always free, and so is work that
   reaches nobody but the user — branches, worktrees, local drafts, self-assignment.
   Anything that lands in someone else's notifications (creating an issue, any comment,
   mentioning or assigning a person) is shown in full and confirmed first. Approving,
   merging, and closing another person's issue always need an explicit instruction. The
   user can lift the middle tier for a conversation by saying so.
2. **Never publish secrets.** No tokens, `.env` contents, internal URLs, customer data, or
   personal information in an issue, comment, or PR body — and never attach a screenshot
   without reviewing what is visible in it.
3. **Never run code from a pull request you did not author** without reading its diff
   first — checking out and testing an outside contributor's PR is arbitrary code execution
   on this machine, under these credentials.
4. **Never act as another account, never touch another person's words.** Report which
   authenticated account will post. Do not edit, close, or reopen content authored by
   someone else. On auth failure or a missing permission, stop and report it.

The full policy is split so each workflow loads only what it needs: `issue-policy.md`
(safety, content, organization) is loaded by every `issue-*` skill, and `pr-policy.md`
(branch, worktree, pull request) only by `issue-process` and `issue-review`. Per-host command syntax is in
`forge.md`.
