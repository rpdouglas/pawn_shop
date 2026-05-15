---
epic_id: E17
title: "Conversion Optimisation"
github_issue:
github_milestone: "M7 — Beta: Full Feature Set"
status: planned
sprint: S14
priority: P1
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - marcus
  - sandra
  - dale
  - kevin
schema_impact: false
compliance_review: not-required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E17: Conversion Optimisation

**Milestone Gate (M7):** Conversion optimization (E17) delivered. UAT complete.

## 1. Executive Summary & Persona Focus

A suite of conversion-focused features: social proof widgets (recently sold strip, testimonials, transaction counters), a privacy-safe live activity feed, scarcity indicators for Marcus, and a Firebase Remote Config A/B experiment framework. All scarcity signals must be authentic — no manufactured urgency.

**Primary Personas:** Marcus (authentic scarcity — `rare-find` flag, limited-edition framing), Sandra (recently sold strip, live activity feed — sense of shared discovery), Dale + Kevin (social proof — years in business, eBay verified).
**Business Goal:** Increase conversion rate by making the platform feel active, trusted, and scarce where genuinely warranted.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Social proof widgets:** Transaction counters, years in business badge, testimonials module, recently sold strip (primary Dale + Kevin trigger). Recently sold data sourced from Firestore `onItemSold` events
- [ ] **Live activity feed:** Shows what other users are currently viewing. Rate-limited (no performance impact). Privacy-safe: no PII, generalised as "Someone from Cornwall is viewing this". Sandra persona
- [ ] **Scarcity indicators:** `limited-edition` flag display (Marcus — genuine rarity only). Low-stock urgency module. Hold countdown badge on reserved items. **All scarcity signals must be authentic — not fake**
- [ ] **A/B experiment framework:** Firebase Remote Config for variant assignment. GA4 custom events for conversion tracking. Experiment runbook documented in `/docs/project-management/ab-testing.md`

## 3. Schema & Rules Impact

No new collections. Live activity feed uses ephemeral Firestore writes (short TTL) or Firebase Realtime Database — does not persist PII.

## 4. AI Implementation Guidelines

The live activity feed must generalise location to city/region level — never store or display a precise location. Rate-limit the feed writes to prevent a busy store from overwhelming Firestore write quota. The A/B framework should use Remote Config's percentage rollout feature — do not implement custom random assignment.

Scarcity signals: `rare-find` and `limited-edition` tags can only be set by staff. Add a Firestore security rule guard and a note in `GOVERNANCE.md` that manufactured scarcity is prohibited.

## 5. QA & Runbook Considerations

- Live activity feed: test with 50 concurrent simulated users — verify no PII leaks and no performance degradation
- A/B tests: document rollout plan in `/docs/project-management/ab-testing.md` before activating any experiment
- Scarcity signals: add a code review checklist item confirming scarcity is authentic

## Task Checklist

- [ ] Social proof widgets — transaction counters, years in business, testimonials, recently sold strip (~5 pts, P1, S14)
- [ ] Live activity feed — rate-limited, privacy-safe (~5 pts, P1, S14)
- [ ] Scarcity indicators — limited edition flag for Marcus + urgency modules (~5 pts, P1, S14)
- [ ] A/B experiment framework — Firebase Remote Config + GA4 (~5 pts, P2, S14)
