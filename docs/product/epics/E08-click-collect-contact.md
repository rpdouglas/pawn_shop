---
epic_id: E08
title: "Click-and-Collect & Contact Channels"
github_issue:
github_milestone: "M7 — Beta: Full Feature Set"
status: planned
sprint: S15
priority: P0
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - tanya
  - kevin
  - marie
  - sandra
schema_impact: false
compliance_review: required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E08: Click-and-Collect & Contact Channels

**Milestone Gate (M7):** UAT complete. Beta feature set delivered.

## 1. Executive Summary & Persona Focus

Implements click-and-collect (reserve online, collect in store) and adds the contact channel widgets: Facebook Messenger, WhatsApp (Marie's anonymous inquiry path), Google Maps embed, and Instagram feed. Also delivers CASL-compliant newsletter signup and reseller registration.

**Primary Personas:** Tanya (mobile click-and-collect, seasonal reminders), Kevin (click-and-collect, reseller registration), Marie (WhatsApp anonymous inquiry), Sandra (social channel discovery).
**Business Goal:** Convert browse sessions into physical store visits. WhatsApp is a primary conversion path for privacy-conscious customers.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Click-and-collect:** Customer reserves item → `status: pending_pickup` → staff notification → staff confirms pickup window → SMS + email confirmation to customer
- [ ] **Facebook Messenger deep-link:** On relevant pages (shop, item detail)
- [ ] **WhatsApp button:** Critical for Marie's anonymous inquiry path — no account required
- [ ] **Google Maps embed:** Store location on About/Contact page
- [ ] **Instagram feed widget:** Curated feed on Pawn homepage (Sandra discovery)
- [ ] **Newsletter signup:** CASL double opt-in — confirmation email required before subscribing. Per-view subscription with `viewTag` stored in Firestore. Mailchimp or Buttondown integration
- [ ] **Reseller registration form:** Staff review workflow. `resellerTier` set by staff after review

## 3. Schema & Rules Impact

No new collections. `items/{id}.status` transitions to `pending_pickup`. `customers/{uid}.newsletterSubscribed` and `newsletterViewTag` fields updated by Cloud Function on opt-in confirmation.

## 4. AI Implementation Guidelines

WhatsApp deep-link format: `https://wa.me/[number]?text=[url-encoded-message]` — pre-populate with item name/URL for context. Never hard-code the phone number in source — read from environment config. CASL double opt-in must send a confirmation email through SendGrid with the correct DKIM/DMARC domain before subscribing.

## 5. QA & Runbook Considerations

- Test click-and-collect: verify item cannot be purchased by another customer while `status == pending_pickup`
- CASL compliance: verify confirmation email is sent and subscription is not active until confirmed
- WhatsApp button must open native app on mobile, web client on desktop

## Task Checklist

- [ ] Click-and-collect full workflow — reserve, staff notification, pickup window, SMS/email (~8 pts, P0, S15)
- [ ] Facebook Messenger, WhatsApp button, Google Maps, Instagram feed (~5 pts, P1, S16)
- [ ] Newsletter CASL double opt-in + reseller registration form (~5 pts, P1, S16) `type:compliance`
