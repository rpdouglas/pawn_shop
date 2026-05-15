---
adr_id: ADR-002
title: "Three-View Architecture with Shared Firebase Backend"
date: 2026-05-15
status: Accepted
authors:
  - rpdouglas
epic: E02
---

# ADR-002: Three-View Architecture with Shared Firebase Backend

**Date:** 2026-05-15
**Status:** Accepted
**Epic:** E02

## Context

The Pawn Shop operates three legally and commercially distinct business lines:

- **Pawn** — general secondhand goods, no age restriction
- **Cannabis** — regulated, 19+ age gate required, PIPEDA-sensitive
- **Fireworks** — regulated, 19+ age gate required, seasonal

Options considered for the technical architecture:
1. Three separate applications (three repos, three Firebase projects, three deployments)
2. One application with subdomain-based separation (pawn.thepawnshop.ca, cannabis.thepawnshop.ca)
3. One application with URL-prefix-based view switching, shared Firebase backend, shared admin portal

## Decision

Implement **one React application** with three distinct public-facing views, sharing a single Firebase backend (Firestore, Authentication, Cloud Functions, Storage) and a single admin portal. Views are distinguished by URL prefix (`/pawn`, `/cannabis`, `/fireworks`).

Theming is handled via Tailwind v4 CSS custom properties and a `ViewContext` React provider that reads the URL prefix and injects the corresponding CSS class (`.view-pawn`, `.view-cannabis`, `.view-fireworks`) on the root element.

All inventory shares the same `items` collection, distinguished by `viewTag` / `viewTags` fields.

## Rationale

- **Shared inventory:** Staff manages one inventory, not three. An item can appear in multiple views (`viewTags: ["pawn", "cannabis"]`) without duplication
- **Shared admin portal:** One staff login, one pawn inbox, one CRM dashboard
- **Compliance enforcement:** Age gates and consent logging are enforced at the URL prefix level — it is clearer and more auditable than subdomain logic
- **Deployment simplicity:** One Firebase project per environment (dev/prod), not three
- **CSS custom properties:** Theme switching without JS conditionals — `.view-cannabis` overrides the same property names as `.view-pawn`; no component-level conditional rendering required

Three separate applications were rejected because they triple the maintenance burden, make shared inventory impossible, and complicate compliance auditing. Subdomain-based separation was rejected because it requires cross-domain session management for users who browse multiple views.

## Consequences

**Easier:**
- Staff workflow: one login, one admin portal
- Inventory management: items can be multi-tagged across views
- Compliance: age-gate enforcement is consistent and auditable at the URL prefix level

**Harder:**
- Bundle size: all three view themes are loaded in the initial bundle (mitigated by CSS-only theme switching — no JS overhead)
- Cannabis/Fireworks compliance: a bug in shared components could affect regulated views. Mitigated by `compliance-check.yml` CI workflow requiring `compliance:reviewed` label on any PR touching regulated view files
- Testing: all three view contexts must be tested for every shared component change

**Cross-references:** ADR-001 (docs-as-code), E02 (design system), E05 (storefronts), E11 (compliance).
