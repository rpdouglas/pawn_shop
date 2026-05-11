# 🧠 Context Dump

This file serves as the mandatory starting point for all AI coding assistants and new developers to understand the project architecture and business context.

## Business Overview
The Pawn Shop is a multi-vertical application serving the Dapper-Debonair Akwesasne identity. It operates across three distinct business verticals (views):
1. **Pawn:** Standard pawn shop operations.
2. **Cannabis:** Cannabis retail (Requires strict compliance & age gating).
3. **Fireworks:** Fireworks retail (Requires compliance & age gating).

## Architectural Guidelines
* **Docs-as-Code:** The `/docs/` directory is the canonical source of truth.
* **Theming:** The application relies on strict CSS token overrides for theming across verticals (`.view-pawn`, `.view-cannabis`, `.view-fireworks`). Do not use inline JavaScript conditionals for styling.
* **Database:** Cloud Firestore. Schema must strictly adhere to `/docs/schema/firestore-schema.md`. No hallucinating fields.

## Core Technologies
*(Update as stack decisions are finalized via ADRs)*
* Frontend: React / Vite
* Backend/Database: Firebase (Firestore, Auth, Functions)
