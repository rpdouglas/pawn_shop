---
epic_id: E14
title: "Seasonal Campaign Scheduler"
github_issue:
github_milestone: "M7 — Beta: Full Feature Set"
status: planned
sprint: S8
priority: P0
owner: platform-team
views:
  - fireworks
  - pawn
  - cannabis
personas:
  - tanya
schema_impact: true
compliance_review: not-required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E14: Seasonal Campaign Scheduler

**Milestone Gate (M7):** Seasonal engine (E14) delivered. UAT complete.

## 1. Executive Summary & Persona Focus

Enables non-technical staff to activate/deactivate seasonal campaigns without a code deploy. Homepage takeover renders from `config/campaigns` within 60 seconds of activation. Includes pre-built holiday templates and a countdown timer hero that is Tanya's primary urgency trigger on the Fireworks view.

**Primary Personas:** Tanya (urgency trigger, countdown timer, event category navigation, seasonal reminders).
**Business Goal:** Let the business owner respond to seasonal opportunities (Canada Day, Diwali, New Year, Summer BBQ) in minutes, not days.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Campaign scheduler admin UI:** Non-technical staff can activate/deactivate campaigns. Homepage takeover renders within 60 seconds of activation. Config sourced from `config/campaigns` Firestore document
- [ ] **4 pre-built templates:** Canada Day, Diwali, New Year, Summer BBQ. Each includes: homepage hero override, countdown timer, category boost rules, event inquiry form variant. One-click activation
- [ ] **Countdown timer hero:** Auto-updating. Powers Fireworks view urgency (Tanya). Built in S8 alongside Fireworks homepage (E05)
- [ ] **Category boost logic:** Seasonal items float to top of shop page. `isSeasonalItem` field drives boost. Event inquiry form for bulk/display orders

## 3. Schema & Rules Impact

**Document updated:** `config/campaigns` — see `/docs/schema/firestore-schema.md`. Admin/marketing_staff write; public read. Must reflect within 60 seconds of write (no server-side caching beyond 60s).

**Field used on `items/{id}`:** `isSeasonalItem` (Boolean) — pre-existing field from E04 schema.

## 4. AI Implementation Guidelines

The campaign scheduler reads `config/campaigns` on page load via a real-time Firestore listener — this ensures the 60-second activation SLA without polling. The countdown timer must compute its target from `config/campaigns.countdownTarget` (a Firestore Timestamp) — never hardcode dates in components.

## 5. QA & Runbook Considerations

- Test 60-second SLA: activate a campaign and measure time to homepage render change
- Test campaign deactivation: verify homepage returns to default state cleanly
- Pre-built templates: verify all 4 templates render correctly before M7 UAT

## Task Checklist

- [ ] Countdown timer hero component + category boost logic (~5 pts, P0, S8)
- [ ] Campaign scheduler admin UI — no code deploy required (~8 pts, P0, S15)
- [ ] Holiday campaign templates — Canada Day, Diwali, New Year, Summer BBQ (~5 pts, P1, S15)
