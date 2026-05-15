---
epic_id: E05
title: "Three-View Storefronts"
github_issue:
github_milestone: "M4 — Alpha: Three-View Storefront"
status: planned
sprint: S6
priority: P0
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - makoonsii
  - sandra
  - marcus
  - marie
  - tanya
  - dale
  - kevin
schema_impact: true
compliance_review: required
compliance_reviewed: false
ai_review: required
child_issues: []
---

# Epic E05: Three-View Storefronts

**Milestone Gate (M4):** Business owner sign-off on visual design + all 8 personas checked. All 3 view homepages live on dev with real Firestore data. Age gates active. Prefix search working. Mobile-responsive.

## 1. Executive Summary & Persona Focus

Builds the complete public-facing storefronts for all three views: homepages, shop pages, item detail pages, age gates (Cannabis + Fireworks), and mobile-responsive audit. Each view is a distinct experience sharing the same Firestore backend and admin portal.

**Primary Personas:** All 8. M4 gate explicitly requires all personas to be checked.
**Business Goal:** First customer-facing milestone — the business owner must sign off on visual design before M4 passes.

## 2. Acceptance Criteria (Definition of Done)

**Pawn View (S6)**
- [ ] Homepage: art-deco gold/black hero with shimmer headline + Find of the Day rotating showcase, trust badge strip (Community-owned · eBay verified · Akwesasne), featured grid (4 active items), brand narrative callout (Makoonsii trust signal), masonry discovery section (Sandra impulse browsing)
- [ ] Shop page: inventory grid, category filters, prefix search (searchTokens), sort. Item detail: image gallery, condition, pricing, Enquire CTA, hold badge, JSON-LD structured data, GA4 tracking

**Cannabis View (S7)**
- [ ] Homepage: cinematic full-bleed hero, mood collection cards (Relax/Focus/Social/Ceremony for Marie), lifestyle editorial strip. Shop page and item detail with macro image gallery and hover reveal. Limited-edition framing for Marcus
- [ ] **19+ age gate:** Full-screen confirmation modal — no bypass. On confirm: write `consentLogs` doc (IP hash, timestamp, policy version, viewTag=cannabis). Add `/legal/cannabis` page

**Fireworks View (S8)**
- [ ] Homepage: animated countdown timer hero (Tanya), event category navigation (Family Night/Display Shows/Sparklers & Kids/Professional), bundle showcase, urgency strip. Shop + item detail with urgency copy and pickup scheduling CTA
- [ ] **19+ age gate:** Full-screen confirmation modal — no bypass. On confirm: write `consentLogs` doc (viewTag=fireworks). Add `/legal/fireworks` page

**All Views**
- [ ] Mobile-responsive audit at 375px / 768px / 1280px — all layout breaks fixed. Large touch targets for Makoonsii

## 3. Schema & Rules Impact

**Collections written:** `consentLogs/{id}` — age-gate consent (write-once, never deleted).

**Security rules:** `consentLogs` — create-only for all clients; admin-only read via Cloud Function. Public read on `items` only when `status == "active"`.

## 4. AI Implementation Guidelines

Age gates must be implemented as server-verified — a client-side cookie check is insufficient. The `consentLogs` write must complete before the age-gated content is shown. Never log IP addresses in plain text — hash with a salt before storing.

The Pawn homepage brand narrative callout is a Makoonsii-persona touchpoint: copy must reflect the Akwesasne community identity. Do not use generic pawn shop language.

## 5. QA & Runbook Considerations

- Runbook: age-gate failure playbook — if `consentLogs` write fails, block access and show error (do not fail open)
- Cannabis/Fireworks pages: test that direct URL navigation without consent redirects to the age gate
- Business owner sign-off required before M4 gate — schedule review at end of S8

## Task Checklist

- [ ] Pawn view homepage — hero, trust strip, featured grid, brand narrative, masonry (~8 pts, P0, S6)
- [ ] Pawn shop page — inventory grid, filters, prefix search, item detail (~8 pts, P0, S6)
- [ ] Cannabis view homepage + shop + item detail (~8 pts, P0, S7)
- [ ] Cannabis 19+ age gate + consent logging (~5 pts, P0, S7) `type:compliance`
- [ ] Fireworks view homepage + shop + item detail (~8 pts, P0, S8)
- [ ] Fireworks 19+ age gate + consent logging (~3 pts, P0, S8) `type:compliance`
- [ ] Mobile-responsive audit — all three views at 375px / 768px / 1280px (~5 pts, P0, S8)
