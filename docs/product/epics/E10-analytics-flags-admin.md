---
epic_id: E10
title: "Analytics, Feature Flags & Admin Tools"
github_issue:
github_milestone: "M7 — Beta: Full Feature Set"
status: planned
sprint: S10
priority: P1
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - kevin
schema_impact: true
compliance_review: not-required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E10: Analytics, Feature Flags & Admin Tools

**Milestone Gate (M7):** UAT complete. Beta feature set delivered.

## 1. Executive Summary & Persona Focus

Delivers the analytics dashboard (per-view sales velocity, inventory aging, UTM attribution), a Firestore-backed feature flag system for soft rollout of post-launch features, and the admin audit log viewer. Feature flags are used at M11 to soft-launch E12, E15, E17, and E18 behind gates.

**Primary Personas:** Kevin (analytics — high-frequency buyer patterns), Marie (admin audit log viewer — compliance oversight).
**Business Goal:** Give the business owner and staff data-driven visibility into performance without requiring external analytics tools for internal reporting.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Analytics dashboard:** Per-view sales velocity, inventory aging, most-viewed items, top categories, pawn conversion funnel. Sourced from Firestore + GA4
- [ ] **UTM attribution dashboard:** Traffic by source (Facebook/eBay/Instagram/Google Maps/TikTok) per view. Conversion and customer acquisition cost
- [ ] **Feature flag system:** `config/featureFlags` Firestore document. `useFeatureFlag(key)` React hook reads flags on app init. Admin UI to toggle flags without code deploy
- [ ] **Audit log viewer:** `/admin/audit` — filterable list of all auth events, inventory changes, role changes, pawn status updates. Admin-only. Read from `auditLogs` collection

## 3. Schema & Rules Impact

**New document:** `config/featureFlags` (single document in `config` collection). Admin-only write; public read.

No new collections — analytics sourced from existing `items`, `pawnRequests`, and GA4.

## 4. AI Implementation Guidelines

Feature flags must be read once on app init and cached — do not call Firestore on every render. The `useFeatureFlag(key)` hook should use React context to share the flag state across the component tree. When building the analytics dashboard, aggregate data in Cloud Functions and cache results — never run analytics queries directly against production Firestore from the client.

## 5. QA & Runbook Considerations

- Feature flags: test that disabling a flag via admin UI takes effect within one page reload (no hard refresh required)
- Analytics: verify UTM parameters are correctly captured for all three view entry points
- Audit log viewer: confirm non-admin roles receive a 403, not an empty list

## Task Checklist

- [ ] Admin analytics dashboard — per-view sales velocity, aging, most viewed (~8 pts, P1, S13)
- [ ] UTM attribution per-view dashboard (~5 pts, P1, S13)
- [ ] Feature flag system — Firestore config/featureFlags + useFeatureFlag hook (~3 pts, P0, S10)
- [ ] Audit log viewer in admin portal (~5 pts, P1, S10)
