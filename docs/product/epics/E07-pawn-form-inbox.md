---
epic_id: E07
title: "Pawn Form & Staff Inbox"
github_issue:
github_milestone: "M7 — Beta: Full Feature Set"
status: planned
sprint: S10
priority: P0
owner: platform-team
views:
  - pawn
personas:
  - makoonsii
  - kevin
  - dale
schema_impact: true
compliance_review: required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E07: Pawn Form & Staff Inbox

**Milestone Gate (M7):** Pawn form, click-and-collect, seasonal engine, conversion optimization, CRM basics, compliance hardened. UAT complete.

## 1. Executive Summary & Persona Focus

Builds the customer-facing multi-step pawn submission form and the staff-facing pawn inbox with full status workflow. Includes server-side serial number blacklist checking — a compliance requirement. The anonymous submission option is critical for Makoonsii's trust relationship with the platform.

**Primary Personas:** Makoonsii (anonymous submission option, community trust), Kevin (enquiry workflow, hold integration), Dale (simple, fast pawn submission).
**Business Goal:** Enable customers to submit pawn requests digitally; give staff a structured inbox to manage quotes, acceptances, and police holds.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Multi-step pawn form:** Item details → condition → contact method (with anonymous option) → serial number capture. Submits to `pawnRequests/{id}`. Runs serial number blacklist check on submit
- [ ] **Admin pawn inbox:** Lists all `pawnRequests`. Status update workflow (received/quoted/accepted/completed/rejected). Police hold toggle (prevents auto-purge). Staff reply workflow with email notification to customer
- [ ] **Serial blacklist Cloud Function:** On `pawnRequests` create — check serial against blacklist. Flag `serialBlacklistFlag` in doc. Alert staff inbox if match found. Blacklist update procedure documented in runbook
- [ ] **Police hold:** `policeHold: true` blocks `purgeExpiredData` (E11). Admin-only write permission enforced

## 3. Schema & Rules Impact

**Collection written:** `pawnRequests/{id}` — see `/docs/schema/firestore-schema.md` for full field list.

**Security rules:** Create-only for customers. Owner-read if logged in. Staff full read/write. Admin-only write on `policeHold`.

**Cloud Function:** `checkSerialBlacklist` — triggered on `pawnRequests` create.

## 4. AI Implementation Guidelines

The anonymous submission path must not store any PII when `contactMethod == "anonymous"`. `contactValue` must be omitted or null. Staff replies to anonymous submissions are stored in the pawnRequest but not sent anywhere — staff must wait for the customer to return.

Serial number blacklist check is a compliance function — it must run server-side (Cloud Function), never client-side.

## 5. QA & Runbook Considerations

- Runbook: if blacklist check function fails on create, flag the request as unverified and alert staff — do not block submission silently
- Test anonymous path explicitly: verify no PII in Firestore after submission
- Police hold toggle must be tested to confirm it blocks the `purgeExpiredData` function (integration test)

## Task Checklist

- [ ] Multi-step pawn form — item details, condition, contact, serial number, anonymous option (~8 pts, P0, S10)
- [ ] Admin pawn inbox — status updates, police hold toggle, reply workflow (~8 pts, P0, S10)
- [ ] Serial number blacklist check Cloud Function (~5 pts, P0, S10) `type:compliance`
