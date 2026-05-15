---
epic_id: E06
title: "eBay & Cross-Post"
github_issue:
github_milestone: "M5 — eBay & Cross-Post"
status: planned
sprint: S9
priority: P0
owner: platform-team
views:
  - pawn
personas:
  - dale
  - kevin
schema_impact: true
compliance_review: required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E06: eBay & Cross-Post

**Milestone Gate (M5):** Sandbox end-to-end test passes. Staff can push pawn items to eBay. Status syncs back. Cannabis/fireworks use local-pickup-only correctly.

## 1. Executive Summary & Persona Focus

Integrates eBay's API for cross-posting pawn inventory, with automated status sync back to Firestore and a staff-facing cross-post dashboard. Cannabis and fireworks items are automatically flagged local-pickup-only — this is a compliance requirement enforced at the function level.

**Primary Personas:** Dale (relies on eBay reach for pawn sales), Kevin (reseller monitoring eBay status).
**Business Goal:** Extend pawn item reach to eBay buyers without double-handling. Status sync eliminates overselling risk.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **eBay OAuth:** Token flow implemented. Tokens stored securely (not in Firestore plain text)
- [ ] **`ebayListItem` Cloud Function:** Maps Firestore `items` fields to eBay listing format. Condition mapping implemented. Cannabis/fireworks items automatically set to local-pickup-only — enforced server-side
- [ ] **`ebaySyncStatus` Cloud Function:** Scheduled every 4 hours — syncs sold/active status back to `items/{id}.ebayStatus`
- [ ] **`ebayRefreshToken` Cloud Function:** Scheduled daily — refreshes OAuth token before expiry
- [ ] **`ebayPublishOffer` callable:** Admin-triggered — lists item on eBay from admin dashboard
- [ ] **Cross-post dashboard:** Per-item eBay toggle, listing status, Kijiji draft generation, Facebook deep-link. Cannabis/fireworks items auto-flag as local-pickup-only (visible to staff)
- [ ] **Sandbox E2E test:** Full flow tested in eBay sandbox before production credentials used

## 3. Schema & Rules Impact

**Fields added to `items/{id}`:** `ebayListingId` (String), `ebayStatus` (String: `active | sold | ended`).

**Security rules:** Staff-only write on eBay fields. `ebayListingId` cannot be set by customer role.

## 4. AI Implementation Guidelines

eBay API calls must go through Cloud Functions — never call the eBay API from the client. Rate limiting: eBay enforces per-day listing limits; build a counter in Firestore to track daily usage. The local-pickup-only enforcement for cannabis/fireworks must be server-side in the Cloud Function, not just a UI flag.

## 5. QA & Runbook Considerations

- Runbook: eBay API failure playbook — if sync fails, items remain in their last-known state; staff alerted via Sentry. Manual re-sync available in dashboard
- Production OAuth credentials are distinct from sandbox — never commit credentials to git; use Secret Manager
- Test cannabis/fireworks local-pickup-only enforcement explicitly before M5 gate

## Task Checklist

- [ ] eBay OAuth + ebayListItem Cloud Function (~8 pts, P0, S9)
- [ ] ebayPublishOffer, ebaySyncStatus (4h schedule), ebayRefreshToken (daily) (~8 pts, P0, S9)
- [ ] Admin cross-post dashboard — eBay toggle, Kijiji draft, Facebook deep-link (~8 pts, P1, S9)
