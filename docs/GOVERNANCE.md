---
title: Platform Governance & Documentation Standards
status: active
owner: platform-team
---

# 🏛️ Platform Governance

This document defines the engineering operating system for The Pawn Shop. It outlines the source-of-truth hierarchy, how documentation is maintained, and the rules of engagement for both human developers and AI coding assistants.

## 1. The Source of Truth Hierarchy
To prevent architectural drift and context fragmentation, this repository operates on a strict Docs-as-Code philosophy. The hierarchy of truth is as follows:

1. **Markdown Documentation (`/docs/`)**: The absolute, canonical source of truth for all product requirements, schemas, and architectural decisions.
2. **GitHub Issues**: The execution trackers. Issues must link to and execute what is defined in the Markdown docs.
3. **GitHub Projects**: The orchestration and status-tracking layer.
4. **Pull Requests**: The implementation of the documented requirements.

**Rule:** Code does not dictate the architecture; the documentation dictates the code. If the code and the documentation disagree, the code is considered a bug until an architectural change is formally approved.

## 2. Documentation Workflows

### Proposing a New Feature (Epics)
1. Do not start writing code.
2. Create a new Epic file in `/docs/product/epics/` using `00_EPIC_TEMPLATE.md`.
3. Define the Acceptance Criteria, the persona impact, and the schema changes.
4. Open a "Docs-First PR" to get the Epic approved.
5. Once merged, create a GitHub Issue linking to the Epic to begin implementation.

### Updating the Schema
1. The Firestore schema is governed by the files in `/docs/schema/`.
2. No developer or AI assistant may invent, add, or modify a Firestore collection or field without first updating the schema documentation.
3. Schema changes require mandatory review to ensure compliance with PIPEDA and age-gate data retention policies.

## 3. AI Coding Assistant Rules
AI tools (e.g., Copilot, Cursor, Windsurf) are deeply integrated into this workflow. To maintain safety and consistency, all AI sessions must follow these rules:

* **Mandatory Context:** Every new AI coding session MUST begin by loading `CONTEXT_DUMP.md` and `PERSONAS.md`.
* **Zero-Hallucination Schema:** AI assistants are strictly forbidden from guessing database fields. They must reference the documented schema.
* **ViewContext Enforcement:** AI assistants must not use inline JavaScript conditionals for theming. They must strictly adhere to the `.view-pawn`, `.view-cannabis`, and `.view-fireworks` CSS token overrides.
* **Documentation Updates:** When an AI assistant completes a feature, it must be prompted to review and update the corresponding Epic file to mark the implementation steps as complete.

## 4. Architectural Decision Records (ADRs)
Whenever a significant technical decision is made (e.g., choosing a new third-party integration, changing the state management pattern, or altering the routing strategy), it must be recorded in `/docs/adr/`. 

ADRs prevent the team from repeatedly debating the same decisions and provide critical historical context for AI tools.

## 5. Compliance & Security Governance
* **Age Gates & Privacy:** Any code modifying the `/cannabis` or `/fireworks` views must be cross-referenced with `COMPLIANCE.md`. 
* **PII Restrictions:** Personally Identifiable Information must never be logged in standard analytics or audit logs. All CRM and compliance logs must follow the retention schedules defined in the documentation.