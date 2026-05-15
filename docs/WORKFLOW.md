# Docs-as-Code Workflow Guide

This is the practical, step-by-step operating manual for The Pawn Shop's docs-as-code system. It covers the mechanics of day-to-day use: how to create Epics, work tasks, open PRs, pass CI gates, and keep everything in sync.

For the philosophy behind these decisions, see [`GOVERNANCE.md`](GOVERNANCE.md) and the ADRs in [`/docs/adr/`](adr/).

---

## Contents

1. [How the system is structured](#1-how-the-system-is-structured)
2. [The label taxonomy](#2-the-label-taxonomy)
3. [Starting a new sprint](#3-starting-a-new-sprint)
4. [Working a task issue](#4-working-a-task-issue)
5. [Opening a pull request](#5-opening-a-pull-request)
6. [Adding a new Firestore field or collection](#6-adding-a-new-firestore-field-or-collection)
7. [Making a regulated view change](#7-making-a-regulated-view-change-cannabis--fireworks)
8. [Filing an ADR](#8-filing-an-adr)
9. [Closing an Epic](#9-closing-an-epic)
10. [Issue templates — when to use each](#10-issue-templates--when-to-use-each)
11. [The PR template — what each checkbox means](#11-the-pr-template--what-each-checkbox-means)
12. [Epic frontmatter reference](#12-epic-frontmatter-reference)
13. [The automation layer](#13-the-automation-layer)
14. [ADR lifecycle](#14-adr-lifecycle)
15. [One-time setup steps](#15-one-time-setup-steps)
16. [Common mistakes and how to fix them](#16-common-mistakes-and-how-to-fix-them)

---

## 1. How the system is structured

### 1.1 The three-layer hierarchy

```
Layer 1 — Source of truth      /docs/product/epics/EXX-name.md
                                /docs/adr/ADR-NNN-name.md
                                /docs/schema/firestore-schema.md
                                        │
                              (frontmatter drives labels,
                               milestones, project fields)
                                        ▼
Layer 2 — Execution view       GitHub Issues (one per task row in the Epic)
                                        │
                              (status reflected back
                               to Epic frontmatter on close)
                                        ▼
Layer 3 — Status view          GitHub Projects board
                               (read-only view of Issue state)
```

**The golden rule: the Epic file wins.** If a GitHub Issue label disagrees with the Epic frontmatter, the frontmatter is correct and the issue is wrong. The nightly sync corrects the issue automatically.

### 1.2 Directory map

```
.github/
  workflows/
    ci.yml                    — lint, typecheck, build (on every PR)
    docs-sync.yml             — Epic ↔ Issue sync + ACTIVE_SPRINT.md (nightly + on push to docs/)
    schema-guard.yml          — Firestore schema validation (on PR touching src/ or functions/)
    compliance-check.yml      — Regulated view gate (on PR touching src/ or functions/)
  ISSUE_TEMPLATE/
    feature.yml               — for type:feature tasks
    compliance.yml            — for type:compliance tasks
    bug.yml                   — for bugs
    adr.yml                   — for architecture decisions
  PULL_REQUEST_TEMPLATE.md
  labels.yml                  — canonical label definitions (apply via setup-labels.mjs)

docs/
  ACTIVE_SPRINT.md            — auto-generated; do not edit manually
  GOVERNANCE.md               — philosophy and rules
  COMPLIANCE.md               — age-gate and PIPEDA rules
  PERSONAS.md                 — all 8 persona definitions (canonical)
  WORKFLOW.md                 — this file
  adr/
    ADR-NNN-name.md           — one file per architectural decision
  product/
    epics/
      EXX-name.md             — one file per Epic (source of truth)
  schema/
    firestore-schema.md       — canonical Firestore schema
  reports/
    sprint-reviews/           — sync reports + hand-written sprint reviews
    retrospectives/           — sprint retros
    release-notes/            — milestone gate changelogs
    incident-postmortems/     — blameless incident reports

docs/scripts/
  sync-issues.mjs             — reads Epic frontmatter, syncs to GitHub Issues
  validate-schema.mjs         — greps source for undocumented Firestore collections
  generate-sprint.mjs         — writes ACTIVE_SPRINT.md from GitHub Projects API

src/                          — React app source
functions/src/                — Cloud Functions source
```

---

## 2. The label taxonomy

Every issue must carry labels from the correct namespaces. Labels are applied automatically by the sync system — you set them in the Epic frontmatter, not manually on the issue.

| Namespace | Labels | Applied to |
|---|---|---|
| `type:` | `feature`, `bug`, `compliance`, `adr` | All issues |
| `priority:` | `p0`, `p1`, `p2` | All issues |
| `area:` | `ai`, `backend`, `crm`, `design`, `frontend`, `inventory`, `schema`, `search` | Task issues |
| `view:` | `pawn`, `cannabis`, `fireworks` | Issues touching a specific view |
| `persona:` | `dale`, `marie`, `tanya`, `marcus`, `jordan`, `kevin`, `makoonsii`, `sandra` | Issues with persona impact |
| `compliance:reviewed` | (single label) | Added by a reviewer to unblock compliance gate |

**Rule:** Every persona label used in an issue or Epic frontmatter must have a corresponding entry in `docs/PERSONAS.md`. The sync script validates this and warns on violation.

---

## 3. Starting a new sprint

At the beginning of each sprint, `ACTIVE_SPRINT.md` should already reflect the new iteration. If it doesn't, trigger the workflow manually.

**Step 1 — Assign issues to the new Sprint iteration on the GitHub Projects board.**
Open the board, switch to the Sprint field view, and drag the planned issues into the correct iteration.

**Step 2 — Trigger the sprint doc regeneration.**
Go to Actions → `Docs ↔ Issues Sync` → Run workflow → leave `dry_run` unchecked → Run.

`ACTIVE_SPRINT.md` will be regenerated and committed automatically within ~1 minute. It will show the sprint backlog, P0 blockers, compliance items, and open-todo list.

**Step 3 — Read `ACTIVE_SPRINT.md` in the standup.**
The file is the live record for the sprint. Do not edit it manually — all edits go through the Projects board.

---

## 4. Working a task issue

### 4.1 Pick up the task

1. Open the GitHub Issue for your task. The issue body contains the acceptance criteria from the Epic file.
2. Move the card to **In Progress** on the Projects board.
3. Note the Epic reference in the issue body (`**Epic:** E02`). Open the corresponding Epic file: `docs/product/epics/E02-three-view-design-system.md`.

### 4.2 Create your branch

Use the Epic ID + issue number in the branch name so both are traceable:

```bash
git checkout -b e02/three-view-tokens-#31
```

### 4.3 Do the work — key constraints

- **Schema changes:** If your task touches Firestore, update `docs/schema/firestore-schema.md` first, in the same PR. The `schema-guard.yml` CI check will fail if you add a `.collection('name')` call without a matching `###` section in the schema doc.
- **Regulated views:** If your task touches `.view-cannabis` or `.view-fireworks`, your PR will need the `compliance:reviewed` label before it can merge (see [Section 7](#7-making-a-regulated-view-change-cannabis--fireworks)).
- **AI-generated code:** AI assistants must not guess schema fields or bypass `.view-*` CSS tokens. Reference `CONTEXT_DUMP.md` and the Epic file at the start of every AI session.
- **Styling:** Always scope styles to the view class (`.view-pawn .my-component { ... }`). Never hardcode colour hex values — always use `var(--color-primary)`.

### 4.4 Update the Epic file

When a task is complete, tick the corresponding checkbox in the **Task Checklist** section of the Epic file:

```markdown
## Task Checklist
- [x] Cannabis view token overrides + component variants (~8 pts, P0, S3)
- [ ] Fireworks view token overrides + component variants (~8 pts, P0, S3)
```

Include this Epic file change in the same PR as the code change.

---

## 5. Opening a pull request

When you open a PR, GitHub will pre-populate the template from `.github/PULL_REQUEST_TEMPLATE.md`. Fill in every section — incomplete PR templates will be flagged in review.

Three CI checks run automatically:

| Check | Trigger | What it does | How to pass |
|---|---|---|---|
| `Continuous Integration` | All PRs | Lint, typecheck, build | Fix lint and type errors |
| `Schema Guard` | PRs touching `src/` or `functions/src/` | Validates all Firestore collection calls are in the schema doc | Add missing collections to `docs/schema/firestore-schema.md` |
| `Compliance Check` | PRs touching `src/` or `functions/src/` | Detects `.view-cannabis` / `.view-fireworks` references | Get a reviewer to add `compliance:reviewed` label (see Section 7) |

**Merge requirements:**
- All CI checks must pass
- At least one approving review
- Branch must be up to date with `main` or `develop`

---

## 6. Adding a new Firestore field or collection

This is a two-step process. The schema doc must be updated first.

**Step 1 — Update `docs/schema/firestore-schema.md`.**

If adding a field to an existing collection, add a row to the table:

```markdown
### `items/{id}`
| Field | Type | Notes |
|---|---|---|
| `myNewField` | String | What it stores and why |
```

If adding a new collection, add a new `###` section:

```markdown
### `myNewCollection/{id}`

Brief description of what this collection holds.

| Field | Type | Notes |
|---|---|---|
| `id` | String | Document ID |
| ... | | |

**Security rules:** [describe read/write access]
```

**Step 2 — Write the code.**

Add your `.collection('myNewCollection')` or `.collection('items')` calls. The `schema-guard.yml` CI check will now pass because the collection is documented.

**Step 3 — Include both changes in the same PR.**

The PR template has a checkbox: `Schema changes are reflected in /docs/schema/firestore-schema.md`. Tick it.

**What happens if you skip Step 1:**
The `schema-guard.yml` CI check runs `docs/scripts/validate-schema.mjs`. It greps `src/` and `functions/src/` for `.collection()` and `doc()` calls, compares them against the schema doc, and fails the build. The failure message will name the specific undocumented collection and tell you exactly what to add.

---

## 7. Making a regulated view change (cannabis / fireworks)

Any PR that touches `.view-cannabis` or `.view-fireworks` references in `src/` or `functions/src/` triggers the compliance gate.

### How the gate works

1. `compliance-check.yml` runs on your PR.
2. It diffs all changed files for `view-cannabis` or `view-fireworks` string references.
3. If found, it checks whether the PR has the `compliance:reviewed` label.
4. If the label is absent, the check fails and posts a comment listing the affected files.
5. The check re-runs automatically when the label is added.

### How to clear the gate

1. Before raising the PR, review your changes against `docs/COMPLIANCE.md`:
   - Age gate logic is intact (full-screen modal, no bypass)
   - `consentLogs` is written before regulated content is shown
   - No PII logged in plain text
   - Any Kanien'kéha phrases are flagged for community review
2. Tag a reviewer with compliance authority in your PR (tag them in a comment).
3. The reviewer adds the `compliance:reviewed` label to the PR.
4. The compliance check passes automatically.

**The label must be applied to the PR, not the issue.** Labels on the PR are what the check reads.

---

## 8. Filing an ADR

An Architecture Decision Record is required for any significant technical decision: choosing a new service, changing a core pattern, deprecating a technology, or altering a compliance mechanism.

**Step 1 — Create the markdown file.**

Copy `docs/adr/00_ADR_TEMPLATE.md` to a new file:

```
docs/adr/ADR-006-my-decision.md
```

Fill in all sections. The `status:` frontmatter field is required.

**Step 2 — Open a GitHub Issue using the ADR template.**

Go to Issues → New Issue → **Architecture Decision Record (ADR)**. Fill in:
- ADR number (next in sequence — check `docs/adr/` for the current highest)
- Document path (the file you created in Step 1)
- Status: `Proposed`

**Step 3 — Get the ADR accepted.**

Open a PR with the new ADR file. Reviewers discuss in the PR. When consensus is reached:
- If accepted: merge the PR. Update the `status:` frontmatter to `Accepted`.
- If rejected: update `status:` to `Rejected`. Close the issue with a comment explaining the decision.

**Step 4 — Close the issue.**

The ADR issue may only be closed when:
- The markdown file is committed to `docs/adr/` with the correct filename
- The `status:` field is set in the file

This is enforced by the ADR issue template checklist — reviewers verify before merging.

**If a new ADR supersedes an old one:**
- Update the old ADR's `status:` to `Superseded` and add a note: `Superseded by ADR-006`.
- Reference the old ADR in the new one under **Context**.

---

## 9. Closing an Epic

An Epic is complete when all its acceptance criteria are met and the Milestone gate has passed.

**Step 1 — Confirm all task issues are closed.**

Every issue in the **Task Checklist** section of the Epic file should have a corresponding closed GitHub Issue. Check the `child_issues` frontmatter field — each number should appear as a closed issue.

**Step 2 — Update the Epic frontmatter.**

```yaml
status: implemented
```

Do not change `status` to `implemented` manually if the GitHub Issue is still open — the sync script will revert it. Instead, close the GitHub Issue (with `Closes #N` in a PR), and the nightly sync will set `status: implemented` automatically.

**Step 3 — Tick all acceptance criteria in the Epic file.**

All checkboxes in **Section 2: Acceptance Criteria** should be ticked.

**Step 4 — Write the release note.**

Create `docs/reports/release-notes/MN-YYYY-MM-DD.md` when the Milestone gate passes. See `docs/reports/release-notes/README.md` for the template.

---

## 10. Issue templates — when to use each

| Template | Use when | Key fields |
|---|---|---|
| **Feature Task** (`feature.yml`) | Implementing anything from an Epic task checklist | Epic link (required), Affected Views, Acceptance Criteria |
| **Compliance Task** (`compliance.yml`) | Age-gate logic, PIPEDA, WCAG, jurisdiction notices, security | Compliance category, pre-submit checklist (COMPLIANCE.md review required) |
| **Bug Report** (`bug.yml`) | Something is broken in production or staging | Steps to reproduce, expected vs actual |
| **ADR** (`adr.yml`) | Recording an architectural decision | ADR number, doc path, status — checklist enforces that the file must exist before closing |

**Note:** Milestone issues (M1–M11) and the Epic tracker issues were imported from the CSV as part of the initial setup. You do not need to create new ones unless a new Milestone or Epic is added to the roadmap.

---

## 11. The PR template — what each checkbox means

When you open a PR, you'll see five sections. Here's what each checkbox is enforcing:

### Epic Reference

```markdown
- [ ] This PR is linked to Epic: E__
- [ ] The corresponding /docs/product/epics/EXX-name.md has been updated
```

The first box: every PR must be traceable to an Epic. If your work is genuinely unbounded (infrastructure fix, dependency bump), write `E01` or the most relevant Epic. Do not leave it blank.

The second box: you ticked the task checklist item in the Epic file. This is the primary mechanism keeping docs and code in sync.

### View Context Impact

```markdown
- [ ] .view-pawn
- [ ] .view-cannabis
- [ ] .view-fireworks
- [ ] Admin / Staff only (no public view impact)
```

Tick whichever views your change visually affects. This is informational for reviewers — it is separate from the automated `compliance-check.yml` which reads the source files directly.

### Compliance

```markdown
- [ ] If this touches .view-cannabis or .view-fireworks, COMPLIANCE.md was reviewed and PR has compliance:reviewed label
- [ ] No PII is logged anywhere in this diff
- [ ] Schema changes are reflected in /docs/schema/firestore-schema.md
- [ ] Kanien'kéha phrases (if any) have community review scheduled
```

The first checkbox: you are declaring compliance review is done. Leaving it unticked when the compliance gate fails will block the PR.

The second checkbox: scan your diff for any logging statements, error messages, or analytics events that contain email addresses, phone numbers, IP addresses, or names. None of these may appear in plain text.

The third checkbox: the schema guard CI check also catches this automatically. Tick it once you've verified the schema doc matches your changes.

The fourth checkbox: any Kanien'kéha (Mohawk) language in copy, UI strings, or article content must have explicit community review before publication. If your PR includes any, add a comment tagging the community reviewer.

### Testing

```markdown
- [ ] Follows "Dapper. Debonair." design standards
- [ ] Tested in mobile viewport (375px)
- [ ] Unit / integration tests pass
- [ ] Lighthouse score unaffected (run locally if touching render path)
```

Mobile at 375px is the primary viewport for Tanya and Makoonsii personas — this is non-negotiable. If you're touching any layout code, open DevTools and test it.

---

## 12. Epic frontmatter reference

Every Epic file in `docs/product/epics/` begins with a YAML frontmatter block. Here is what each field means and how to set it correctly.

```yaml
---
epic_id: E02
# ↑ The Epic ID — must match the filename prefix (E02-...). Never change after creation.

title: "Three-View Design System"
# ↑ Human-readable title. Used in sync reports and ACTIVE_SPRINT.md.

github_issue: 27
# ↑ The GitHub Issue number for the Epic *tracker* issue (not the task issues).
#   Populate this after the issue import. The sync script uses this to read
#   the live issue state and detect drift.

github_milestone: "M2 — Three-View Design System"
# ↑ Must exactly match a milestone title in GitHub (copy-paste from the milestone list).
#   The sync script uses this to set/verify the milestone on the tracker issue.

status: in-progress
# ↑ Lifecycle state. Valid values:
#     planned       — not started
#     in-progress   — at least one task is underway
#     implemented   — all tasks done, milestone gate passed
#     deprecated    — Epic was cancelled or superseded
#   The sync script auto-sets this to "implemented" when the tracker issue is closed.
#   Do not set "implemented" manually while the issue is still open.

sprint: S3
# ↑ The sprint in which this Epic's work is primarily scheduled.
#   If work spans multiple sprints, use the starting sprint.

priority: P0
# ↑ P0 = critical/blocker, P1 = high, P2 = nice-to-have.
#   Maps to the priority:pN label on the tracker issue.

owner: platform-team
# ↑ Team or person responsible. Informational only — not synced to GitHub.

views:
  - pawn
  - cannabis
  - fireworks
# ↑ Which public views are affected. Maps to view:* labels.
#   Use only: pawn, cannabis, fireworks (lowercase).
#   Omit a view if the Epic has no customer-facing impact on it.

personas:
  - marcus
  - tanya
# ↑ Which personas are primary for this Epic. Maps to persona:* labels.
#   Every persona listed here must exist in docs/PERSONAS.md.
#   The sync script warns if you reference an unknown persona.

schema_impact: true
# ↑ true if this Epic adds or changes Firestore collections/fields.
#   Maps to the area:schema label on the tracker issue.
#   When true: the docs/schema/firestore-schema.md update is required
#   before implementation can begin.

compliance_review: required
# ↑ "required" if this Epic touches regulated views, PIPEDA, age gates, or
#   Akwesasne jurisdiction. "not-required" otherwise.
#   When required: every PR for this Epic must go through the compliance gate.

compliance_reviewed: false
# ↑ Set to true once a compliance reviewer has signed off on the Epic scope
#   (not individual PRs — this is the Epic-level sign-off).
#   Required to be true before the Epic can be marked "implemented" if
#   compliance_review is "required".

ai_review: required
# ↑ "required" if this Epic involves AI-generated content, AI Cloud Functions,
#   or uses the OpenAI API. Signals that AI implementation guidelines in
#   Section 4 of the Epic file must be followed.

child_issues: []
# ↑ GitHub Issue numbers for all the task-level issues (the "EXX: Task name" issues).
#   Populate this after the issue import.
#   Example: child_issues: [30, 31, 32, 33]
#   The sync script uses this list to check that all tasks are done before
#   the Epic is marked implemented.
---
```

---

## 13. The automation layer

Four automated processes keep the system consistent without manual maintenance.

### 13.1 `docs-sync.yml` — Epic ↔ Issue sync

**When it runs:**
- On every push to `main` or `develop` that touches `docs/product/epics/**.md` or `docs/schema/**.md`
- Nightly at 6am UTC, Monday–Friday (catches overnight drift before standup)
- Manually via Actions → `Docs ↔ Issues Sync` → Run workflow

**What it does:**

1. Reads all `E*.md` files in `docs/product/epics/`
2. For each Epic with a `github_issue` set:
   - Fetches the live issue from GitHub
   - Compares labels against what the frontmatter says they should be
   - Compares milestone against `github_milestone`
   - If drift is found: applies corrections to the issue (labels + milestone)
   - If the issue is closed: updates the Epic's `status:` to `implemented`
3. Runs `generate-sprint.mjs` → writes `docs/ACTIVE_SPRINT.md`
4. Commits `ACTIVE_SPRINT.md` and any sync reports back to the repo with `[skip ci]`

**Dry-run mode:**
When triggered via `workflow_dispatch` with `dry_run: true`, the script reports drift but does not apply corrections. Use this to verify frontmatter before enabling production sync.

**What it cannot do:**
- It cannot create new GitHub Issues. Issues are created manually (or via `import-issues.mjs`).
- It does not sync issue *titles* or *bodies* — only labels and milestone.
- It does not sync child task issues — only the Epic tracker issue.

### 13.2 `schema-guard.yml` — Firestore schema validation

**When it runs:** On every PR that touches `src/**`, `functions/src/**`, or `docs/schema/**`.

**What it does:**
Runs `docs/scripts/validate-schema.mjs`, which:
1. Parses `docs/schema/firestore-schema.md` to extract all `###`-headered collection names
2. Scans every `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` file in `src/` and `functions/src/` for:
   - `collection(db, 'name')` — modular Web SDK
   - `.collection('name')` — namespaced Admin SDK
   - `doc(db, 'name', ...)` — modular doc reference
   - `collectionGroup('name')` — collection group query
3. Reports any referenced collection name that does not have a `###` header in the schema doc
4. Also warns (but does not fail) on deprecated collection names (`products`, `audit_logs`)

**On failure:** Posts a comment on the PR explaining exactly which collection is undocumented and what to add to the schema doc.

### 13.3 `compliance-check.yml` — Regulated view gate

**When it runs:** On every PR that touches `src/**` or `functions/src/**`.

**What it does:**
1. Diffs the changed files against the base branch
2. Searches the diff for `view-cannabis` or `view-fireworks` string references
3. If found: checks whether the PR has the `compliance:reviewed` label
4. If the label is absent: fails the check and posts a blocking comment listing the affected files
5. If the label is present: passes silently

**Clearing the gate:** See [Section 7](#7-making-a-regulated-view-change-cannabis--fireworks).

### 13.4 `generate-sprint.mjs` → `ACTIVE_SPRINT.md`

Runs as the second step inside `docs-sync.yml`. Uses the GitHub Projects v2 GraphQL API to:
1. Find the project by `GITHUB_PROJECT_NUMBER` (repository variable)
2. Identify the currently active Sprint iteration by comparing today's date to each iteration's start date + duration
3. Fetch all issues assigned to that iteration, with their Status, Epic, Story Points, and Priority fields
4. Render `docs/ACTIVE_SPRINT.md` — backlog table sorted by priority, plus P0 blockers section and compliance items section

**`ACTIVE_SPRINT.md` is auto-generated — never edit it manually.** If you need to change what appears in the sprint doc, change the board: move issues between iterations, update Status field values, or update Story Points.

---

## 14. ADR lifecycle

```
Proposed ──▶ Accepted ──▶ Deprecated
                 │
                 └──▶ Superseded ──▶ (new ADR takes over)
          │
          └──▶ Rejected
```

| Status | Meaning | What to do |
|---|---|---|
| `Proposed` | Decision is under discussion | PR is open; discussion happens in PR review |
| `Accepted` | Decision is in effect | PR merged; all teams follow this decision |
| `Rejected` | Decision was considered and declined | PR closed; issue closed with explanation |
| `Deprecated` | Decision was valid but technology/context changed | Update `status:` in the file; add a note explaining why |
| `Superseded` | A new ADR replaces this one | Update `status: Superseded by ADR-NNN`; reference in new ADR |

**Filing requirements (enforced by the `adr.yml` issue template checklist):**
- The markdown file must exist in `docs/adr/` before the issue can be closed
- The `status:` field must be set in the file
- If superseding another ADR, that ADR's file must be updated

---

## 15. One-time setup steps

These steps must be completed once after the repository is created. Most are part of Epic E01.

| Step | How | Status |
|---|---|---|
| Create GitHub Projects board | GitHub → Projects → New project | Part of E01 |
| Add Sprint Iteration field to board | Board → + Add field → Iteration | Part of E01 |
| Set `GITHUB_PROJECT_NUMBER` repo variable | Settings → Secrets and variables → Actions → Variables → New variable. Name: `GITHUB_PROJECT_NUMBER`, Value: the number in the project URL (e.g. `1`) | Required to activate `generate-sprint.mjs` |
| Apply labels from `labels.yml` to repo | Run `node docs/scripts/setup-labels.mjs` (to be built as part of E01) or apply manually via `gh label create` | Labels are already created |
| Import issues from CSV | `node docs/scripts/import-issues.mjs` | Already done — 110 issues live |
| Populate `github_issue` in each Epic file | After import, find each Epic tracker issue number and set it in the frontmatter | Pending — do this after E01 board is live |
| Populate `child_issues` in each Epic file | Find each task issue number and add to the array | Pending — do this after E01 board is live |
| MFA enrolment for all staff | Admin → Firebase console → Authentication → enforce MFA | Part of E03, required for M11 |

### How to populate `github_issue` after import

1. Go to GitHub Issues → filter by the Epic label (e.g. `E2`) → find the milestone issue for that Epic (title starts with `E2:`... or `M2 —`).
2. Note the issue number from the URL or the `#N` in the list.
3. Open `docs/product/epics/E02-three-view-design-system.md`.
4. Set `github_issue: N` in the frontmatter.
5. Commit the change. The next sync run will validate the mapping.

You can batch this for all 19 Epics in a single commit.

### How to populate `child_issues`

1. Go to GitHub Issues → search for `E2:` in titles → note all issue numbers.
2. Open the Epic file and set:
   ```yaml
   child_issues: [30, 31, 32, 33, 34]
   ```
3. Commit. The sync script uses this list in its completion checks.

---

## 16. Common mistakes and how to fix them

### "My PR is blocked by the compliance check but I didn't touch any regulated code."

The check looks for the *strings* `view-cannabis` and `view-fireworks` anywhere in the changed files — including comments, import paths, and test fixtures. Check whether you have any of these strings in unexpected places. If the check is a false positive, get a reviewer to add the `compliance:reviewed` label and note in the PR that it's a false positive.

### "The schema guard failed but the collection is in the schema doc."

The collection header in `docs/schema/firestore-schema.md` must match exactly — the script looks for `### \`collectionName\`` (triple-hash, backtick-wrapped). Check that your collection name in code exactly matches the heading name. Common mismatch: `audit_logs` (deprecated) vs `auditLogs` (current).

### "I edited `ACTIVE_SPRINT.md` and my change was overwritten."

`ACTIVE_SPRINT.md` is auto-generated and committed by the `docs-sync.yml` workflow on every run. Any manual edit will be overwritten at the next sync. To change what appears in the file, change the board state or Epic frontmatter — not the file itself.

### "The sync ran but my Epic wasn't updated."

The sync only processes Epics that have `github_issue` set to a non-null value. If `github_issue:` is blank or null, the Epic is skipped with a log message: `github_issue not set — skipping`. Populate the field and the next sync will pick it up.

### "I changed an Epic's `status:` to `implemented` but the sync reverted it to `in-progress`."

The sync sets `status: implemented` only when the GitHub Issue is closed. It also reverts a premature `implemented` status if the issue is still open. Close the GitHub Issue using `Closes #N` in a PR merge, and the next sync run will set the status correctly.

### "I added a persona label in an Epic file but the sync warns it's unknown."

Every persona used in an Epic frontmatter `personas:` array must have a matching entry in `docs/PERSONAS.md`. The known personas are: `dale`, `marie`, `tanya`, `marcus`, `jordan`, `kevin`, `makoonsii`, `sandra`. If you are introducing a new persona, add them to `PERSONAS.md` first, then add to the Epic.

### "A PR has the wrong labels on its issue."

Labels on issues are managed by the sync system — setting them manually on the issue will be overwritten at the next nightly run. To change labels, update the Epic frontmatter (`priority:`, `views:`, `personas:`) and either wait for the nightly sync or trigger it manually via `workflow_dispatch`.

### "CI fails with `npm run typecheck` not found."

The `typecheck` script is referenced in `ci.yml` but is not yet defined in `package.json`. Add it as part of the E01 setup:
```json
"scripts": {
  "typecheck": "tsc --noEmit"
}
```

---

*This document is owned by the platform team. If the system changes, update this file in the same PR as the system change. Do not let the workflow guide drift from the actual system.*
