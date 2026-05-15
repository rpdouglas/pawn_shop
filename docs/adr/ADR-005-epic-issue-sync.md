---
adr_id: ADR-005
title: "Epic ↔ Issue Programmatic Sync via GitHub Actions"
date: 2026-05-15
status: Accepted
authors:
  - rpdouglas
epic: E01
---

# ADR-005: Epic ↔ Issue Programmatic Sync via GitHub Actions

**Date:** 2026-05-15
**Status:** Accepted
**Epic:** E01

## Context

The docs-as-code system (ADR-001) creates a risk of drift between:
- Epic markdown files in `/docs/product/epics/`
- GitHub Issues (labels, milestones, project card fields)
- `ACTIVE_SPRINT.md` (which becomes stale immediately if hand-edited)

Without enforcement, these three sources diverge over time. The gap analysis documented in `docs_as_code.md` identified five specific drift risks:
1. No programmatic link between Epic markdown and GitHub Issues
2. `ACTIVE_SPRINT.md` is a blank template that won't stay in sync automatically
3. Firestore schema doc has no CI guard
4. Issue body Sprint/Points data is not machine-readable
5. Persona labels referenced in issues that don't exist in `PERSONAS.md`

## Decision

Implement a **programmatic sync system** using GitHub Actions and Node scripts in `docs/scripts/`:

**`docs/scripts/sync-issues.mjs`**
- Reads Epic frontmatter from all `E*.md` files in `/docs/product/epics/`
- Calls GitHub API to compare live issue labels, milestones, and project fields
- Detects drift and applies corrections (doc → issue direction)
- On issue close: updates Epic `status` frontmatter to `implemented` (issue → doc, status only)
- Run: on push to `docs/product/epics/**.md`, nightly Mon–Fri 6am UTC, and `workflow_dispatch`

**`docs/scripts/generate-sprint.mjs`**
- Queries GitHub Projects API for the current active iteration
- Writes `docs/ACTIVE_SPRINT.md` as auto-generated (marked with "do not edit manually" header)
- Commits with `[skip ci]`

**`docs/scripts/validate-schema.mjs`**
- Greps `src/` and `functions/src/` for `.collection()` and `.doc()` references
- Cross-checks against `/docs/schema/firestore-schema.md`
- Fails CI if undocumented fields are found

**Two-way sync rules (to prevent infinite loops):**
- **Docs → Issues:** Epic frontmatter is authoritative for labels, milestone, and project card fields
- **Issues → Docs:** Only `status` field propagates back (issue closed → Epic `status: implemented`)

## Rationale

- **The document wins:** Per ADR-001, Epic docs are the source of truth. The sync system enforces this programmatically rather than relying on discipline
- **No external dependencies:** GitHub Actions + Node built-ins + GitHub API — no third-party services required
- **Drift is caught nightly:** Even without a doc change, the nightly run detects if someone edited an issue label directly and corrects it
- **Schema guard prevents the most dangerous drift:** Undocumented Firestore fields silently break security rules — catching them in CI is high-value

The alternative (manual enforcement via process + code reviews) was rejected because drift is inevitable when enforcement is human-only. The Backstage/Linear/Diataxis patterns reviewed in `docs_as_code.md` all converge on programmatic enforcement.

## Consequences

**Easier:**
- Confidence that issues reflect their Epic docs at all times
- `ACTIVE_SPRINT.md` is always current without manual effort
- Firestore schema drift caught in CI before it reaches production

**Harder:**
- `GITHUB_TOKEN` must have `issues:write`, `contents:write`, and `projects:write` scope
- Epic frontmatter `github_issue` field must be populated after initial issue import — until then, `sync-issues.mjs` skips that Epic
- Schema guard requires `docs/scripts/validate-schema.mjs` to be kept current as the codebase grows

**Implementation sequence (from `docs_as_code.md` Phase roadmap):**
1. Phase 1: Labels, templates, PR template (complete)
2. Phase 2: Epic files, ADR files (complete)
3. Phase 3: `validate-schema.mjs` + `schema-guard.yml`
4. Phase 4: `sync-issues.mjs` + `docs-sync.yml`
5. Phase 5: `generate-sprint.mjs` + auto-ACTIVE_SPRINT.md

**Cross-references:** ADR-001 (docs-as-code foundation), E01 (pipelines — this is an E01 deliverable).
