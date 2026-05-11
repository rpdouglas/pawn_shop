# 🛡️ Compliance & Security Governance

This document outlines the strict regulatory and compliance requirements that govern The Pawn Shop platform, particularly concerning the regulated verticals.

## 1. Age-Gating Requirements
* **Cannabis View (`.view-cannabis`):** Must strictly enforce a 19+ (or legally mandated age) age gate before rendering *any* product data or promotional material.
* **Fireworks View (`.view-fireworks`):** Must strictly enforce an 18+ (or legally mandated age) age gate.
* **Implementation:** Age gates must be validated at the route level. AI assistants must never bypass these checks during feature development.

## 2. Data Privacy & PIPEDA
* **Personally Identifiable Information (PII):** Customer PII (e.g., IDs collected for age verification) must be handled with extreme care.
* **Retention:** PII must not be retained longer than legally required. Follow the documented data retention schedules (TBD in Schema docs).
* **Logging:** Never log PII, raw IDs, or sensitive customer transaction details in standard analytics, error tracking (e.g., Crashlytics), or console logs.

## 3. Audit Trails
* All actions taken by staff (e.g., overriding a price, approving an age gate manually) must be logged in the `audit_logs` Firestore collection with an immutable timestamp and the staff member's authenticated UID.
