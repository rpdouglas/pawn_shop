---
adr_id: ADR-004
title: "Staff-Side AI Only — No Customer-Facing AI in v5.0"
date: 2026-05-15
status: Accepted
authors:
  - rpdouglas
epic: E18
---

# ADR-004: Staff-Side AI Only — No Customer-Facing AI in v5.0

**Date:** 2026-05-15
**Status:** Accepted
**Epic:** E18

## Context

AI-assisted features (description generation, pricing, tagging) are available in v5.0. The question is whether AI capabilities should be exposed to customers directly (e.g., a search chatbot, a "tell me about this item" Q&A, a deal-finding assistant) in addition to staff tools.

Options considered:
1. **Staff-only AI** — GPT-4o used for description generation, tagging, pricing suggestion. No customer-facing AI
2. **Customer chatbot** — LLM-powered Q&A on item detail pages or a site-wide search assistant
3. **AI-powered search** — semantic search replacing or augmenting Algolia

## Decision

Restrict AI (OpenAI GPT-4o) to **staff-facing operations only** in v5.0:
- `generateAIDescription` Cloud Function (E18)
- eBay title optimisation (E18)
- Auto-tagging suggestions (E18)
- Category recommendation (E18)
- Price suggestion from eBay sold comps (E18)

No customer-facing AI chatbot, semantic search assistant, or generative UI in this build.

## Rationale

- **Reliability:** Customer-facing AI introduces hallucination risk in a regulated context. A chatbot that confidently misstates cannabis regulations or pawn loan terms creates legal liability
- **Akwesasne context:** The brand's cultural identity requires careful, community-reviewed language. A generative chatbot cannot reliably maintain this standard
- **Compliance:** PIPEDA requires that automated decision-making affecting customers be disclosed and explainable. Staff-facing AI is an internal tool; customer-facing AI is a disclosure obligation
- **Scope:** v5.0 is already an ambitious build. Customer-facing AI is a v6.0 candidate after staff tools are validated and the business owner has experience with AI-assisted quality
- **Staff review gate:** All AI-generated content requires staff review before publish — this gate cannot exist for real-time customer interactions

Customer-facing AI chatbot was not rejected permanently — it is explicitly deferred to v6.0 after staff-side AI is validated.

## Consequences

**Easier:**
- Compliance: no customer-facing AI disclosure obligations in v5.0
- Quality control: staff review gate ensures AI output meets Marcus-grade standard before publication
- Risk: hallucination risk is contained to internal tooling

**Harder:**
- Competitive positioning: platforms with customer-facing AI may feel more interactive; accepted as a v5.0 tradeoff
- Staff workflow: AI assistance requires staff to be in the admin portal; cannot be triggered by customer actions

**Review trigger:** Revisit this decision after 6 months of production use of staff-side AI tools (target: v6.0 planning cycle).

**Cross-references:** E18 (AI assistant implementation), ADR-002 (three-view architecture — compliance context).
