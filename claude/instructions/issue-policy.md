# Issue, branch, and pull-request policy

Loaded by the `issue-*` skills. Its companion `forge.md` holds the per-host command
syntax; this file holds the rules that hold on every host.

## The asymmetry that shapes every rule

A commit is local until it is pushed. **Every forge write is public the instant it
happens** — it notifies watchers, sends mail, consumes a permanent number, and cannot be
undone. An issue is never deleted, only closed. A comment is never unsaid.

Commit rules optimize for a clean history. These rules optimize for not doing something
irreversible in someone else's shared space.

---

## A — Safety invariants

### A1 — Confirmation scales with blast radius

The question is not "is this a read or a write". It is **who else feels it**. Most of the
work in a repository affects nobody but the user, and stopping to ask about it is friction
for no safety gained.

| Who it reaches | Examples | Default |
|---|---|---|
| Only the user's machine | branch, worktree, running tests, local drafts, reading anything on the forge | **Just do it** |
| The user's own repository, nobody notified | self-assign, labelling your own issue, editing your own draft | **Just do it** |
| Other people's notifications | creating an issue, any comment, mentioning someone, assigning another person | Show the exact content, then confirm |
| Irreversible or outward | approve, merge, closing someone else's issue, attaching an image to a public repo | Confirm explicitly, with the preconditions checked |

Reading is always free — that freedom exists so the investigation these rules demand costs
the user nothing.

The lower two rows are not about distrusting the agent. They are about the fact that a
forge write lands in someone else's inbox and cannot be recalled. Acting on the user's
behalf *inside their own repository* is not the same as acting on their behalf *toward
their colleagues*.

### A2 — Standing authorization

The user can lift the confirmation gate for a class of action: *"just file issues when you
find bugs, don't ask"*, *"comment freely on my own repos"*.

When they do:

- It holds for **the rest of that conversation**, and does not carry into a new one.
- It covers the class they named, not everything adjacent to it. Permission to comment is
  not permission to close; permission to file issues is not permission to assign people.
- It never covers the bottom row: approve, merge, and closing another person's issue always
  need their own explicit instruction.
- Report what was done afterwards, in full, rather than silently.

This is the "work on my behalf" mode. Prefer asking once for standing authorization over
asking twelve times for individual actions.

### A3 — Never publish sensitive content

Public repositories are the strict case, but treat private ones as shared too. Never place
in an issue, comment, or PR body: secrets, tokens, keys, `.env` contents, connection
strings, internal hostnames or URLs, customer data, or personal information.

Redact logs and stack traces **before** pasting, not after. Absolute paths that expose a
username or a company name get redacted too. When unsure, describe it in prose instead of
pasting it. Check `visibility` before the first write.

### A4 — Never impersonate, never touch others' words

Read `gh auth status` before the first write and **tell the user which account will post**.
Do not create or refresh a token; do not silently use a `GH_TOKEN` found in the
environment without saying so.

Never edit, delete, close, or reopen an issue, comment, or PR authored by someone else.
You may edit only what you yourself posted in this session. Assigning or unassigning another
person is a write directed at a human being — see E1 for when it is allowed.

### A5 — Stop and report; never self-heal

Auth failure, rate limit, missing permission, archived repository, ambiguous remote → stop
and report the exact error. Do not try a different credential, do not switch remotes, do
not fall back to another account. This is the forge counterpart of the commit workflow's
"never force-push".

### A6 — Never attach an unreviewed image

Screenshots of real screens routinely carry customer names, emails, balances, internal
URLs in the address bar, tokens in a devtools panel, other browser tabs, bookmark bars,
and OS notifications.

Before attaching any image: look at it, enumerate the sensitive elements it contains, tell
the user, and propose a crop. On a public repository the default is **not to attach** until
the user confirms.

---

### A7 — Never run code from a pull request you did not author

Reading a diff is safe. **Checking it out and running it is arbitrary code execution on the
user's machine**, under the user's credentials, with the user's environment.

Before checking out, building, installing dependencies for, or testing any PR from a fork
or an outside contributor, read the diff with read-only tools first and look for:

- Changes to CI/workflow files, `Makefile`, build scripts, or task runners
- New or modified lifecycle hooks — `postinstall`, `prepare`, `.git/hooks`, test fixtures
  that execute on import
- New dependencies, changed lockfiles, or a registry/URL swap in an existing one
- Code that reads environment variables, credential files, SSH keys, or cloud metadata
- Network calls added to build or test paths
- Obfuscated, minified, or encoded content in a source change

If anything on that list appears, **stop and report it**. Do not run it to find out. If
nothing does, say what you checked before proceeding.

A PR from a branch on the same repository by a trusted colleague still gets the diff read
first; the bar is lower, but "it looked fine" is not the same as having looked.

## B — Content rules

### B1 — Never fabricate

Everything presented as fact must be verified. Reproduction steps must have actually been
run and the pasted output must be the real output. Never invent a stack trace, an error
message, or an "expected vs actual" pair. Read versions and environment from the machine,
not from memory.

If you could not reproduce it, say so plainly — *"could not reproduce; the following is
inferred from reading the code"* — rather than dressing inference up as a confirmed report.

### B2 — Search before creating

Always search the tracker first (`--state all`, so closed issues count). If something
close already exists, propose commenting on it instead of opening a duplicate, and let the
user decide.

### B3 — The repository's template wins

If `.github/ISSUE_TEMPLATE/` exists, use it, with its fields, in its order. Only when there
is none do you fall back to the structures below.

### B4 — Titles use the Conventional vocabulary

`<type>: <description>`, reusing the exact type set of the `commit` skill (`fix`, `feat`,
`docs`, `refactor`, `perf`, `chore`, `test`, `build`, `ci`, `style`). Imperative,
lowercase, no trailing period, under 72 characters.

This is not decoration: it makes issue, branch, commit, and PR share one vocabulary, so a
change is traceable end to end.

### B5 — Use only labels that already exist

Read `gh label list` first. Never invent a label.

### B6 — Never ask for what you can look up

Every question you put to the user must be one you genuinely cannot answer yourself.

Forbidden — look these up: versions, OS, branch, commit SHA, which file, what the code
currently does, what the tests expect, reproduction steps you could try yourself.

Allowed — only the user knows: which environment or browser it happened in, whether this
is a bug or a request to change current behavior, which account or data state was in use,
product intent.

### B7 — At most three questions

Past three, stop asking. File the issue at whatever confidence level you reached and put
the remaining unknowns under "Not checked". Laziness is a legitimate input; making the user
fill in a form defeats the point of the skill.

### B8 — Prefer the current session's context

When the failure just occurred in this session, quote the output you already have. Do not
re-run and then describe it from memory, and do not discard a real stack trace in favour of
a paraphrase. Fresh, real context is the single biggest advantage you have over a human
reporter.

### B9 — Two zones, never mixed

Every bug body separates what is **confirmed** from what is **inferred**. This is what lets
B1 and B7 coexist: you are allowed to include a hypothesis, you are not allowed to present
it as established.

```md
### Symptom
<what was observed>

### Confirmed
- Reproduction: <commands actually run> → <real output>
- Error: <real message> at `src/…:47`
- Environment: <read from the machine>, branch `main` @ `<sha>`

### Inferred, not verified
- <hypothesis> at `src/…:62`. Not confirmed to be the only cause.

### Not checked
- <what remains unknown>
```

### B10 — Feature requests keep the user's scope

Record what the user asked for, in their terms. Do not widen it. "Add dark mode" does not
become "add dark mode, a theme switcher, persistence, and cross-device sync". Ideas you
generate go under "Open questions" for the user to decide, never into the description as
though they had been requested.

```md
### Current behavior     ← verified, with file:line
### Desired behavior     ← the user's words, unembellished
### Affected scope       ← verified: which modules must change
### Open questions       ← everything you thought of
```

### B11 — Describe rather than attach

For a UI bug, "the Save button is overlapped by the footer at 375px,
`CheckoutFooter.tsx:88`" serves the person fixing it better than a screenshot, and leaks
nothing. Attach an image only when the visual *is* the evidence — broken layout, wrong
colour, clipped text, misalignment — and then only through A6.

For a UI report, verification means **locating the component**, not running a test:

1. Read the visible strings in the screenshot.
2. Grep the repository for those strings verbatim → the component.
3. For a localized app, grep the i18n catalogue → the key → the component.

That yields a real `file:line` for the "Confirmed" zone. Image dimensions only *hint* at
viewport (they may be scaled or retina), so they belong in the "Inferred" zone.

### B12 — Ideas become local drafts, not issues

A feature idea is written to `.vt/drafts/<slug>.md` and its path reported. It becomes an
issue only when the user approves it.

Bug reports have an owner and immediate value; ideas are the category most often abandoned
or rewritten, and filing each one pollutes the tracker and notifies people for nothing.
`issue-triage` lists local drafts alongside open issues and promotes them on request.

### B13 — Expand the constraints, not the wish

For an idea, you may investigate freely: what exists today, which code is involved, what
must be touched, what the technical constraints are. That is the value you add.

You may not expand the feature's scope or make product decisions. Those are the user's.

### B14 — Check both the tracker and the code

Before drafting an idea, search the tracker (B2) *and* the codebase. The most useful
outcome is often "this duplicates #88" or "60% already exists in `useFilterState.ts:34`,
only persistence is missing".

---

### B15 — Never leave a state change unexplained

A forge cross-reference is not a reply. When a PR mentions an issue, the timeline shows
"linked a pull request" — which tells the reporter *that* something happened, never *what
was wrong*. A person is waiting on the other end of that thread.

Comment on the issue whenever its state changes in a way the reporter cannot infer:

- **Cannot reproduce, or need information** — say what you tried, then ask (B6, B7).
- **Declined, duplicate, or out of scope** — always with the reason. Never close silently.
- **Root cause identified** — one line, when the PR opens. The cross-reference shows the
  link; this shows the diagnosis, which is the part the reporter actually wants.
- **Blocked or deferred** — say what it is waiting on.
- **Closed** — carry the evidence that justified closing (C4).

Do *not* comment for: "starting work" (self-assignment is that signal), "a PR is open"
alone (the cross-reference is that signal), or progress updates carrying no new
information. The test is whether the comment adds something the timeline does not — the
same test as D7, applied from the other direction.

---

## E — Working inside an organization

A solo repository forgives almost everything. In a shared one, every action here is visible
to colleagues, competes with their work, or sends them a notification.

### E1 — Self-assign freely; assign others only when told to

**Yourself** — assign the authenticated account when you begin work
(`gh issue edit <n> --add-assignee @me`). No confirmation needed: this is the signal that
stops two people fixing the same bug, and it is the main reason assignment exists. Unassign
yourself when abandoning the work, so it returns to the pool rather than looking taken.

**Someone else, or a team** — allowed, but only when the user directs it. Assigning work to
a human is a write with a recipient: it lands in their notifications and their queue.
Distributing work is a maintainer's job, not an inference you make from the code.

- The user says who → do it, and confirm the exact handles first (A1).
- You merely *think* an area belongs to someone → propose it, do not act. "This touches
  auth, so assign the auth team" is a guess about people, not about code.

**Taking an assignment away from someone** — never on your own initiative, even to yourself,
and even when the issue has gone quiet. Unassigning removes a person's visible claim on
work. Requires an explicit instruction, every time.

Capability differs by host, and guessing wrong here fails confusingly:

| | GitHub | GitLab |
|---|---|---|
| Issue / PR assignee | **users only** — a team cannot be an assignee | users |
| PR / MR reviewer | users **and** teams (`--add-reviewer org/team`) | users; groups via approval rules |

So "assign it to the platform team" on GitHub means *request the team as a reviewer on the
PR*, not set it as the issue's assignee. Say which one you did.

```bash
gh issue edit <n> --add-assignee <user>          # a person
gh pr edit <n> --add-reviewer <user>             # a person
gh pr edit <n> --add-reviewer <org>/<team>       # a team (PRs only)
```

### E2 — Check the assignee before starting

Before `issue-process` creates anything, read the issue's assignee. Already assigned to
someone else → **do not start**. Ask the user, or comment on the issue offering to help.
Silently duplicating a colleague's in-flight work wastes a session and creates a conflict
nobody asked for.

Assigned to the authenticated account, or unassigned, is clear to proceed.

### E3 — The repository's conventions outrank these defaults

Read them before the first write and follow them where they differ:

- `CONTRIBUTING.md` — branch naming, commit style, review expectations, disclosure rules.
- `.github/PULL_REQUEST_TEMPLATE.md` — use it, with its sections, as B3 does for issues.
- `CODEOWNERS` — tells you who must review a path. Let the forge request those reviewers
  automatically rather than hand-picking around it on your own initiative. The user may of
  course name additional reviewers or a team; that is E1, not a violation of this rule.

Where a repository convention contradicts a rule here, the repository wins and you say so
in the report.

### E4 — Never mention a person without confirmation

`@username` sends a notification to a human being. Do not mention maintainers, reviewers,
or issue authors to chase a response, and do not add them to a PR body for visibility.
If a person genuinely needs to be pulled in, propose it and let the user decide.

### E5 — Check access and protection before acting, not after

```bash
gh repo view --json viewerPermission,defaultBranchRef
```

- **No write access** → the contribution goes through a fork, not a branch on the origin.
  Establish this before creating a branch, or the push fails after the work is done.
- **Protected default branch** → pushing directly is blocked by design; that is the normal
  case in an organization, not an error to work around. Never attempt to bypass protection.
- **Required checks or reviews** → the PR cannot merge until they pass. Report that as the
  remaining state rather than describing the work as finished.

### E6 — Do not preempt the team's process

Many organizations run triage on a rotation, or have bots that apply `needs-triage`,
assign areas, or request reviewers. Do not do that work on their behalf: relabelling or
reassigning around an automated process makes the backlog lie.

`issue-triage` recommends; the team decides. Where a process clearly exists, follow it
rather than the defaults here, and say which one you followed.

### E7 — Organization data is sensitive by default

A3 applies with a wider definition in an organization: internal repository or service
names, employee names and handles, customer identifiers, incident numbers, and internal
URLs are all sensitive when the destination is a public repository. Private-to-public
leakage most often happens through a pasted log or an attached screenshot.
