---
adr_id: ADR-003
title: "Algolia over Firestore Full-Text Search"
date: 2026-05-15
status: Accepted
authors:
  - rpdouglas
epic: E13
---

# ADR-003: Algolia over Firestore Full-Text Search

**Date:** 2026-05-15
**Status:** Accepted
**Epic:** E13

## Context

The inventory search experience is central to the Dale persona (direct search) and the Sandra persona (discovery browsing). Firestore does not natively support full-text search, typo-tolerance, or faceted filtering. Options considered:

1. **Firestore prefix tokens** (`searchTokens` array) — already implemented in E04 as an interim solution for Sprints 1–11
2. **Algolia** — managed search-as-a-service with typo-tolerance, faceting, synonyms
3. **Typesense** (self-hosted) — open-source alternative to Algolia
4. **Elasticsearch** — requires self-managed infrastructure
5. **Firebase Data Connect full-text search** — not yet production-stable for this use case

## Decision

Adopt **Algolia** from Sprint 12 (E13). Firestore prefix tokens (`searchTokens`) remain as a fallback and are maintained in parallel.

The `items` collection is synced to an Algolia index via a Firestore `onWrite` Cloud Function. Per-view faceting is configured (pawn, cannabis, fireworks). The admin portal includes an Algolia index management UI.

**Acceptance criterion (M6 gate):** Search must return results in < 300ms.

## Rationale

- **Typo-tolerance:** Collectibles searches ("Lp vinyl recods", "rollex watch") are error-prone — Algolia's typo-tolerance is a first-class feature, not a workaround
- **Synonyms:** "console" → "gaming console", "rye" → "whisky" — Algolia synonyms are configured via the admin UI, not code
- **Faceted filtering:** Per-view faceting (pawn/cannabis/fireworks) and category filtering are built into Algolia's query model
- **< 300ms SLA:** Algolia's edge network delivers this reliably; Firestore full-text alternatives cannot match it
- **Managed service:** No infrastructure to maintain; indexing is handled by the sync function

Typesense was considered but rejected because self-hosting adds operational overhead inappropriate for a small team. Elasticsearch was rejected for the same reason. Firebase Data Connect was rejected as insufficiently mature for production search.

Firestore prefix tokens are retained as a fallback (if Algolia is unavailable) and are maintained with every item write — this is documented in E13's runbook.

## Consequences

**Easier:**
- Search UX quality: typo-tolerance and synonyms work out of the box
- Per-view filtering: Algolia facets map cleanly to `viewTag`
- Admin control: non-technical staff can manage synonyms and merchandising rules in Algolia dashboard

**Harder:**
- Two indexes to keep in sync: Firestore `items` and Algolia index — `onWrite` trigger must be reliable
- Algolia cost: usage-based pricing; monitor operation count as inventory grows
- Algolia API key management: Search-only key exposed to client; Admin key kept server-side only

**Migration:** Prefix token search (S1–S11) is replaced by Algolia in S12 for the primary search path. Prefix tokens remain for fallback.

**Cross-references:** E04 (searchTokens), E13 (merchandising engine), M6 (gate criterion).
