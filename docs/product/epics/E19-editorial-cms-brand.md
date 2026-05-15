---
epic_id: E19
title: "Editorial CMS & Brand Narrative"
github_issue:
github_milestone: "M8 — AI & Post-Sale"
status: planned
sprint: S19
priority: P0
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - marcus
  - jordan
  - sandra
  - makoonsii
  - dale
schema_impact: true
compliance_review: required
compliance_reviewed: false
ai_review: required
child_issues: []
---

# Epic E19: Editorial CMS & Brand Narrative

**Milestone Gate (M8/M11):** E19 editorial CMS with first 5 articles including founder story. Finds of the Week published at M11.

## 1. Executive Summary & Persona Focus

Delivers the editorial CMS for blog/article publishing, the brand narrative pages (About, founder story, Akwesasne identity), the Warriors of Akwesasne editorial series, Finds of the Week, and local SEO landing pages. The Kanien'kéha language gate is a hard compliance requirement — all phrases require community review before publication.

**Primary Personas:** Marcus + Jordan (editorial content, Warriors of Akwesasne series), Sandra (Finds of the Week), Makoonsii (Akwesasne identity, community trust), Dale (local SEO landing pages — Cornwall/Akwesasne area).
**Business Goal:** Establish the brand's cultural identity and editorial voice. Local SEO pages drive organic discovery. Finds of the Week creates a weekly return habit.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Editorial CMS:** Admin article editor (title, body rich text, viewTag, slug, seoMeta, publishedAt). Public article list and detail pages per view. RSS feed. `articles/{id}` Firestore collection
- [ ] **About page + founder story:** Written and published. Akwesasne identity section ("Dapper. Debonair. Distinctly Akwesasne.")
- [ ] **Warriors of Akwesasne series:** Launch edition published by M11. All Kanien'kéha phrases community-reviewed
- [ ] **Finds of the Week:** First edition published at M11. Weekly curated highlights format. Marcus and Sandra primary audience
- [ ] **Local SEO landing pages:** Minimum 6 pages (Cornwall, Akwesasne, surrounding region — per view). FAQ engine (admin-editable Q&A). Initial buying guides (collectibles, cannabis wellness, fireworks safety). Minimum 6 pages live at M11

## 3. Schema & Rules Impact

**New collection:** `articles/{id}` — see `/docs/schema/firestore-schema.md`.

**Security rules:** Public read when `status == "published"`. Admin/marketing_staff write.

## 4. AI Implementation Guidelines

AI can assist with drafting article content but **must not generate Kanien'kéha language** — all indigenous language copy requires human community review. The Finds of the Week format should be templated so a non-technical staff member can publish weekly without editing code. Local SEO pages must include structured data (JSON-LD LocalBusiness schema) and be submitted to Google Search Console after publish.

## 5. QA & Runbook Considerations

- Kanien'kéha gate: add a pre-publish checklist item in the CMS — "Community review of indigenous language: confirmed" — before any article containing Kanien'kéha can be published
- RSS feed: validate against W3C RSS validator before M11
- Local SEO pages: run through Lighthouse SEO check — target ≥95

## Task Checklist

- [ ] Editorial CMS — blog/article admin UI + articles Firestore collection (~8 pts, P0, S19)
- [ ] Brand narrative — About page, founder story, Akwesasne identity, Warriors of Akwesasne series (~5 pts, P0, S19) `type:compliance`
- [ ] Finds of the Week — launch edition published at M11 (~3 pts, P0, S19)
- [ ] Local SEO landing pages (≥6) + FAQ engine + buying guides (~8 pts, P1, S19)
