---
epic_id: E18
title: "AI Assistant (Staff-Facing)"
github_issue:
github_milestone: "M8 — AI & Post-Sale"
status: planned
sprint: S17
priority: P0
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - marcus
  - jordan
  - dale
schema_impact: false
compliance_review: not-required
compliance_reviewed: false
ai_review: required
child_issues: []
---

# Epic E18: AI Assistant (Staff-Facing)

**Milestone Gate (M8):** AI description generation tested on 10 real items. Finds of the Week published.

## 1. Executive Summary & Persona Focus

Delivers GPT-4o powered staff tools: AI description generation with provenance copy for Marcus-grade items, eBay title optimisation, auto-tagging, category recommendation, price suggestion from eBay sold comps, and duplicate detection. All AI features are staff-facing only — no customer-facing AI in v5.0 (ADR-004).

**Primary Personas:** Marcus (provenance, cultural context, collecting significance in descriptions — staff uses AI to meet his standard), Jordan (editorial quality descriptions for article tie-ins), Dale (eBay title optimisation, price suggestion from comps).
**Business Goal:** Dramatically reduce the time staff spend writing item descriptions and eBay titles, while raising quality to match the Marcus-grade standard.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **`generateAIDescription` Cloud Function:** Callable. Prompts GPT-4o with item details + photography context. Staff reviews before publish — **no auto-publish**. For Marcus items: prompt must include provenance, cultural context, and collecting significance
- [ ] **eBay title optimisation:** Character limit enforcement, keyword density. AI suggests optimised title; staff can accept/edit
- [ ] **Auto-tagging:** Minimum 3 tag suggestions per item. Staff accepts/edits
- [ ] **Category recommendation:** From item description text. Staff accepts/edits
- [ ] **Price suggestion:** eBay sold comps API query returns price range (not a specific price). Displayed as guidance only — not a published price
- [ ] **Duplicate detection:** Flag items with similar title/category already in Firestore. Staff alerted before publishing
- [ ] **ADR-004** committed to `/docs/adr/ADR-004-staff-only-ai.md`

## 3. Schema & Rules Impact

**Fields used on `items/{id}`:** `aiDescription` (String — raw GPT output, not shown to customers), `aiPriceSuggestion` (Map), `merchandisingTags` (Array — AI suggestions, staff-confirmed only).

No new collections.

## 4. AI Implementation Guidelines

OpenAI API key must never be exposed to the client — all GPT-4o calls go through Cloud Functions. The `generateAIDescription` prompt must include:
- Item title, category, condition
- Photography context (if available)
- For Marcus-grade items (`persona:marcus` tagged): explicit instruction to include provenance, cultural context, collecting significance, and scarcity

`aiDescription` is a draft field — it must never be displayed to customers without staff explicitly moving it to the `description` field. Add a Firestore security rule preventing customers from reading `aiDescription`.

## 5. QA & Runbook Considerations

- Test `generateAIDescription` on 10 real items before M8 gate (per milestone requirement)
- Price suggestion: verify it shows a range, not a single price, and is labelled "guidance only" in the UI
- Duplicate detection: test with near-identical titles — verify staff is alerted before publishing

## Task Checklist

- [ ] generateAIDescription Cloud Function — GPT-4o, staff review gate (~8 pts, P0, S17)
- [ ] eBay title optimization + auto-tagging (min 3 suggestions) + category recommendation (~5 pts, P1, S17)
- [ ] Price suggestion — eBay sold comps for Dale + duplicate detection (~5 pts, P1, S17)
