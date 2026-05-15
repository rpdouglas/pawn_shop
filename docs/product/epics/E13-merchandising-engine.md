---
epic_id: E13
title: "Merchandising Engine"
github_issue:
github_milestone: "M6 — Merchandising Live"
status: planned
sprint: S11
priority: P0
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - marcus
  - sandra
  - dale
  - tanya
  - marie
  - jordan
schema_impact: true
compliance_review: not-required
compliance_reviewed: false
ai_review: required
child_issues: []
---

# Epic E13: Merchandising Engine

**Milestone Gate (M6):** Algolia search returns results in < 300ms. E13 engine live: staff picks, trending, related items, quick-view, collection pages, Algolia.

## 1. Executive Summary & Persona Focus

The discovery and merchandising layer that makes browsing feel curated: staff picks, trending score, collection pages, bundle recommendations, auto-tagging (`just-arrived`, `rare-find`), quick-view modal (< 200ms), Algolia search integration, masonry grid, and vertical video support.

**Primary Personas:** Marcus (staff picks, rare-find scarcity, luxury quick-view), Sandra (masonry discovery, staff picks, quick-view without losing browse place), Dale (Algolia typo-tolerant search), Tanya (fireworks bundle recommendations), Jordan (masonry, vertical video).
**Business Goal:** Increase average session depth and conversion by making inventory feel curated and discoverable, not just listed.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Staff picks:** Admin UI to mark items as staff picks (primary discovery surface). Recently viewed (localStorage)
- [ ] **Trending score:** `calculateTrendingScore` Cloud Function — composite score from view count, save count, enquiry count. Updates `items/{id}.trendingScore`
- [ ] **Related items:** On item detail page — same category + view, sorted by trending score
- [ ] **Auto-tagging:** `just-arrived` tag on items created < 48h ago. `rare-find` tag manually set by staff (authentic scarcity — never manufactured)
- [ ] **Collection pages:** ViewTag-filtered. Cannabis mood collections: Relax/Focus/Social/Ceremony. Fireworks bundle collections
- [ ] **Quick-view modal:** Opens in < 200ms (hard acceptance criterion, S12). Cinematic imagery. Sandra: browse without losing place
- [ ] **Algolia integration (S12):** Typo-tolerance, fuzzy matching, synonyms for collectibles. Per-view faceting. Admin Algolia index management UI. **Search < 300ms** (M6 gate)
- [ ] **Masonry grid:** Pawn homepage discovery section for Sandra. Infinite scroll on shop pages
- [ ] **Vertical video:** Cannabis and Fireworks item detail pages (Jordan persona)
- [ ] **ADR-003** committed to `/docs/adr/ADR-003-algolia-search.md`

## 3. Schema & Rules Impact

**Fields added/used on `items/{id}`:** `trendingScore` (Number), `merchandisingTags` (Array), `videoUrl` (String), `viewCount` (Number).

**Algolia index:** Mirrors `items` collection — synced via `onWrite` trigger on `items/{id}`.

## 4. AI Implementation Guidelines

Algolia index sync must use an `onWrite` Cloud Function — not a client-side call. The Algolia Admin API key must never be exposed to the client; use a Search-only key in the frontend. `rare-find` tags must only be set by staff — add a security rule that prevents customer role from writing `merchandisingTags`. Quick-view modal must pre-fetch item data on hover (not on click) to meet the 200ms requirement.

## 5. QA & Runbook Considerations

- Runbook: if Algolia is down, fall back to Firestore prefix search (searchTokens). This is why prefix tokens are maintained alongside Algolia
- Quick-view: measure open time with Playwright — fail CI if > 200ms on a cold cache
- ADR-003: Algolia adoption must be documented before this epic is marked implemented

## Task Checklist

- [ ] Staff picks admin UI + trending score Cloud Function (~8 pts, P0, S11)
- [ ] Collection pages, bundle recommendations, just-arrived + rare find auto-tagging (~8 pts, P1, S11)
- [ ] Quick-view modal — opens in < 200ms, cinematic imagery (~5 pts, P0, S12)
- [ ] Algolia integration — typo-tolerance, fuzzy, synonyms, per-view faceting, admin index management (~8 pts, P0, S12)
- [ ] Masonry discovery section (Sandra) + vertical video support (cannabis/fireworks) (~5 pts, P1, S12)
