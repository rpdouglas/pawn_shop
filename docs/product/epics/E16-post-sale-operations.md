---
epic_id: E16
title: "Post-Sale Operations"
github_issue:
github_milestone: "M8 — AI & Post-Sale"
status: planned
sprint: S17
priority: P1
owner: platform-team
views:
  - pawn
personas:
  - kevin
  - dale
schema_impact: true
compliance_review: not-required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E16: Post-Sale Operations

**Milestone Gate (M8):** E16 post-sale operations delivered.

## 1. Executive Summary & Persona Focus

Handles what happens after a sale: return/dispute ticket creation and tracking, refund logging, staff resolution notes, and eBay dispute workflow integration (pull dispute from eBay API, respond via admin). Primarily a staff-facing operational capability.

**Primary Personas:** Kevin (reseller — may dispute condition misrepresentation), Dale (return/exchange on pawn items).
**Business Goal:** Give staff a structured workflow for post-sale exceptions. eBay disputes handled in the admin portal reduce platform switching.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Return/dispute tickets:** Customer or staff can open a return/dispute ticket linked to an `items/{id}`. Status tracking: `open` / `investigating` / `resolved`
- [ ] **Refund log:** Staff records refund amount, method, and resolution notes on the ticket
- [ ] **eBay dispute workflow:** Pull open disputes from eBay API. Staff can read dispute detail and submit response from admin portal

## 3. Schema & Rules Impact

**New collection:** `disputes/{id}` — fields: `itemId`, `uid`, `status`, `type` (`return | dispute`), `description`, `refundAmount`, `refundMethod`, `staffNotes`, `ebayDisputeId`, `createdAt`, `resolvedAt`.

**Security rules:** Staff full read/write. Customer create-only (cannot edit after submission). Admin-only delete.

## 4. AI Implementation Guidelines

eBay dispute API calls must go through Cloud Functions — same pattern as E06. Dispute responses submitted via admin must be validated for character limits before calling the eBay API (eBay enforces response length limits). Staff resolution notes are internal only — never surface them in any customer-facing view.

## 5. QA & Runbook Considerations

- Test eBay dispute pull: verify disputes appear in admin within 5 minutes of being opened on eBay
- Refund log: verify refund entries cannot be deleted by non-admin roles
- Test that resolving a dispute updates `items/{id}.status` if the item is being returned to stock

## Task Checklist

- [ ] Return/dispute tickets, dispute tracking, refund log, eBay dispute workflow (~8 pts, P1, S17)
