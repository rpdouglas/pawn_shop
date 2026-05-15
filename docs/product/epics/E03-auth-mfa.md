---
epic_id: E03
title: "Auth & MFA"
github_issue:
github_milestone: "M3 — Auth & MFA"
status: planned
sprint: S4
priority: P0
owner: platform-team
views:
  - pawn
personas:
  - marie
schema_impact: true
compliance_review: required
compliance_reviewed: false
ai_review: not-required
child_issues: []
---

# Epic E03: Auth & MFA

**Milestone Gate (M3):** MFA bypass must be impossible. Firebase Auth live. MFA enforced for all staff roles. Session management UI live. Audit log writing.

## 1. Executive Summary & Persona Focus

Implements the complete authentication and authorisation system: Firebase Auth with email/password + Google SSO, a five-role custom claims system, mandatory MFA for all staff, session management UI, and a tamper-resistant audit log. The MFA bypass gate is an absolute acceptance criterion — if bypass is possible, M3 does not pass.

**Primary Personas:** Marie (compliance oversight, role management, audit log review).
**Business Goal:** Protect inventory, pawn records, and age-gate logs from unauthorised access. Satisfy PIPEDA requirements for access control.

## 2. Acceptance Criteria (Definition of Done)

- [ ] **Firebase Auth:** Email/password and Google SSO providers configured. `AuthContext` and `ProtectedRoute` components implemented
- [ ] **Role system:** Five custom claims — `admin`, `manager`, `inventory_staff`, `marketing_staff`, `customer`. Cloud Function to assign/revoke roles. Role matrix documented in `/docs/project-management/roles.md`
- [ ] **MFA enforcement:** TOTP or SMS second factor mandatory for all staff roles on first login. **MFA bypass must be impossible** — this is a hard M3 gate
- [ ] **Session management UI:** Staff-facing page showing active sessions with revoke capability. Suspicious login detection (new IP/device) with email alert to account owner
- [ ] **Audit log:** `login`, `logout`, `role_change`, `mfa_enrolled`, `suspicious_login` events written to `auditLogs/{id}`. Audit logs cannot be deleted by non-admin roles

## 3. Schema & Rules Impact

**Collections written:** `auditLogs/{id}` (new events), `users/{uid}` (mfaEnrolled, lastLoginAt, lastLoginIp, lastLoginDevice fields).

**Security rules:** `users/{uid}` — owner-only read; admin-only write for `role` field. `auditLogs/{id}` — create-only for Cloud Functions; admin-only read; no delete.

## 4. AI Implementation Guidelines

MFA enforcement must happen server-side via Firebase Auth custom claims — do not rely solely on client-side route guards. The `ProtectedRoute` component should verify the claim on the token, not just a local state variable. When writing to `auditLogs`, never include plain-text PII in the `details` map.

## 5. QA & Runbook Considerations

- Runbook playbook: Firebase Auth outage — staff locked out. Fallback: emergency admin console access via Firebase console (document exact steps)
- Test MFA bypass attempts explicitly: direct URL navigation, token replay, role downgrade
- MFA enrolment must be verified for all staff accounts before M11 launch day (see launch checklist issue)

## Task Checklist

- [ ] Firebase Auth — email/password + Google SSO (~5 pts, P0, S4)
- [ ] Role system — admin, manager, inventory_staff, marketing_staff, customer (~5 pts, P0, S4)
- [ ] MFA enforcement — TOTP/SMS mandatory for all staff roles (~8 pts, P0, S4)
- [ ] Session management UI + suspicious login alerts (~5 pts, P1, S4)
- [ ] Audit log — write authentication events to Firestore (~3 pts, P0, S4)
