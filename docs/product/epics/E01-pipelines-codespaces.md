---
epic_id: E01
title: "Pipelines & Codespaces"
github_issue:
github_milestone: "M1 — Pipelines & Codespaces"
status: in-progress
sprint: S1
priority: P0
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas: []
schema_impact: false
compliance_review: not-required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E01: Pipelines & Codespaces

**Milestone Gate (M1):** CI must pass on first commit. Firebase dev/prod deployed. Codespaces verified. CI/CD green. Backup scheduled. Runbook v1 drafted. `/docs/` structure committed to repo.

## 1. Executive Summary & Persona Focus

Establishes the complete engineering foundation: repository structure, CI/CD, Firebase environments, Codespaces devcontainer, nightly backups, and the docs-as-code `/docs/` scaffold. No customer-facing work — pure platform enablement. All subsequent Epics depend on this gate passing.

**Business Goal:** Zero-friction onboarding for any developer; CI enforces quality from day one.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **GitHub org + repo:** Branch protection on `main` and `develop` — PRs + passing CI required before merge
- [ ] **Vite + React 18 + TypeScript:** `tsconfig.json`, path aliases, Tailwind v4 CSS-first configured
- [ ] **CI pipeline:** `ci.yml` — lint → typecheck → Vitest → build; `deploy.yml` with manual approval gate for production
- [ ] **Firebase:** Two projects (dev/prod). Firestore, Auth, Hosting, Cloud Functions v2 configured. `.env` files excluded from git
- [ ] **Codespaces:** `.devcontainer/devcontainer.json` — Node 20, Firebase CLI, emulator suite, VS Code extensions. Cold start < 2 minutes
- [ ] **Backup:** Cloud Scheduler + Cloud Function exports Firestore to GCS nightly. Document-count verification step present. Restore procedure in runbook
- [ ] **Runbook v1:** `/docs/runbook.md` with all 9 playbooks (site down, Firestore outage, eBay API failure, Firebase Auth outage, data breach, backup restore, hotfix deploy, age-gate failure, Sentry alert triage)
- [ ] **Docs scaffold:** `/docs/epics/`, `/docs/adr/`, `/docs/schema/`, `/docs/project-management/`, `/docs/reports/` committed
- [ ] **Additional workflows:** `schema-validation.yml`, `docs-validation.yml` — wired into PR required status. Lighthouse CI targets: ≥90 performance, ≥90 accessibility, ≥95 SEO
- [ ] **GitHub Projects board:** Custom fields: Status, Epic, Priority, View Context, Sprint, Story Points, Doc Status, Compliance Impact, Schema Impact
- [ ] **Label taxonomy:** All 27 labels from `.github/labels.yml` applied to the repository
- [ ] **ADR-001** committed to `/docs/adr/ADR-001-docs-as-code.md`

## 3. Schema & Rules Impact

No schema changes. Firestore rules not yet enforced (no collections in use).

## 4. AI Implementation Guidelines

When scaffolding `ci.yml`, reference the existing Firebase hosting workflows already in `.github/workflows/` and integrate rather than duplicate. The `schema-validation.yml` workflow should call `docs/scripts/validate-schema.mjs` once that script exists (Phase 3 of the docs-as-code plan).

## 5. QA & Runbook Considerations

- Fallback if CI is broken: hotfix path via direct commit to `develop` with dual approval
- Codespaces cold start must be verified manually — add a CI step that times a fresh build
- Backup restore procedure must be tested at least once before M1 gate

## Task Checklist

- [ ] Set up GitHub org, repo & branch protection (~5 pts, P0)
- [ ] Scaffold Vite + React 18 + TypeScript project (~5 pts, P0)
- [ ] Configure GitHub Actions CI/CD pipeline (~5 pts, P0)
- [ ] Set up Firebase dev + prod projects (~5 pts, P0)
- [ ] Configure GitHub Codespaces devcontainer (~3 pts, P1)
- [ ] Schedule nightly Firestore backup to GCS (~3 pts, P0)
- [ ] Draft Operational Runbook v1 — all 9 playbooks (~5 pts, P0)
- [ ] Initialise Docs-as-Code /docs/ folder structure (~3 pts, P0)
- [ ] Add GitHub Actions workflows — lint, tests, Lighthouse, schema-validation, docs-validation (~5 pts, P0)
- [ ] Create GitHub Projects board with custom fields (~2 pts, P0)
- [ ] Apply full label taxonomy to repository (~2 pts, P1)
