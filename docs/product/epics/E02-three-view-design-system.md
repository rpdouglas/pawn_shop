---
epic_id: E02
title: "Three-View Design System"
github_issue:
github_milestone: "M2 — Three-View Design System"
status: planned
sprint: S2
priority: P0
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - marcus
  - jordan
  - marie
  - tanya
schema_impact: false
compliance_review: required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E02: Three-View Design System

**Milestone Gate (M2):** WCAG AA contrast pass on all 3 palettes. All components in Storybook. Three-view tokens committed. Photography brief + motion spec drafted.

## 1. Executive Summary & Persona Focus

Establishes the complete visual design language for all three public-facing views (Pawn, Cannabis, Fireworks) using Tailwind v4's CSS-first `@theme` system. Delivers a `ViewContext` React provider that injects the correct CSS class based on URL prefix, enabling theme switching without JS conditionals. Compliance: WCAG AA accessibility audit is a hard gate for M2.

**Primary Personas:** Marcus (luxury presentation standard), Tanya (mobile-first usability), Marie (all-view admin).
**Business Goal:** "Dapper. Debonair. Distinctly Akwesasne." — every view must feel premium and intentional.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Pawn tokens:** `--color-primary: #C8A14A`, `--color-bg: #080706`, fonts Playfair Display + IM Fell English. `.view-pawn` class implemented
- [ ] **Cannabis tokens:** `--color-primary: #7B4FA0`, `--color-bg: #1A0D2E`, fonts Cormorant Garamond + DM Sans. `.view-cannabis` class implemented
- [ ] **Fireworks tokens:** `--color-primary: #C0392B`, `--color-bg: #1A0A0A`, fonts Bebas Neue + Oswald. `.view-fireworks` class implemented
- [ ] **Core Pawn component library:** Button, Badge, Card, Modal, Input, Table — all WCAG AA compliant. Storybook stories for default, hover, disabled, error states
- [ ] **Cannabis variants:** Cinematic hero, mood collection card, luxury product card
- [ ] **Fireworks variants:** Countdown timer, bundle card, urgency badge
- [ ] **ViewContext provider:** Reads URL prefix (`/pawn`, `/cannabis`, `/fireworks`), injects CSS class on root element
- [ ] **PWA manifest:** Per-view icons and theme colours. Workbox offline shell caching. Install prompt tested on mobile
- [ ] **Motion Design Spec:** `/docs/design/motion-spec.md` — timing, easing, transitions for dark luxury aesthetic
- [ ] **Photography Brief v1:** `/docs/design/photography-brief.md` — dark luxury standard (lighting, background, props, post-processing)
- [ ] **WCAG AA audit:** axe-core integrated into CI. Failures fixed. Results documented in `/docs/reports/wcag-audit-sprint3.md`
- [ ] **ADR-002** committed to `/docs/adr/ADR-002-three-view-architecture.md`

## 3. Schema & Rules Impact

No Firestore schema changes. ViewContext reads URL only.

## 4. AI Implementation Guidelines

When generating component variants, always scope styles to the parent view class (`.view-pawn`, `.view-cannabis`, `.view-fireworks`). Never use hardcoded colour hex values in components — always reference CSS custom properties (`var(--color-primary)`). Reference `CONTEXT_DUMP.md` for the Dapper-Debonair aesthetic guidelines.

Cannabis and Fireworks view changes must have `compliance:reviewed` label on the PR before merge.

## 5. QA & Runbook Considerations

- Fallback if ViewContext fails: default to `.view-pawn` theme
- Run Storybook visual regression tests before each sprint review
- Photography brief must be signed off by business owner before Marcus-persona features are designed

## Task Checklist

- [ ] Define Tailwind v4 base @theme — gold/black palette (Pawn view) (~5 pts, P0, S2)
- [ ] Build core Pawn view component library (Button, Badge, Card, Modal, Input, Table) (~8 pts, P0, S2)
- [ ] Configure PWA manifest + Workbox service worker (~3 pts, P1, S2)
- [ ] Draft Motion Design Spec (~3 pts, P1, S2)
- [ ] Draft Photography Brief v1 — dark luxury standard (~3 pts, P0, S2)
- [ ] Cannabis view token overrides + component variants (~8 pts, P0, S3)
- [ ] Fireworks view token overrides + component variants (~8 pts, P0, S3)
- [ ] Implement ViewContext provider (~3 pts, P0, S3)
- [ ] WCAG AA contrast audit — all three view palettes (~3 pts, P0, S3)
