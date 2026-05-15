# Firestore Schema — v3

**CRITICAL RULE:** No developer or AI assistant may add, rename, or remove a Firestore collection or field without first updating this document. Schema changes require the `area:schema` label on the associated issue and a corresponding PR checkbox confirming this doc was updated.

**Schema Guard:** `schema-guard.yml` CI workflow validates that all `.collection()` and `.doc()` references in `src/` and `functions/src/` are documented here. PRs that introduce undocumented fields will fail CI.

---

## Collections

### `users/{uid}`

Staff and customer identity. Document ID = Firebase Auth UID.

| Field | Type | Notes |
|---|---|---|
| `uid` | String | Firebase Auth UID (document ID) |
| `email` | String | No plain-text PII in other collections — reference uid only |
| `role` | String | `customer` \| `admin` \| `manager` \| `inventory_staff` \| `marketing_staff` |
| `createdAt` | Timestamp | |
| `mfaEnrolled` | Boolean | True once TOTP or SMS second factor is active |
| `lastLoginAt` | Timestamp | |
| `lastLoginIp` | String | Used for suspicious login detection |
| `lastLoginDevice` | String | UA string, hashed |

**Security rules:** Owner-only read on own document. Admin-only write for role field.

---

### `items/{id}`

Inventory — the core collection. Replaces the former `products` collection (renamed in v3).

| Field | Type | Notes |
|---|---|---|
| `id` | String | Document ID (auto-generated) |
| `title` | String | Display title |
| `description` | String | Human-written or AI-generated (staff review required before publish) |
| `aiDescription` | String | Raw GPT-4o output — not shown to customers until `description` is set from it |
| `aiPriceSuggestion` | Map | `{ low: Number, high: Number, source: "ebay-comps" }` — guidance only |
| `price` | Number | Listed price in CAD |
| `status` | String | `active` \| `reserved` \| `pending_pickup` \| `sold` \| `draft` |
| `viewTag` | String | Primary view: `pawn` \| `cannabis` \| `fireworks` |
| `viewTags` | Array\<String\> | All applicable views (item may appear in multiple) |
| `category` | String | Staff-assigned category |
| `merchandisingTags` | Array\<String\> | e.g. `["staff-pick", "rare-find", "just-arrived", "limited-edition"]` |
| `locationId` | String | Physical location reference |
| `isSeasonalItem` | Boolean | Used by campaign scheduler (E14) |
| `bundleIds` | Array\<String\> | IDs of items in the same bundle (Fireworks view) |
| `serialNumber` | String | Captured on intake; run through blacklist check |
| `serialBlacklistFlag` | Boolean | True if serial matched stolen goods list |
| `searchTokens` | Array\<String\> | Prefix tokens for Firestore prefix search (pre-Algolia) |
| `imageUrls` | Array\<String\> | Firebase Storage URLs (WebP/AVIF served via CDN) |
| `videoUrl` | String | Vertical video URL for Cannabis/Fireworks item detail (E13) |
| `provenanceNotes` | String | Cultural/collecting significance — Marcus persona (v5.0+) |
| `holdExpiresAt` | Timestamp | Populated when status = `reserved`; Cloud Function resets after expiry |
| `ebayListingId` | String | Set after eBay cross-post (E6) |
| `ebayStatus` | String | `active` \| `sold` \| `ended` — synced every 4h |
| `trendingScore` | Number | Calculated by `calculateTrendingScore` Cloud Function (E13) |
| `viewCount` | Number | Incremented on item detail page view |
| `createdAt` | Timestamp | |
| `updatedAt` | Timestamp | |
| `publishedAt` | Timestamp | When status changed from `draft` to `active` |
| `createdBy` | String | Staff UID |

**Security rules:** Public read when `status == "active"` only. Staff write. `serialBlacklistFlag` admin-only write.

---

### `pawnRequests/{id}`

Customer pawn submissions from the multi-step pawn form (E7).

| Field | Type | Notes |
|---|---|---|
| `id` | String | Document ID |
| `itemDescription` | String | Customer's description of item to pawn |
| `condition` | String | `excellent` \| `good` \| `fair` \| `poor` |
| `serialNumber` | String | Captured; triggers blacklist check on create |
| `serialBlacklistFlag` | Boolean | Set by Cloud Function on create |
| `contactMethod` | String | `email` \| `phone` \| `anonymous` |
| `contactValue` | String | Email or phone — omit if anonymous; store encrypted |
| `status` | String | `received` \| `quoted` \| `accepted` \| `completed` \| `rejected` |
| `policeHold` | Boolean | If true, blocks auto-purge by `purgeExpiredData` (E11) |
| `staffNotes` | String | Internal only — not shown to customer |
| `quotedPrice` | Number | Staff-set quote value |
| `submittedAt` | Timestamp | |
| `updatedAt` | Timestamp | |
| `staffRespondedAt` | Timestamp | Used by 48h autoFollowUp trigger (E15) |
| `customerRepliedAt` | Timestamp | Used by 72h follow-up trigger (E15) |
| `submittedBy` | String | UID if logged in; null if anonymous |
| `viewTag` | String | Which view the form was submitted from |

**Security rules:** Create-only for customers. Owner-read only (if logged in). Staff full read/write. Admin-only `policeHold` write.
**Retention:** Auto-purged after 90 days by `purgeExpiredData` unless `policeHold == true` (E11).

---

### `consentLogs/{id}`

Age-gate consent records. Write-once, never deleted (compliance requirement).

| Field | Type | Notes |
|---|---|---|
| `id` | String | Document ID (auto-generated) |
| `viewTag` | String | `cannabis` \| `fireworks` |
| `ipAddress` | String | Hashed — not stored in plain text |
| `timestamp` | Timestamp | |
| `policyVersion` | String | Version of the age-gate policy confirmed |
| `userAgent` | String | |
| `uid` | String | Firebase Auth UID if logged in; null for anonymous |

**Security rules:** Create-only (no read, no update, no delete) for all clients. Admin-only read. Marie's compliance dashboard reads via Cloud Function only.

---

### `auditLogs/{id}`

Authentication and admin action audit trail. Replaces former `audit_logs` collection (renamed in v3 for camelCase consistency).

| Field | Type | Notes |
|---|---|---|
| `id` | String | Document ID |
| `action` | String | `login` \| `logout` \| `role_change` \| `mfa_enrolled` \| `suspicious_login` \| `item_created` \| `item_status_changed` \| `pawn_status_changed` \| `hold_placed` \| `hold_expired` |
| `performedBy` | String | Staff UID |
| `targetUid` | String | Affected user UID (if action targets another user) |
| `targetDocId` | String | Affected document ID (if action targets an item/request) |
| `timestamp` | Timestamp | |
| `details` | Map | Action specifics. **No PII unless encrypted.** |
| `ipAddress` | String | Hashed |

**Security rules:** Create-only for Cloud Functions and Admin SDK. Admin-only read. Non-admin roles cannot delete.

---

### `customers/{uid}`

CRM profiles. Document ID = Firebase Auth UID. Written by Cloud Functions; read by manager role (E15).

| Field | Type | Notes |
|---|---|---|
| `uid` | String | Firebase Auth UID (document ID) |
| `firstSeenAt` | Timestamp | |
| `lastSeenAt` | Timestamp | |
| `viewPreference` | String | Most-visited view |
| `categoryPreference` | Array\<String\> | Top categories by interaction count |
| `purchaseHistory` | Array\<Map\> | `[{ itemId, price, viewTag, date }]` |
| `inquiryHistory` | Array\<Map\> | `[{ pawnRequestId, date, status }]` |
| `lifetimeValue` | Number | Sum of purchase prices |
| `engagementScore` | Number | Composite score; cross-view bonus +15 (E15) |
| `crossViewBrowsing` | Boolean | True when session spans 2+ view namespaces |
| `vipFlag` | Boolean | Set by staff or triggered by engagement thresholds |
| `resellerTier` | String | `none` \| `bronze` \| `silver` \| `gold` |
| `savedSearchIds` | Array\<String\> | References to `savedSearches` docs |
| `newsletterSubscribed` | Boolean | CASL double opt-in status |
| `newsletterViewTag` | String | Which view newsletter they subscribed from |

**Security rules:** Cloud Function write only. Manager-role read. Customer cannot read own CRM document (internal use only).

---

### `savedSearches/{id}`

Saved search subscriptions for alert notifications (E12).

| Field | Type | Notes |
|---|---|---|
| `id` | String | Document ID |
| `uid` | String | Owner UID |
| `query` | String | Search query string |
| `viewTag` | String | Which view to search |
| `category` | String | Optional category filter |
| `alertMethod` | String | `sms` \| `email` \| `both` |
| `active` | Boolean | |
| `createdAt` | Timestamp | |
| `lastTriggeredAt` | Timestamp | Updated when a matching item is listed |

**Security rules:** Owner-only read/write. Cloud Function triggers notifications on new item match.

---

### `articles/{id}`

Editorial CMS content (E19).

| Field | Type | Notes |
|---|---|---|
| `id` | String | Document ID |
| `title` | String | |
| `slug` | String | URL slug (e.g., `finds-of-the-week-launch`) |
| `body` | String | Markdown body |
| `viewTag` | String | Primary view this article belongs to |
| `seoMeta` | Map | `{ title, description, ogImage }` |
| `publishedAt` | Timestamp | Null if draft |
| `status` | String | `draft` \| `published` |
| `authorUid` | String | Staff UID |
| `series` | String | Optional series name (e.g., `warriors-of-akwesasne`) |

**Security rules:** Public read when `status == "published"`. Admin/marketing_staff write.

---

### `config/featureFlags` (Single Document)

Feature flag key-value store. Read on app init via `useFeatureFlag(key)` hook (E10).

| Field | Type | Notes |
|---|---|---|
| `[flagKey]` | Boolean | e.g., `crmDashboard: false`, `aiDescriptions: true` |

**Security rules:** Public read. Admin-only write.

---

### `config/campaigns` (Single Document)

Campaign scheduler config. Read by homepage to determine active campaign (E14).

| Field | Type | Notes |
|---|---|---|
| `active` | Boolean | Master switch |
| `campaignId` | String | References a campaign template key |
| `viewTag` | String | Which view this campaign activates on |
| `heroOverride` | Map | `{ headline, subhead, imageUrl, ctaLabel, ctaUrl }` |
| `countdownTarget` | Timestamp | For countdown timer hero (Fireworks view) |
| `categoryBoost` | Array\<String\> | Categories floated to top of shop page |
| `activatedAt` | Timestamp | |
| `activatedBy` | String | Staff UID |

**Security rules:** Public read. Admin/marketing_staff write. Must take effect within 60 seconds of write.

---

## Deprecated Collections

| Collection | Replaced By | Migration Note |
|---|---|---|
| `products` | `items` | Renamed in v3 — migrate existing documents |
| `audit_logs` | `auditLogs` | Renamed in v3 for camelCase consistency |

---

## Change Log

| Version | Date | Change |
|---|---|---|
| v1 | 2026-05 | Initial: users, products, audit_logs |
| v2 | — | (never formally documented) |
| v3 | 2026-05 | Full schema: items, pawnRequests, consentLogs, auditLogs, customers, savedSearches, articles, config docs; deprecated products + audit_logs |
