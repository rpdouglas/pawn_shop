---
epic_id: E09
title: "Quality, Security & Performance"
github_issue:
github_milestone: "M10 — Staging Sign-Off"
status: planned
sprint: S16
priority: P0
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas: []
schema_impact: false
compliance_review: required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E09: Quality, Security & Performance

**Milestone Gate (M10):** Lighthouse ≥90 all views. Rules audited. Playwright suite passing. Sentry connected. Backup verified. Runbook complete.

## 1. Executive Summary & Persona Focus

The pre-launch hardening epic. Delivers Lighthouse CI gates, a comprehensive Firestore security rules audit, CSP headers + App Check, WebP/AVIF image pipeline, Sentry error monitoring, and a full Playwright E2E smoke suite. Nothing ships to production without passing all of these.

**Primary Personas:** All (performance and security affect every persona). Makoonsii — accessibility audit is part of this epic.
**Business Goal:** Ensure the platform is production-safe, legally defensible, and performant before staging sign-off.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Lighthouse CI gates:** Hard gates on all three view URLs — performance ≥90, accessibility ≥90, SEO ≥95. Must pass before any production deploy
- [ ] **Firestore security rules audit:** Verify: public read on `items` only for `status==active`; owner-only reads on `users/{uid}`; create-only on `consentLogs`; admin-only on `auditLogs`. Firebase emulator security rules test suite passing
- [ ] **CSP headers:** Configured via Firebase Hosting. Firebase App Check enabled. hCaptcha on pawn form. Honeypot field on pawn form. IP-based rate limiting on Cloud Functions
- [ ] **WebP + AVIF pipeline:** Automated conversion on image upload via Cloud Function. Served via Firebase Hosting CDN with `Accept` header negotiation
- [ ] **Sentry:** Integrated in React frontend and Cloud Functions. Source maps uploaded on deploy. Alert rules for error rate spikes. Tested with deliberate trigger
- [ ] **Playwright E2E smoke suite:** Covers all three view homepages, both age gates, item detail, pawn form submission, admin login + MFA, inventory add. Runs on every PR to `main`

## 3. Schema & Rules Impact

No new collections. Security rules review touches all existing collections — see `/docs/schema/firestore-schema.md` for rule requirements per collection.

## 4. AI Implementation Guidelines

CSP headers must be generated as Firebase Hosting `headers` config — not set via `<meta>` tags (which don't protect against all attack vectors). App Check tokens must be verified in all Cloud Function entry points. When adding hCaptcha, use server-side verification — never trust the client-side result alone.

## 5. QA & Runbook Considerations

- Runbook: Sentry alert triage playbook — classify by severity, escalate P0 immediately
- Lighthouse must be run against deployed URLs (not localhost) for gate to count
- Security rules test suite must run in Firebase emulator, not against production Firestore

## Task Checklist

- [ ] Lighthouse CI gates — ≥90 performance, ≥90 accessibility, ≥95 SEO (~3 pts, P0, S16)
- [ ] Firestore security rules audit (~5 pts, P0, S16) `type:compliance`
- [ ] CSP headers + Firebase App Check + hCaptcha + honeypot + IP rate-limit (~5 pts, P0, S16) `type:compliance`
- [ ] WebP + AVIF image pipeline (~3 pts, P1, S16)
- [ ] Sentry error monitoring integration (~3 pts, P0, S16)
- [ ] Playwright E2E full smoke suite (~8 pts, P0, S16)
