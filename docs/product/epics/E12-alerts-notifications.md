---
epic_id: E12
title: "Alerts & Notifications"
github_issue:
github_milestone: "M9 — CRM & Retention"
status: planned
sprint: S19
priority: P1
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - kevin
  - dale
  - tanya
  - marie
  - marcus
schema_impact: true
compliance_review: required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E12: Alerts & Notifications

**Milestone Gate (M9):** E12 alerts, favourites, SMS active. Weekly personalised digest per view running.

## 1. Executive Summary & Persona Focus

Delivers saved searches with category alert subscriptions, an in-app notification centre, SMS alerts via Twilio, favourites/wishlist, and seasonal reminders. New inventory matching a saved search must trigger within 60 seconds of listing — this is an acceptance criterion.

**Primary Personas:** Kevin (electronics category subscriptions, SMS alerts), Dale (saved pawn-related searches, notifications), Tanya (seasonal reminders, click-and-collect pickup confirmations), Marcus (vintage/rare-find search terms).
**Business Goal:** Retain customers by notifying them the moment relevant inventory appears. Kevin and Dale return without being prompted.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Saved searches:** `savedSearches/{id}` collection. Customer can save a search query + viewTag + category. Favourites/wishlist on item detail pages. Marcus: vintage/rare-find/limited-edition terms tracked
- [ ] **Notification centre:** In-app notification centre showing alert history. Mark as read
- [ ] **SMS alerts (Twilio):** New inventory matching a saved search triggers SMS/email within 60 seconds of listing. Kevin and Dale primary targets
- [ ] **Seasonal reminders:** CRM-triggered campaign reminders (Tanya). Pickup confirmation SMS when click-and-collect window is confirmed
- [ ] **Weekly digest:** Personalised weekly email digest per view — summarises new inventory matching saved searches

## 3. Schema & Rules Impact

**New collection:** `savedSearches/{id}` — see `/docs/schema/firestore-schema.md`.

**Trigger:** `onItemCreated` Cloud Function — query `savedSearches` for matches, dispatch SMS/email via Twilio/SendGrid within 60 seconds.

## 4. AI Implementation Guidelines

The 60-second alert SLA requires the `onItemCreated` trigger to be highly reliable. Use a Firestore queue pattern if Twilio has delivery latency — write to a `notificationQueue` and process in batches. CASL compliance: SMS alerts require explicit opt-in; verify `alertMethod` is set and `active == true` before sending.

## 5. QA & Runbook Considerations

- Test 60-second SLA under load: create 100 items in rapid succession and verify all matching subscribers are notified
- Twilio failure fallback: if SMS fails, fall back to email; log failure to `auditLogs`
- Weekly digest: test unsubscribe link compliance (CASL)

## Task Checklist

- [ ] Saved searches + category alerts + favourites/wishlist (~5 pts, P1, S19)
- [ ] Notification centre + SMS alerts (Twilio) (~8 pts, P1, S19)
- [ ] Seasonal reminders + pickup confirmation via SMS (~5 pts, P1, S19)
