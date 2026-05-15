---
epic_id: E04
title: "Inventory Schema & Intake"
github_issue:
github_milestone: "M4 — Alpha: Three-View Storefront"
status: planned
sprint: S5
priority: P0
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - dale
  - kevin
  - marcus
schema_impact: true
compliance_review: required
compliance_reviewed: false
ai_review: required
child_issues: []
---

# Epic E04: Inventory Schema & Intake

**Milestone Gate (M4):** All 3 view homepages live on dev with real Firestore data. Age gates active. Prefix search working. Mobile-responsive.

## 1. Executive Summary & Persona Focus

Defines and documents the Firestore `items/{id}` v3 schema, then builds the complete staff intake workflow: admin form, multi-image upload with per-view watermarking, hold/reservation system, and QR/barcode generation. This is the data foundation all three storefronts depend on.

**Primary Personas:** Dale (needs clear pricing + condition grading), Kevin (hold system, reseller workflow), Marcus (provenanceNotes field — v5.0 addition).
**Business Goal:** Staff can receive, grade, photograph, price, and publish any item to one or more views without touching code.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Schema v3 documented:** `items/{id}` schema fully defined in `/docs/schema/firestore-schema.md` — all fields including `viewTag`, `viewTags`, `locationId`, `isSeasonalItem`, `bundleIds`, `merchandisingTags`, `videoUrl`, `aiDescription`, `aiPriceSuggestion`, `provenanceNotes`
- [ ] **Intake workflow:** Admin form covers full workflow — receive → condition grading → photography → pricing → publish. Supports all three viewTags
- [ ] **Multi-image upload:** Firebase Storage upload. Per-view watermark overlay applied on upload. Served as WebP/AVIF via Firebase Hosting CDN
- [ ] **Hold system:** Item status → `reserved`, `holdExpiresAt` timestamp. Cloud Function resets expired holds to `active` every 30 minutes. Admin UI shows holds dashboard
- [ ] **Barcode/QR:** QR label generated per item. `searchTokens` array built from title/category for prefix search. QR print view in admin

## 3. Schema & Rules Impact

**Primary collection:** `items/{id}` — full v3 schema (see `/docs/schema/firestore-schema.md`).

**Security rules:** Public read only when `status == "active"`. Staff write. `serialBlacklistFlag` admin-only write.

**Cloud Functions:** `resetExpiredHolds` (scheduled, every 30 min).

## 4. AI Implementation Guidelines

When generating image upload code, use Firebase Storage with signed URLs — never expose raw Storage URLs to the public. Watermark overlay should be applied server-side in a Cloud Function, not client-side. The `searchTokens` array must be regenerated whenever `title` or `category` changes — wire this to an `onWrite` trigger.

`provenanceNotes` is a Marcus-persona field: AI-assisted descriptions for provenance should be drafted in `aiDescription` and require staff review before moving to `description`.

## 5. QA & Runbook Considerations

- Fallback if hold reset function fails: manual admin override in holds dashboard
- Image upload fallback: local file preserved until Storage confirms success
- Schema changes after this Epic must update `/docs/schema/firestore-schema.md` and pass `schema-guard.yml`

## Task Checklist

- [ ] Firestore inventory schema v3 — viewTag, viewTags, provenanceNotes (~5 pts, P0, S5)
- [ ] Add Item admin form + intake workflow (~8 pts, P0, S5)
- [ ] Multi-image upload + per-view watermark (~5 pts, P0, S5)
- [ ] Hold system + holdExpiry Cloud Function (~5 pts, P1, S5)
- [ ] Barcode/QR generation + searchTokens (~5 pts, P1, S5)
