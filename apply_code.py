import os

def scaffold_pm_architecture():
    """
    Creates the GitHub and Project Management scaffolding for The Pawn Shop.
    Generates complete files with initial boilerplate for immediate use.
    """
    
    directories = [
        ".github/ISSUE_TEMPLATE",
        ".github/workflows",
        "docs/project-management",
        "docs/reports/sprint-reviews",
        "docs/reports/retrospectives",
        "docs/reports/incident-postmortems",
        "docs/reports/release-notes",
        "docs/product/epics"
    ]

    files = {
        # ---------------------------------------------------------
        # .GITHUB CONFIGURATION
        # ---------------------------------------------------------
        ".github/CODEOWNERS": """* @rpdouglas
/docs/ @rpdouglas
/.github/workflows/ @rpdouglas
""",

        ".github/labels.yml": """- name: "view:pawn"
  color: "C8A14A"
  description: "Impacts the Pawn Shop view"
- name: "view:cannabis"
  color: "7B4FA0"
  description: "Impacts the Cannabis view"
- name: "view:fireworks"
  color: "C0392B"
  description: "Impacts the Fireworks view"
- name: "type:feature"
  color: "0E8A16"
- name: "type:bug"
  color: "D93F0B"
- name: "type:compliance"
  color: "FBCA04"
  description: "Age gates, PIPEDA, or Akwesasne jurisdiction"
- name: "priority:p0"
  color: "B60205"
  description: "Critical / Blocker"
- name: "priority:p1"
  color: "D4C5F9"
- name: "priority:p2"
  color: "FEF2C0"
""",

        ".github/PULL_REQUEST_TEMPLATE.md": """## 🎩 The Pawn Shop PR

**Epic / Issue Link:** #[Issue Number]

### Description
[Describe the changes implemented in this PR]

### View Context Impact
- [ ] `.view-pawn`
- [ ] `.view-cannabis`
- [ ] `.view-fireworks`

### QA Checklist
- [ ] Follows "Dapper. Debonair." design standards
- [ ] tested in mobile viewport (375px)
- [ ] Documentation / Schema updated in `/docs`
- [ ] Compliance reviewed (No PII leaks, Age gates intact)
""",

        ".github/ISSUE_TEMPLATE/feature.yml": """name: Feature Request
description: Propose a new feature for The Pawn Shop
title: "[FEATURE] "
labels: ["type:feature"]
body:
  - type: input
    id: epic
    attributes:
      label: Related Epic
      description: Which Epic does this belong to? (e.g., E06)
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: Description
      description: Clear outline of the feature.
    validations:
      required: true
  - type: dropdown
    id: views
    attributes:
      label: Affected Views
      multiple: true
      options:
        - Pawn
        - Cannabis
        - Fireworks
        - Admin/Staff
    validations:
      required: true
""",

        ".github/ISSUE_TEMPLATE/bug.yml": """name: Bug Report
description: Report a bug or issue in the platform
title: "[BUG] "
labels: ["type:bug"]
body:
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
    validations:
      required: true
""",

        ".github/workflows/ci.yml": """name: Continuous Integration
on:
  pull_request:
    branches: [ main, develop ]
jobs:
  build_and_test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
""",

        # ---------------------------------------------------------
        # UPDATED EPIC TEMPLATE WITH FRONTMATTER
        # ---------------------------------------------------------
        "docs/product/epics/00_EPIC_TEMPLATE.md": """---
epic_id: EXX
github_issue: 
status: planned
sprint: 
priority: P1
owner: platform-team
views:
  - pawn
  - cannabis
  - fireworks
schema_impact: false
compliance_review: required
ai_review: required
---

# 📁 Epic [ID]: [Name]

**Phase:** [1-5]

## 1. Executive Summary & Persona Focus
* **Primary Personas:** [Dale, Marie, Tanya, etc.]
* **Business Goal:** How does this advance the Dapper-Debonair Akwesasne identity?

## 2. Acceptance Criteria (Definition of Done)
* [ ] **Functional:** * [ ] **Cross-View Compliance:** (How does this look in Gold vs Purple vs Red?)
* [ ] **Accessibility/SEO:** * [ ] **Discretion:** (Does this respect privacy rules?)

## 3. Schema & Rules Impact
* **Firestore Collections:** * **Security Rules:** ## 4. AI Implementation Guidelines
* Provide specific instructions for the AI on how to build this component, citing `CONTEXT_DUMP.md`.

## 5. QA & Runbook Considerations
* What is the fallback if this system fails?
""",

        # ---------------------------------------------------------
        # PROJECT MANAGEMENT DOCS
        # ---------------------------------------------------------
        "docs/project-management/GITHUB_PROJECTS_STRUCTURE.md": """# 📊 GitHub Projects Structure

The GitHub Project board is the execution orchestration layer. It does not replace Markdown documentation.

## Custom Fields
* **Status:** Todo, In Progress, In Review, Done
* **Epic:** Text mapping to Epic ID (e.g., E06)
* **Priority:** P0 (Blocker), P1 (High), P2 (Standard)
* **View Context:** Multi-select (Pawn, Cannabis, Fireworks)
* **Sprint:** Iteration field
* **Compliance Impact:** Yes/No
* **Schema Impact:** Yes/No

All issues should link directly to their canonical Markdown Epic in `/docs/product/epics/`.
""",

        "docs/project-management/ISSUE_WORKFLOWS.md": """# 🔄 Issue & PR Workflows

## The Golden Path
1. **Idea:** Discussed in GitHub Discussions.
2. **Design:** Documented in `/docs/product/epics/` via PR.
3. **Execution:** GitHub Issue created, linked to Epic, added to Sprint.
4. **Development:** PR opened against Issue.
5. **Review:** PR merges, Issue closes automatically (`Closes #123`).
6. **Release:** Added to `/docs/reports/release-notes/`.
""",
        
        "docs/project-management/SPRINT_PROCESS.md": """# 🏃 Sprint Process
Sprints are 2-week iterations.

## Planning
* Review `/docs/ACTIVE_SPRINT.md`.
* Ensure all GitHub Issues have an Epic ID and Size estimation.
* Update GitHub Project Iteration field.

## Review
* Output logged to `/docs/reports/sprint-reviews/`.
* Retrospective logged to `/docs/reports/retrospectives/`.
"""
    }

    print("🚀 Initializing GitHub & PM Architecture for The Pawn Shop...")

    # Create directories
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"📁 Created directory: {directory}")

    # Create files
    for filepath, content in files.items():
        # Ensure the parent directory exists before writing the file
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"📄 Created file: {filepath}")

    print("\n✅ Successfully scaffolded GitHub workflows, issue templates, PM docs, and updated the Epic frontmatter!")

if __name__ == "__main__":
    scaffold_pm_architecture()