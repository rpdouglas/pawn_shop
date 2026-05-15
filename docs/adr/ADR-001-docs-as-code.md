---
adr_id: ADR-001
title: "Adopt Docs-as-Code with GitHub Projects as PM Layer"
date: 2026-05-15
status: Accepted
authors:
  - rpdouglas
epic: E01
---

# ADR-001: Adopt Docs-as-Code with GitHub Projects as PM Layer

**Date:** 2026-05-15
**Status:** Accepted
**Epic:** E01

## Context

The Pawn Shop requires a project management and documentation approach for a small team building a complex multi-view application across 19 Epics and 11 Milestones. Options considered:

- External PM tools (Jira, Asana, Linear) + separate documentation site
- GitHub Issues + GitHub Projects + Markdown files in the repository
- Notion or Confluence as a combined PM and documentation tool

The core constraint: the system must remain low-overhead for a small team, keep documentation and code in sync automatically, and produce an auditable history for compliance purposes (PIPEDA, age-gate records).

## Decision

Adopt **Docs-as-Code** philosophy: Markdown files in the repository are the single source of truth for all architectural decisions, epic specifications, schema definitions, and project governance. GitHub Projects is the primary PM orchestration layer. No external PM tools.

The canonical hierarchy:
1. **Epic markdown files** (`/docs/product/epics/`) — source of truth for scope and requirements
2. **GitHub Issues** — execution view, derived from Epic files
3. **GitHub Projects board** — status view, derived from Issues

When a conflict exists between an Issue and an Epic doc, the Epic doc wins (per `GOVERNANCE.md §1`).

## Rationale

- **Single source of truth in git:** Every change to specs is versioned, reviewable, and auditable — identical to code
- **No context switching:** Developers stay in GitHub for code, issues, and docs
- **Compliance-friendly:** Git history provides an immutable audit trail for architectural decisions
- **Automation-ready:** Epic frontmatter can be machine-read to sync labels, milestones, and project card fields via GitHub Actions (see `ADR-005`)
- **Cost:** Zero additional tooling cost

External PM tools were rejected because they create a second source of truth that inevitably drifts from the code. Notion/Confluence were rejected because they are not version-controlled at the field level.

## Consequences

**Easier:**
- Compliance audits: git log provides complete decision history
- Onboarding: new developers read the same docs that govern the code
- Automation: `sync-issues.mjs` can enforce consistency between docs and issues

**Harder:**
- Non-technical stakeholders cannot edit docs without a git workflow
- Epic files require discipline to keep updated as implementation progresses
- ACTIVE_SPRINT.md must be auto-generated (see `ADR-005`) or it will drift immediately

**Supersedes:** Nothing — this is the founding decision.
