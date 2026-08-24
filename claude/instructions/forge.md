# Forge operations — host detection and command vocabulary

Issues, pull requests, labels, and reviews are **not Git**. Git has no concept of them.
They belong to the *forge* — GitHub, GitLab, Gitea/Forgejo — and are reached through that
host's CLI or REST API, which means auth, network, and rate limits apply.

This file is the single place that holds forge *syntax*. The `issue-*` skills hold the
*workflow*. When a CLI changes its flags, fix it here and every skill follows.

## Never guess a subcommand or a flag

If you are not certain a subcommand or flag exists, run `<cli> <noun> --help` and read it
before composing the command. A hallucinated flag (`gh issue triage`, `gh issue assign`)
fails loudly at best and does the wrong thing at worst. Verifying costs one cheap call.

## Step 1 — detect the host

Run these before the first forge operation of a session. Do not infer the host from
memory, from the project name, or from which CLI happens to be installed.

```bash
git remote get-url origin          # → github.com / gitlab.com / self-hosted GitLab / Gitea
command -v gh glab tea             # → which CLIs actually exist
```

Map the remote host to its CLI: `github.com` → `gh`, GitLab (SaaS or self-hosted) →
`glab`, Gitea/Forgejo → `tea`. A self-hosted forge may not be identifiable from the URL
alone; when in doubt, ask rather than assume.

**Never run one host's CLI against another host's repository.** `gh` against a GitLab
remote will either fail confusingly or operate on an unrelated GitHub repo.

## Step 2 — verify auth and visibility

```bash
gh auth status                                   # or: glab auth status
gh repo view --json visibility,defaultBranchRef  # public/private + default branch
```

Report which account will be used **before** the first write. The default branch matters:
issue auto-close on merge only fires for the default branch (see D6 in `issue-policy.md`).

If auth fails, stop and report it (rule A5). Do not try another token, do not read
`GH_TOKEN` out of the environment without saying so, do not switch remotes.

## Command vocabulary

### GitHub — `gh`

| Operation | Command |
|---|---|
| Search before creating | `gh issue list --search "<keywords>" --state all --limit 20` |
| List open | `gh issue list --state open --limit 50 --json number,title,labels,updatedAt,author` |
| View with discussion | `gh issue view <n> --comments` |
| Create | `gh issue create --title "<title>" --body-file - --label <l>` |
| Comment | `gh issue comment <n> --body-file -` |
| Edit labels | `gh issue edit <n> --add-label <l> --remove-label <l>` |
| Close | `gh issue close <n> --comment "<why>"` |
| Existing labels | `gh label list --limit 100` |
| Self-assign | `gh issue edit <n> --add-assignee @me` |
| Assign a person | `gh issue edit <n> --add-assignee <user>` (users only — never a team) |
| Request a reviewer | `gh pr edit <n> --add-reviewer <user>` |
| Request a team review | `gh pr edit <n> --add-reviewer <org>/<team>` (PRs only) |
| Create PR | `gh pr create --title "<title>" --body-file - --base <default-branch>` |
| Create draft PR | `gh pr create --draft …` |
| View PR | `gh pr view <n> --json number,title,body,state,isDraft,files` |
| PR diff | `gh pr diff <n>` |
| Merge preconditions | `gh pr view <n> --json mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,baseRefName,isDraft` |
| **Reply on a PR (default)** | `gh pr comment <n> --body-file -` |
| Approve (only when told) | `gh pr review <n> --approve --body-file -` |
| Request changes (only when told; sticky) | `gh pr review <n> --request-changes --body-file -` |
| Merge (only when told) | `gh pr merge <n> --squash` / `--merge` / `--rebase` |
| Anything unsupported | `gh api repos/{owner}/{repo}/…` |

Pass long bodies with `--body-file -` on stdin, never as a shell-quoted `--body` string:
issue bodies contain backticks, quotes, and newlines that will be mangled or, worse,
executed.

### GitLab — `glab`

Same shape, different nouns. A pull request is a **merge request**.

| Operation | Command |
|---|---|
| Search | `glab issue list --search "<keywords>" --all` |
| List open | `glab issue list` |
| View | `glab issue view <n> --comments` |
| Create | `glab issue create --title "<title>" --description "<body>"` |
| Comment | `glab issue note <n> --message "<text>"` |
| Close | `glab issue close <n>` |
| Assign | `glab issue update <n> --assignee <user>` |
| MR reviewer | `glab mr update <n> --reviewer <user>` |
| Create MR | `glab mr create --title "<title>" --description "<body>" --target-branch <default>` |
| Draft MR | `glab mr create --draft …` |
| **Reply on an MR (default)** | `glab mr note <n> --message "<text>"` |
| Approve (only when told) | `glab mr approve <n>` |
| Merge (only when told) | `glab mr merge <n>` |

**Assignees are users, not teams.** On GitHub a team can be requested as a PR *reviewer*
but can never be an issue or PR *assignee*; asking for the latter fails or silently does
nothing. GitLab is the same for assignees, and handles groups through approval rules. When
the user says "assign the platform team", that means a team review request on the PR —
do it, and say which one you did (E1).

### Gitea / Forgejo — `tea`

`tea`'s surface differs most between versions. **Run `tea <noun> --help` first** and
compose from what it reports; treat the table below as a starting point only.

| Operation | Command |
|---|---|
| List | `tea issues ls` |
| Create | `tea issue create --title "<title>" --description "<body>"` |
| Create PR | `tea pr create --title "<title>" --description "<body>"` |

### No CLI available

Fall back to the REST API with the host's own token, via `gh api` for GitHub or `curl`
for others. Do not create, request, or store a token on the user's behalf — if no
credential is configured, stop and report it.

## Linking a PR to an issue

Closing keywords — `close`/`closes`/`closed`, `fix`/`fixes`/`fixed`,
`resolve`/`resolves`/`resolved` — work on GitHub, GitLab, and Gitea alike. Four traps,
each of which silently produces the wrong result:

1. **The keyword must be in the PR/MR description**, not in a comment on it. A keyword in
   a comment creates a cross-reference but never auto-closes.
2. **Every issue number needs its own keyword.** `Closes #12, #13` closes only #12. Write
   `Closes #12, closes #13`.
3. **Auto-close fires only on merge into the default branch.** A PR targeting `develop` or
   a release branch leaves its issue open. Check and close manually (rule D6).
4. **Cross-repository** references use `Closes owner/repo#12`.

For work that only partially addresses an issue, use `Refs #142` or `Part of #142` — never
a closing keyword (rule D5).

## Optional: GitHub Discussions

If the repository has Discussions enabled with an "Ideas" category, a feature idea belongs
there rather than in Issues. Check with `gh api repos/{owner}/{repo} --jq .has_discussions`.
GitLab and Gitea have no equivalent; on those hosts, ideas stay local drafts until the user
promotes them (rule B12).
