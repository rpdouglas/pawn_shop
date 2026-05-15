---
epic_id: E15
title: "CRM & Retention"
github_issue:
github_milestone: "M9 — CRM & Retention"
status: planned
sprint: S18
priority: P1
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
personas:
  - marcus
  - kevin
  - jordan
schema_impact: true
compliance_review: not-required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E15: CRM & Retention

**Milestone Gate (M9):** autoFollowUp tested. Marcus cross-view journey validated in CRM. VIP tiers active (Marcus, Kevin, Jordan).

## 1. Executive Summary & Persona Focus

Builds the `customers/{uid}` CRM profile system, VIP and reseller tiers, automated follow-up Cloud Functions, and the `/admin/crm` dashboard. The Marcus cross-view browsing flag tracks multi-view sessions and contributes to engagement scoring.

**Primary Personas:** Marcus (VIP flag, cross-view tracking, engagement score), Kevin (high-frequency enquiries → VIP candidate, reseller tier), Jordan (editorial engagement tracking).
**Business Goal:** Turn high-value customers into repeat buyers through personalised engagement. autoFollowUp reduces staff overhead for pawn quote management.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Customer profiles:** `customers/{uid}` — purchaseHistory, inquiryHistory, lifetimeValue, first/last seen, categoryPreference, viewPreference, engagementScore written by Cloud Functions
- [ ] **VIP flag + reseller tiers:** `vipFlag` (Boolean), `resellerTier` (none/bronze/silver/gold). VIP triggers: Marcus (high photography-click rate, long session, deep scroll), Kevin (high-frequency enquiries), Jordan (editorial engagement). Admin can manually apply VIP flag
- [ ] **Automated follow-ups:** 48h after pawnRequest with no staff response → staff reminder email. 72h after quote sent with no customer response → gentle customer follow-up email
- [ ] **CRM dashboard /admin/crm:** Customer list — searchable/filterable by segment, VIP, viewTag. Individual profile view with full history, engagement score, VIP flag toggle, reseller tier selector. Manager role only
- [ ] **Marcus cross-view browsing flag:** `crossViewBrowsing: true` on `customers/{uid}` when session spans 2+ view namespaces. `engagementScore +15`. Surfaced in CRM dashboard

## 3. Schema & Rules Impact

**New collection:** `customers/{uid}` — see `/docs/schema/firestore-schema.md` for full field list.

**Security rules:** Cloud Function write only. Manager-role read. Customers cannot read their own CRM document.

## 4. AI Implementation Guidelines

Engagement score calculation must run server-side (Cloud Function) — never compute it client-side where it can be manipulated. Cross-view browsing detection should use session ID (not user agent) to group events — a single user browsing pawn then cannabis in the same browser session counts as cross-view. The automated follow-up emails must use the staff's name in the signature, not a generic "The Pawn Shop Team" when writing to customers who have an existing relationship.

## 5. QA & Runbook Considerations

- autoFollowUp: test that the 48h reminder does not fire if staff has already responded
- VIP flag: test that manual admin override is reflected in CRM dashboard within one page load
- Cross-view flag: test session spanning two view namespaces — verify flag is set and score increments

## Task Checklist

- [ ] Customer profiles — purchaseHistory, inquiryHistory, lifetimeValue, segments (~8 pts, P0, S18)
- [ ] VIP flag + reseller tiers (bronze/silver/gold) — Marcus, Kevin, Jordan primary targets (~5 pts, P1, S18)
- [ ] Automated follow-ups — 48h pending staff reminder, 72h quoted customer gentle follow-up (~5 pts, P1, S18)
- [ ] CRM dashboard /admin/crm — full customer profile view, engagement scoring (~8 pts, P1, S18)
- [ ] Marcus cross-view browsing flag — multi-view sessions tracked in CRM (~3 pts, P1, S18)
