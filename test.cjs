const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  LevelFormat,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  PageNumber,
  PageBreak,
  TableOfContents,
  StyleLevel,
} = require("docx");
const fs = require("fs");

// ─── COLOUR PALETTE ───────────────────────────────────────────────────────────
const GOLD = "C8A14A";
const DARK = "1A1814";
const TABLE_HDR = "2C2416";
const PAWN_GREEN = "1D4E35";
const CANNABIS_PU = "3D1F5C";
const FIRE_RED = "7A1515";
const STRIPE_EVEN = "FFFFFF";
const STRIPE_ODD = "FAF7F2";
const CALLOUT_BG = "F7F3EC";
const WARN_BG = "FFF8E7";
const SUCCESS_BG = "F0FAF4";

// ─── BORDERS ─────────────────────────────────────────────────────────────────
const bGold = { style: BorderStyle.SINGLE, size: 2, color: GOLD };
const bLight = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const bNone = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allGold = { top: bGold, bottom: bGold, left: bGold, right: bGold };
const allLight = { top: bLight, bottom: bLight, left: bLight, right: bLight };
const allNone = { top: bNone, bottom: bNone, left: bNone, right: bNone };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const sp = (before = 80, after = 80) => ({ before, after });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: sp(480, 160),
    children: [
      new TextRun({ text, bold: true, size: 36, font: "Arial", color: DARK }),
    ],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: sp(320, 120),
    children: [
      new TextRun({ text, bold: true, size: 28, font: "Arial", color: DARK }),
    ],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: sp(240, 100),
    children: [
      new TextRun({ text, bold: true, size: 24, font: "Arial", color: DARK }),
    ],
  });
}
function h4(text, color = DARK) {
  return new Paragraph({
    spacing: sp(180, 80),
    children: [
      new TextRun({ text, bold: true, size: 22, font: "Arial", color }),
    ],
  });
}
function para(text, opts = {}) {
  return new Paragraph({
    spacing: sp(opts.before || 80, opts.after || 80),
    children: [
      new TextRun({
        text,
        size: opts.size || 22,
        font: "Arial",
        color: opts.color || DARK,
        bold: opts.bold || false,
        italics: opts.italic || false,
      }),
    ],
  });
}
function bullet(text, level = 0, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: sp(40, 40),
    children: [
      new TextRun({ text, size: 20, font: "Arial", color: DARK, bold }),
    ],
  });
}
function num(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: sp(40, 40),
    children: [new TextRun({ text, size: 20, font: "Arial", color: DARK })],
  });
}
function spacer(before = 80) {
  return new Paragraph({
    spacing: { before, after: 0 },
    children: [new TextRun("")],
  });
}
function divider() {
  return new Paragraph({
    spacing: sp(200, 200),
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
    children: [new TextRun("")],
  });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}
function callout(text, bg = CALLOUT_BG, color = DARK) {
  return new Paragraph({
    spacing: sp(120, 120),
    shading: { fill: bg, type: ShadingType.CLEAR },
    children: [
      new TextRun({
        text: `  ${text}  `,
        size: 20,
        font: "Arial",
        color,
        italics: true,
      }),
    ],
  });
}
function viewBanner(icon, label, route, bg) {
  return [
    new Paragraph({
      spacing: sp(280, 0),
      shading: { fill: bg, type: ShadingType.CLEAR },
      children: [
        new TextRun({
          text: `  ${icon}  ${label}`,
          bold: true,
          size: 32,
          font: "Arial",
          color: "FFFFFF",
        }),
      ],
    }),
    new Paragraph({
      spacing: sp(0, 160),
      shading: { fill: bg, type: ShadingType.CLEAR },
      children: [
        new TextRun({
          text: `  ${route}`,
          size: 19,
          font: "Arial",
          color: "FFFFFF",
          italics: true,
        }),
      ],
    }),
  ];
}

// ─── TABLE BUILDER ────────────────────────────────────────────────────────────
function tbl(headers, rows, colWidths, hdrBg = TABLE_HDR) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (h, i) =>
            new TableCell({
              borders: allGold,
              width: { size: colWidths[i], type: WidthType.DXA },
              shading: { fill: hdrBg, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: h,
                      bold: true,
                      size: 19,
                      font: "Arial",
                      color: "F5EDD6",
                    }),
                  ],
                }),
              ],
            }),
        ),
      }),
      ...rows.map(
        (row, ri) =>
          new TableRow({
            children: row.map(
              (cell, i) =>
                new TableCell({
                  borders: allLight,
                  width: { size: colWidths[i], type: WidthType.DXA },
                  shading: {
                    fill: ri % 2 === 0 ? STRIPE_EVEN : STRIPE_ODD,
                    type: ShadingType.CLEAR,
                  },
                  margins: { top: 60, bottom: 60, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: String(cell),
                          size: 18,
                          font: "Arial",
                          color: DARK,
                        }),
                      ],
                    }),
                  ],
                }),
            ),
          }),
      ),
    ],
  });
}

// ─── DOCUMENT ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 260 } } },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "◦",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 900, hanging: 260 } } },
          },
        ],
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 260 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: DARK } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: DARK },
        paragraph: {
          spacing: { before: 480, after: 160 },
          outlineLevel: 0,
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 3, color: GOLD },
          },
        },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              spacing: sp(0, 80),
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD },
              },
              children: [
                new TextRun({
                  text: "IslandGold Pawn & Trade  —  Website Build Project Plan v4.0",
                  bold: true,
                  size: 18,
                  font: "Arial",
                  color: DARK,
                }),
                new TextRun({
                  text: "      CONFIDENTIAL  ·  INTERNAL USE ONLY",
                  size: 18,
                  font: "Arial",
                  color: "888888",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: {
                top: { style: BorderStyle.SINGLE, size: 4, color: GOLD },
              },
              spacing: sp(80, 0),
              children: [
                new TextRun({
                  text: "◆ IslandGold Pawn & Trade, Cornwall Island, Akwesasne  ◆      Page ",
                  size: 18,
                  font: "Arial",
                  color: "888888",
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  font: "Arial",
                  color: "888888",
                }),
                new TextRun({
                  text: " of ",
                  size: 18,
                  font: "Arial",
                  color: "888888",
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 18,
                  font: "Arial",
                  color: "888888",
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ══════════════════════════════════════════════════════════════════════════════
        // COVER PAGE
        // ══════════════════════════════════════════════════════════════════════════════
        new Paragraph({
          spacing: sp(600, 60),
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "◆  ISLANDGOLD PAWN & TRADE  ◆",
              bold: true,
              size: 28,
              font: "Arial",
              color: GOLD,
            }),
          ],
        }),
        new Paragraph({
          spacing: sp(0, 60),
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Website Build — Full Project Plan",
              bold: true,
              size: 48,
              font: "Arial",
              color: DARK,
            }),
          ],
        }),
        new Paragraph({
          spacing: sp(0, 60),
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Version 4.0  —  Enterprise Implementation Specification",
              size: 22,
              font: "Arial",
              color: "555555",
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          spacing: sp(0, 40),
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Pawn Shop  ·  Cannabis Lifestyle  ·  Fireworks & Seasonal",
              bold: true,
              size: 24,
              font: "Arial",
              color: GOLD,
            }),
          ],
        }),
        new Paragraph({
          spacing: sp(80, 80),
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Vite · React · Tailwind v4 · Firebase · GitHub Actions · Algolia · OpenAI",
              size: 18,
              font: "Arial",
              color: "888888",
            }),
          ],
        }),
        spacer(40),
        tbl(
          ["Attribute", "Detail"],
          [
            ["Project Name", "IslandGold Pawn & Trade — Website Build v4.0"],
            [
              "Prepared For",
              "IslandGold Pawn & Trade, Cornwall Island, Akwesasne",
            ],
            ["Document Owner", "Lead Developer / Project Lead"],
            ["Version", "4.0"],
            ["Status", "APPROVED FOR BUILD"],
            ["Date", "2025"],
            ["Confidentiality", "CONFIDENTIAL — Internal Use Only"],
            ["Duration", "38 weeks (19 × 2-week sprints, Phases 1–5)"],
            ["Total Epics", "19 (E1–E19)"],
            ["Story Points", "~720 total"],
            [
              "Three Views",
              "Pawn Shop  ·  Cannabis Lifestyle  ·  Fireworks & Seasonal",
            ],
            [
              "Stack",
              "React 18 + Vite 5 · TypeScript · Tailwind v4 · Firebase · Algolia · OpenAI",
            ],
          ],
          [2800, 6560],
        ),
        spacer(400),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // DOCUMENT CONTROL
        // ══════════════════════════════════════════════════════════════════════════════
        h1("Document Control"),
        h2("Version History"),
        tbl(
          ["Version", "Date", "Author", "Summary of Changes"],
          [
            [
              "1.0",
              "2025 Q1",
              "Lead Developer",
              "Initial build plan — 12 epics, 30-week timeline, single storefront",
            ],
            [
              "2.1",
              "2025 Q2",
              "Lead Developer",
              "Gap analysis integration — E10–E12 added, compliance hardening, operations depth",
            ],
            [
              "3.0",
              "2025 Q2",
              "Lead Developer",
              "Three-view architecture — E13–E19 added, lifestyle commerce positioning, Algolia moved earlier",
            ],
            [
              "4.0",
              "2025 Q3",
              "Lead Developer",
              "Enterprise specification — Document Control, QA strategy, acceptance criteria, runbook detail, KPI definitions, glossary, release management",
            ],
          ],
          [800, 1200, 1800, 5560],
        ),
        spacer(120),
        h2("Change Log — v4.0 Additions"),
        tbl(
          ["Section Added", "Rationale"],
          [
            [
              "Document Control (this section)",
              "Formal governance for a multi-version, multi-stakeholder specification",
            ],
            [
              "Out-of-Scope Boundaries (Section 1)",
              "Prevents scope creep assumptions; critical as plan grows to 19 epics",
            ],
            [
              "Success Metrics & KPI Definitions (Section 1)",
              "Removes ambiguity from analytics requirements; makes launch criteria measurable",
            ],
            [
              "QA & Testing Strategy (Section 10)",
              "Unified testing approach across unit, integration, E2E, accessibility, UAT",
            ],
            [
              "Acceptance Criteria per Epic (Section 4)",
              "Definition of done for the 12 highest-complexity epics",
            ],
            [
              "Release Management & Rollback (Section 11)",
              "Deployment governance, hotfix procedure, production freeze rules, launch-day checklist",
            ],
            [
              "Operational Runbook Detail (Section 8)",
              "Specific playbooks for 9 incident scenarios",
            ],
            [
              "CRM Customer Journey Examples (Section 6)",
              "Makes E15 actionable with three concrete persona journeys",
            ],
            [
              "Performance, Accessibility & SEO Targets (Section 10)",
              "Explicit measurable targets for all three quality dimensions",
            ],
            [
              "Environment Variable Reference (Appendix B)",
              "Single source of truth for all secrets, keys, and config values",
            ],
            [
              "Glossary (Appendix D)",
              "Improves owner and contractor readability",
            ],
            [
              "Architecture Diagram References (Section 3)",
              "Flags required visual diagrams as external design deliverables",
            ],
          ],
          [3200, 6160],
        ),
        spacer(120),
        h2("Approval Sign-Off"),
        tbl(
          ["Role", "Name", "Signature", "Date"],
          [
            ["Project Owner / Business Lead", "", "", ""],
            ["Lead Developer", "", "", ""],
            ["Legal Reviewer", "", "", ""],
            ["Design Lead", "", "", ""],
          ],
          [2400, 2400, 2400, 2160],
        ),
        spacer(120),
        h2("Distribution List"),
        tbl(
          ["Recipient", "Role", "Access Level"],
          [
            ["Lead Developer", "Primary implementer", "Full document"],
            ["Business Owner", "Executive sponsor", "Full document"],
            ["Designer", "Design system, UX, photography", "Sections 1, 4, 5"],
            [
              "Legal Reviewer",
              "Compliance, Indigenous jurisdiction",
              "Sections 1, 7, 8",
            ],
            [
              "Future Contractors",
              "Sprint delivery contributors",
              "Sections 3–11, Appendices",
            ],
          ],
          [2400, 3600, 3360],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // TABLE OF CONTENTS
        // ══════════════════════════════════════════════════════════════════════════════
        h1("Table of Contents"),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-3",
          stylesWithLevels: [
            new StyleLevel("Heading1", 1),
            new StyleLevel("Heading2", 2),
            new StyleLevel("Heading3", 3),
          ],
        }),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 1 — EXECUTIVE OVERVIEW
        // ══════════════════════════════════════════════════════════════════════════════
        h1("1. Executive Overview"),

        h2("1.1 Executive Summary"),
        para(
          "IslandGold Pawn & Trade v4.0 is a multi-vertical lifestyle commerce platform serving Cornwall Island, Akwesasne, and the surrounding region. This document is the single source of truth for the complete build: technology architecture, 19 epics, 19 sprints across 5 phases, 11 milestones, QA strategy, release management, and operational governance.",
        ),
        para(
          "The platform introduces three distinct public-facing views — Pawn Shop, Cannabis Lifestyle, and Fireworks & Seasonal — each with its own visual identity, UX logic, compliance requirements, and merchandising strategy, while sharing a unified Firebase backend, inventory system, and admin portal. The result is not a pawn shop website but a discovery-driven lifestyle commerce brand rooted in Akwesasne identity.",
        ),
        spacer(80),

        h2("1.2 Strategic Vision"),
        para(
          "Position IslandGold not as a pawn shop but as a local lifestyle commerce brand — a destination for treasure hunters, collectors, wellness seekers, and seasonal celebrators. Each view serves a distinct customer intent while the unified platform creates operational efficiency that no competitor in the region can match.",
        ),
        spacer(80),

        h2("1.3 Business Goals"),
        bullet("Launch a production-grade commerce platform within 38 weeks"),
        bullet(
          "Enable cross-platform inventory listing (eBay, Kijiji, Facebook) from a single admin interface",
        ),
        bullet(
          "Reduce operational friction for pawn intake, holds, and customer communication",
        ),
        bullet(
          "Establish the Cannabis and Fireworks verticals as lifestyle brands with distinct visual identities",
        ),
        bullet(
          "Build a CRM foundation for long-term customer retention and repeat business",
        ),
        bullet(
          "Create an SEO and editorial content footprint that drives organic discovery across all three verticals",
        ),
        spacer(80),

        h2("1.4 Success Metrics"),
        para(
          "The following KPIs define launch success and are tracked in the per-view GA4 dashboard and admin analytics:",
        ),
        tbl(
          ["KPI", "Target", "Measured By", "Timeframe"],
          [
            [
              "Lighthouse Performance Score (all 3 views)",
              "≥ 90",
              "Lighthouse CI in GitHub Actions",
              "Pre-launch gate",
            ],
            [
              "Lighthouse Accessibility Score",
              "≥ 90",
              "Lighthouse CI + axe-core",
              "Pre-launch gate",
            ],
            [
              "Lighthouse SEO Score",
              "≥ 95",
              "Lighthouse CI",
              "Pre-launch gate",
            ],
            [
              "Homepage LCP (Largest Contentful Paint)",
              "< 2.5s",
              "Core Web Vitals / GA4",
              "Pre-launch gate",
            ],
            [
              "API / Cloud Function response time",
              "< 500ms p95",
              "Firebase Performance Monitoring",
              "30 days post-launch",
            ],
            [
              "Admin dashboard load time",
              "< 2s",
              "Sentry / Firebase Performance",
              "30 days post-launch",
            ],
            [
              "Pawn form completion rate",
              "> 60%",
              "GA4 funnel",
              "90 days post-launch",
            ],
            [
              "eBay listing push success rate",
              "> 95%",
              "Admin analytics dashboard",
              "90 days post-launch",
            ],
            [
              "Average inquiry response time",
              "< 24 hours",
              "CRM dashboard (E15)",
              "90 days post-launch",
            ],
            [
              "Newsletter opt-in rate (per view)",
              "> 5% of visitors",
              "Mailchimp / GA4",
              "90 days post-launch",
            ],
            [
              "Inventory turnover rate (pawn items)",
              "Baseline established in 30 days",
              "Admin analytics (E10)",
              "30 days post-launch",
            ],
            [
              "Repeat customer rate",
              "Baseline established in 90 days",
              "CRM engagement score (E15)",
              "90 days post-launch",
            ],
          ],
          [2600, 1600, 2200, 2960],
        ),
        spacer(80),

        h2("1.5 Scope Summary"),
        para(
          "38 weeks. 19 epics. 5 phases. Three public-facing views sharing one backend. Full sprint plan, QA strategy, compliance hardening, AI-assisted operations, and editorial content system.",
        ),
        spacer(80),

        h2("1.6 Out of Scope — v4.0 Launch"),
        callout(
          "The following are explicitly NOT included in the 38-week build. They are documented in Section 14 (Post-Launch Backlog).",
          WARN_BG,
        ),
        spacer(60),
        bullet("Native iOS or Android mobile app"),
        bullet(
          "Full shopping cart and online payment checkout (Stripe integration)",
        ),
        bullet("Real-time auction / bidding system"),
        bullet("Marketplace fulfillment or logistics management"),
        bullet("Multi-tenant architecture (more than one store instance)"),
        bullet("Warehouse management system"),
        bullet("ERP or accounting system integration"),
        bullet(
          "AI customer-facing chatbot (AI is staff-side only in this build)",
        ),
        bullet("Mohawk / French language localization (post-launch Phase 8)"),
        bullet("Loyalty points / gamification system (post-launch Phase 10)"),
        bullet(
          "Cannabis age-verified online checkout (pending legal consultation outcome)",
        ),
        bullet(
          "Third-party marketplace expansion beyond eBay, Kijiji, and Facebook",
        ),
        spacer(80),

        h2("1.7 Key Differentiators"),
        bullet(
          "Three distinct lifestyle views on a single codebase — no competitor in the region operates this way",
          0,
          true,
        ),
        bullet(
          "Operational intelligence layer (audit logs, hold system, pawn conversion funnel) built in from day one",
        ),
        bullet(
          "AI-assisted listing descriptions, pricing, and auto-tagging from Sprint 17",
        ),
        bullet(
          "Indigenous commerce compliance — explicit legal consultation milestone for Akwesasne jurisdiction",
        ),
        bullet(
          "Full CRM with automated follow-up journeys — rare at SMB scale",
        ),
        spacer(80),

        h2("1.8 High-Level Timeline"),
        tbl(
          ["Phase", "Sprints", "Weeks", "Goal"],
          [
            [
              "Phase 1 — Foundation",
              "S1–S3",
              "W1–6",
              "Repo, pipelines, three-view design system, runbook",
            ],
            [
              "Phase 2 — Core Product",
              "S4–S8",
              "W7–16",
              "Auth + MFA, inventory, all three view storefronts live on dev",
            ],
            [
              "Phase 3 — Listing, Operations & Discovery",
              "S9–S13",
              "W17–26",
              "eBay, pawn system, merchandising engine, Algolia, attribution",
            ],
            [
              "Phase 4 — Compliance, Community & Conversion",
              "S14–S16",
              "W27–32",
              "Conversion optimization, seasonal engine, compliance hardened",
            ],
            [
              "Phase 5 — AI, CRM & Launch",
              "S17–S19",
              "W33–38",
              "AI assistant, CRM, editorial CMS, retention, production launch",
            ],
          ],
          [2000, 1000, 1000, 5360],
        ),
        spacer(80),

        h2("1.9 Budget & Resource Assumptions"),
        bullet(
          "1 full-stack developer (primary): all epics, all sprints, 28–32 points per sprint",
        ),
        bullet(
          "1 designer (part-time, Sprints 2–3): design system, photography brief, motion spec, per-view UX",
        ),
        bullet(
          "Legal counsel (milestone review): indigenous jurisdiction consultation, compliance review — external engagement, 1–2 days",
        ),
        bullet(
          "Firebase Blaze plan: required for Cloud Functions and external API calls — budget alerts at $25 / $100 / $500",
        ),
        bullet(
          "Third-party services: Algolia (free tier to 10k records), OpenAI API (~$20–50/month at launch volume), Twilio (pay-as-you-go SMS), SendGrid (free tier for transactional), Sentry (free tier)",
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 2 — TECHNOLOGY ARCHITECTURE
        // ══════════════════════════════════════════════════════════════════════════════
        h1("2. Technology Architecture"),

        h2("2.1 Full Stack Decisions"),
        tbl(
          ["Layer", "Technology", "Purpose", "Rationale"],
          [
            [
              "Frontend",
              "React 18 + Vite 5",
              "Component UI, fast HMR, SPA builds",
              "SSR not needed; Firebase Hosting serves SPA with rewrites",
            ],
            [
              "Language",
              "TypeScript 5",
              "Type safety across Firestore models and view configs",
              "Catches data-shape mismatches at compile time",
            ],
            [
              "Styling",
              "Tailwind v4",
              "CSS-first @theme with per-view token overrides",
              "CSS variables allow view theming without JS conditionals",
            ],
            [
              "View Router",
              "React Router v6 + ViewContext",
              "/pawn /cannabis /fireworks route namespaces",
              "ViewContext injects CSS class on root, enabling theme switching",
            ],
            [
              "State",
              "Zustand",
              "Global UI state, active view, cart, modals",
              "Redux overkill; React Context for auth only",
            ],
            [
              "Data Fetching",
              "TanStack Query v5",
              "Per-view Firestore queries, smart caching",
              "Prevents redundant Firestore reads on free tier",
            ],
            [
              "Forms",
              "React Hook Form + Zod",
              "All public and staff forms, client + server validation",
              "Zod schemas shared between frontend and Cloud Functions",
            ],
            [
              "Backend",
              "Firebase Cloud Functions v2",
              "eBay, email, triggers, AI assist, scheduled jobs",
              "Cloud Run backed — better cold-start, concurrency, min-instances",
            ],
            [
              "Database",
              "Cloud Firestore",
              "Unified inventory with viewTag; real-time snapshots",
              "NoSQL fits semi-structured inventory; real-time powers staff dashboard",
            ],
            [
              "File Storage",
              "Firebase Cloud Storage",
              "Item images, per-view watermarks, QR labels",
              "Storage Rules mirror Firestore Rules",
            ],
            [
              "Auth",
              "Firebase Authentication",
              "Email/password + Google SSO, MFA enforced for staff",
              "Custom claims for role; MFA via Firebase Auth MFA APIs",
            ],
            [
              "Hosting",
              "Firebase Hosting",
              "CDN SPA hosting, preview channels, per-view sitemap",
              "Zero-config SPA rewrites; preview channels for PR review",
            ],
            [
              "Email",
              "SendGrid",
              "Transactional + campaign; per-view branded templates",
              "Template control + DMARC support",
            ],
            [
              "External Listing",
              "eBay Sell API (Inventory v1)",
              "Pawn items only; cannabis/fireworks = local pickup",
              "REST, modern, supports bulk; Trading API deprecated",
            ],
            [
              "Search",
              "Firestore prefix tokens → Algolia",
              "Prefix search pre-Algolia; Algolia from Sprint 12",
              "Algolia moved earlier per gap analysis; typo-tolerance critical for collectibles",
            ],
            [
              "Analytics",
              "GA4 + per-view admin dashboard",
              "Per-view conversion, attribution, CRM intelligence",
              "Custom dashboard for inventory metrics not in GA4",
            ],
            [
              "AI",
              "OpenAI GPT-4o (Cloud Function)",
              "Listing descriptions, auto-tagging, price suggestions",
              "Staff-side only; no customer-facing AI in v4",
            ],
            [
              "CRM",
              "Internal Firestore CRM (E15)",
              "Customer profiles, segments, VIP, journeys",
              "HubSpot integration deferred to post-launch",
            ],
            [
              "Error Monitor",
              "Sentry",
              "React error boundary + Cloud Function capture",
              "Better stack traces than Firebase Crashlytics web",
            ],
            [
              "CI/CD",
              "GitHub Actions",
              "Lint, typecheck, test, Lighthouse CI, deploy",
              "Manual approval gate on prod deploy via GitHub Environments",
            ],
            [
              "Dev Env",
              "GitHub Codespaces",
              "Cloud-hosted VS Code, zero local setup",
              "Eliminates environment inconsistency; prebuilds reduce start time",
            ],
            [
              "Feature Flags",
              "Firestore config/featureFlags",
              "Per-view rollout, A/B gating, emergency shutdown",
              "useFeatureFlag(key) hook reads on app init",
            ],
            [
              "Testing",
              "Vitest + Playwright + axe-core",
              "Unit, E2E, accessibility automated testing",
              "Playwright for cross-browser + mobile viewport; axe-core in CI",
            ],
          ],
          [1400, 2200, 2600, 3160],
        ),
        spacer(120),

        h2("2.2 Architecture Diagram References"),
        callout(
          "The following visual diagrams are required deliverables from the design/architecture phase. They are to be produced in Miro or Figma and linked from this document before Sprint 4 begins.",
          WARN_BG,
        ),
        spacer(60),
        tbl(
          ["Diagram", "Owner", "Required By", "Contents"],
          [
            [
              "High-Level System Architecture",
              "Lead Developer",
              "Sprint 3 end",
              "Browser → Firebase Hosting → Cloud Functions → Firestore → Algolia → OpenAI → eBay → SendGrid",
            ],
            [
              "Authentication & MFA Flow",
              "Lead Developer",
              "Sprint 4 start",
              "Login → MFA challenge → custom claims → protected route",
            ],
            [
              "Inventory Lifecycle Flow",
              "Lead Developer",
              "Sprint 5 start",
              "Draft → Active → Reserved → Pending Pickup → Sold → Archived",
            ],
            [
              "Pawn Intake Workflow",
              "Lead Developer",
              "Sprint 10 start",
              "Customer submits → Cloud Function → staff inbox → quote → complete/decline",
            ],
            [
              "eBay Sync Workflow",
              "Lead Developer",
              "Sprint 9 start",
              "Staff trigger → ebayListItem → ebayPublishOffer → ebaySyncStatus (4h) → Firestore update",
            ],
            [
              "CRM Automation Flow",
              "Lead Developer",
              "Sprint 18 start",
              "Event → updateCRMProfile → segment recalc → autoFollowUp trigger",
            ],
            [
              "Seasonal Campaign Flow",
              "Lead Developer",
              "Sprint 15 start",
              "Staff creates campaign → config/campaigns doc → onCampaignChange → homepage takeover",
            ],
            [
              "Three-View Routing Diagram",
              "Lead Developer + Designer",
              "Sprint 3 end",
              "URL prefix → ViewContext → CSS class injection → token override → per-view component",
            ],
          ],
          [2200, 1600, 1600, 3960],
        ),
        spacer(120),

        h2("2.3 Three-View Design Token System"),
        tbl(
          ["Token", "Pawn Shop", "Cannabis", "Fireworks"],
          [
            [
              "--color-primary",
              "#C8A14A (Gold)",
              "#7B4FA0 (Purple)",
              "#C0392B (Red)",
            ],
            [
              "--color-bg",
              "#080706 (Black)",
              "#1A0D2E (Deep Purple)",
              "#1A0A0A (Dark Red)",
            ],
            [
              "--color-surface",
              "#1A1814 (Charcoal)",
              "#2D1B4E (Mid Purple)",
              "#2D1010 (Maroon)",
            ],
            [
              "--color-accent",
              "#E8C87A (Gold Light)",
              "#D4A1F0 (Lavender)",
              "#F39C12 (Amber)",
            ],
            [
              "--color-text",
              "#F0E8D4 (Parchment)",
              "#EDE0FF (Pale Lavender)",
              "#FAF0E0 (Ivory)",
            ],
            [
              "--font-display",
              "Playfair Display",
              "Cormorant Garamond",
              "Bebas Neue",
            ],
            ["--font-body", "IM Fell English", "DM Sans", "Oswald"],
            ["CSS Class", ".view-pawn", ".view-cannabis", ".view-fireworks"],
            ["Route Prefix", "/pawn", "/cannabis", "/fireworks"],
          ],
          [2000, 2320, 2320, 2720],
        ),
        spacer(120),

        h2("2.4 Environment Variable Reference"),
        tbl(
          ["Variable", "Purpose", "Environment", "Secret?", "Owner"],
          [
            [
              "VITE_FIREBASE_API_KEY",
              "Firebase client config",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "VITE_FIREBASE_AUTH_DOMAIN",
              "Firebase Auth domain",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "VITE_FIREBASE_PROJECT_ID",
              "Firestore project ID",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "VITE_FIREBASE_STORAGE_BUCKET",
              "Cloud Storage bucket",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "VITE_FIREBASE_MESSAGING_ID",
              "FCM sender ID",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "VITE_FIREBASE_APP_ID",
              "Firebase app ID",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "VITE_GA_MEASUREMENT_ID",
              "Google Analytics 4 measurement ID",
              "Frontend (prod)",
              "No",
              "Dev",
            ],
            [
              "VITE_HCAPTCHA_SITE_KEY",
              "hCaptcha public site key",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "VITE_ALGOLIA_APP_ID",
              "Algolia application ID",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "VITE_ALGOLIA_SEARCH_KEY",
              "Algolia public search-only API key",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "VITE_SENTRY_DSN",
              "Sentry error reporting DSN",
              "Frontend (both)",
              "No",
              "Dev",
            ],
            [
              "FIREBASE_TOKEN_DEV",
              "Firebase CLI deploy token (dev)",
              "GitHub Actions",
              "Yes",
              "Dev",
            ],
            [
              "FIREBASE_TOKEN_PROD",
              "Firebase CLI deploy token (prod)",
              "GitHub Actions",
              "Yes",
              "Dev",
            ],
            [
              "EBAY_CLIENT_ID",
              "eBay API client ID",
              "Functions / Secret Manager",
              "Yes",
              "Dev",
            ],
            [
              "EBAY_CLIENT_SECRET",
              "eBay API client secret",
              "Functions / Secret Manager",
              "Yes",
              "Dev",
            ],
            [
              "SENDGRID_API_KEY",
              "SendGrid email dispatch",
              "Functions / Secret Manager",
              "Yes",
              "Dev",
            ],
            [
              "TWILIO_ACCOUNT_SID",
              "Twilio SMS account SID",
              "Functions / Secret Manager",
              "Yes",
              "Dev",
            ],
            [
              "TWILIO_AUTH_TOKEN",
              "Twilio SMS auth token",
              "Functions / Secret Manager",
              "Yes",
              "Dev",
            ],
            [
              "OPENAI_API_KEY",
              "OpenAI GPT-4o API key (E18)",
              "Functions / Secret Manager",
              "Yes",
              "Dev",
            ],
            [
              "ALGOLIA_ADMIN_KEY",
              "Algolia admin key (index writes)",
              "Functions / Secret Manager",
              "Yes",
              "Dev",
            ],
            [
              "SENTRY_AUTH_TOKEN",
              "Sentry source map upload auth token",
              "GitHub Actions",
              "Yes",
              "Dev",
            ],
            [
              "GCS_BACKUP_BUCKET",
              "GCS bucket name for Firestore backups",
              "Functions",
              "No",
              "Dev",
            ],
          ],
          [2400, 2800, 1800, 800, 560],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 3 — EPICS
        // ══════════════════════════════════════════════════════════════════════════════
        h1("3. Epics — Complete Set (E1–E19)"),
        para(
          "Nineteen epics organise all work. E1–E12 are retained and updated from v2.1. E13–E19 are new epics closing all gaps identified in the industry review. Total: ~660 feature points + 60 infrastructure/QA = ~720 story points.",
        ),
        spacer(80),
        tbl(
          ["#", "Epic", "Description", "Points", "Phase"],
          [
            [
              "E1",
              "Project Foundation & DevOps",
              "Monorepo, Vite/React scaffold, Firebase dev/prod, Codespaces devcontainer, GitHub Actions CI/CD, nightly backup, MFA enforcement setup, Operational Runbook v1.",
              "40",
              "1",
            ],
            [
              "E2",
              "Design System & Three-View Tokens",
              "Gold/black base tokens + per-view CSS overrides, component library, Storybook, PWA manifest, motion design spec, photography brief per view.",
              "40",
              "1",
            ],
            [
              "E3",
              "Auth, Roles & MFA",
              "Firebase Auth, expanded role system (admin/manager/inventory_staff/marketing_staff/customer), mandatory MFA for staff, session management UI, suspicious login alerts.",
              "34",
              "2",
            ],
            [
              "E4",
              "Inventory Management",
              "Firestore CRUD, three-view schema (viewTag, locationId, merchandisingTags, etc.), image upload, condition grading, intake workflow, hold system, barcode/QR, searchTokens, multi-location fields.",
              "80",
              "2",
            ],
            [
              "E5",
              "Three-View Public Storefront",
              "Three distinct view homepages, shared shop infrastructure, per-view SEO meta, age gates, trust systems, mobile-responsive at 375/768/1280px.",
              "60",
              "2",
            ],
            [
              "E6",
              "Cross-Platform Listing Engine",
              "eBay Sell API (pawn items), Kijiji draft workflow, Facebook deep-link, admin cross-post dashboard, listing sync. Cannabis/fireworks use local-pickup-only policy.",
              "60",
              "3",
            ],
            [
              "E7",
              "Pawn & Enquiry System",
              "Multi-step pawn form, serial number capture, police hold, anonymous inquiry, admin inbox, reply workflow, discreet notifications, data retention.",
              "40",
              "3",
            ],
            [
              "E8",
              "Customer Experience & Community",
              "Mobile-first polish, Facebook Messenger, WhatsApp, Instagram, Maps, click-and-collect, newsletter CASL, reseller registration, new-arrivals digest.",
              "34",
              "4",
            ],
            [
              "E9",
              "Performance, Security & Launch",
              "Lighthouse CI gates, Firestore rules audit, CSP headers, WebP/AVIF pipeline, Firebase App Check, hCaptcha, honeypot, Sentry, Playwright E2E, PWA final.",
              "30",
              "4",
            ],
            [
              "E10",
              "Operations & Inventory Intelligence",
              "Audit log viewer, hold/reservation system, admin analytics dashboard, inventory aging, turnover metrics, pawn conversion funnel, UTM attribution, feature flags.",
              "40",
              "3–4",
            ],
            [
              "E11",
              "Compliance & Privacy",
              "Per-view age gates, PIPEDA retention, consent logging (IP/timestamp/version), jurisdiction notices, stolen goods blacklist, accessibility compliance program, indigenous legal consultation.",
              "34",
              "4",
            ],
            [
              "E12",
              "Customer Retention & Alerts",
              "Saved searches, category alerts, favourites, notification centre, RSS feed, SMS alerts (Twilio), seasonal reminders, pickup confirmation, feature flag rollout.",
              "34",
              "5",
            ],
            [
              "E13",
              "Merchandising & Discovery Engine",
              "Staff picks, trending, related items, recently viewed, collection pages, bundle recs, quick-view modal, visual category cards, infinite scroll, masonry, vertical video, Algolia integration.",
              "45",
              "3",
            ],
            [
              "E14",
              "Seasonal Commerce Engine",
              "Campaign scheduler, homepage takeover modes, countdown timers, holiday templates (Canada Day/Diwali/New Year), category boosts, event inquiry forms, pickup surge workflows.",
              "35",
              "4",
            ],
            [
              "E15",
              "CRM & Customer Intelligence",
              "Customer profiles, purchase/inquiry history, segmentation, VIP tagging, reseller tiers, automated follow-ups, engagement scoring, internal CRM dashboard, abandoned inquiry follow-up.",
              "45",
              "5",
            ],
            [
              "E16",
              "Post-Sale Operations",
              "Return tickets, dispute statuses, refund logs, shipping claims, customer issue tracking, staff resolution notes, eBay dispute workflow.",
              "25",
              "5",
            ],
            [
              "E17",
              "Conversion Optimization Layer",
              "Social proof widgets, live activity feed, testimonials, urgency modules, scarcity indicators, A/B experiment framework (Firebase Remote Config + GA4 tagging).",
              "35",
              "4",
            ],
            [
              "E18",
              "AI Operations Assistant",
              "AI description generation (OpenAI GPT-4o), eBay title optimization, auto-tagging, category recommendation, price suggestion (eBay sold comps), duplicate detection.",
              "35",
              "5",
            ],
            [
              "E19",
              "Editorial & SEO Content System",
              "Blog/article CMS, buying guides, local SEO category landing pages, FAQ engine, brand narrative/About page, Akwesasne identity integration, Finds of the Week, collector culture content.",
              "40",
              "5–6",
            ],
          ],
          [360, 1800, 5040, 540, 620],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 4 — ACCEPTANCE CRITERIA
        // ══════════════════════════════════════════════════════════════════════════════
        h1("4. Epic Acceptance Criteria"),
        para(
          "Acceptance criteria define the definition of done for the highest-complexity epics. All criteria must pass before the epic is considered complete and the sprint closed.",
        ),
        spacer(80),

        h2("E3 — Auth, Roles & MFA"),
        h4("Functional", PAWN_GREEN),
        bullet(
          "Admin, manager, and inventory_staff roles cannot access protected routes without completing MFA setup",
        ),
        bullet(
          "First login forces MFA enrolment; user cannot proceed until TOTP or SMS MFA is active",
        ),
        bullet(
          "Admin can view all active sessions per user account and revoke individual sessions",
        ),
        bullet(
          "Suspicious login from new IP/device triggers email alert to user within 60 seconds",
        ),
        bullet(
          "All five roles (admin, manager, inventory_staff, marketing_staff, customer) have correct route access",
        ),
        h4("Security", FIRE_RED),
        bullet(
          "Firestore rules reject all writes from unauthenticated or wrong-role requests",
        ),
        bullet(
          "MFA bypass attempt (direct route navigation) redirects to MFA setup, never grants access",
        ),
        h4("Performance"),
        bullet("Login + MFA flow completes in < 3 seconds on 4G mobile"),
        spacer(120),

        h2("E4 — Inventory Management"),
        h4("Functional", PAWN_GREEN),
        bullet(
          "Staff can create, edit, archive items with all v3 schema fields including viewTag, merchandisingTags, locationId",
        ),
        bullet(
          "Hold system: item set to reserved shows hold timer; holdExpiry Cloud Function resets to active within 30 minutes of expiry",
        ),
        bullet(
          "Audit log writes on every staff create/edit/archive/price-change/hold-set/hold-release within 2 seconds of action",
        ),
        bullet(
          "QR label generates as PNG and saves to Storage within 10 seconds of item create",
        ),
        bullet(
          "searchTokens array regenerates automatically when title or tags are updated",
        ),
        h4("Performance"),
        bullet(
          "Admin inventory list with 200 items renders in < 2 seconds via Firestore real-time snapshot",
        ),
        h4("Accessibility"),
        bullet(
          "Add/edit item form is fully keyboard navigable; all inputs have visible labels",
        ),
        spacer(120),

        h2("E5 — Three-View Public Storefront"),
        h4("Functional", PAWN_GREEN),
        bullet(
          "All three view homepages render with correct CSS class (.view-pawn / .view-cannabis / .view-fireworks) applied to root element",
        ),
        bullet(
          "Age gate: cannabis and fireworks views display full-screen 19+ modal on first visit; sessionStorage prevents repeat within session",
        ),
        bullet(
          "Consent log record written to Firestore within 5 seconds of age gate confirmation",
        ),
        bullet(
          "Shop page prefix search returns results within 800ms on a Firestore query with up to 500 items",
        ),
        bullet(
          "Item detail page displays correct hold status badge in real time when hold state changes",
        ),
        h4("SEO"),
        bullet(
          "Each view page has unique title, description, and OG meta via React Helmet Async",
        ),
        bullet(
          "LocalBusiness JSON-LD schema present on all three view homepages",
        ),
        h4("Accessibility"),
        bullet(
          "Age gate modal traps focus; ESC key does not dismiss it; only explicit confirm button works",
        ),
        bullet("All item card images have descriptive alt text"),
        h4("Performance"),
        bullet(
          "Homepage LCP < 2.5 seconds on mobile (375px viewport) on a throttled 4G connection",
        ),
        spacer(120),

        h2("E6 — Cross-Platform Listing Engine"),
        h4("Functional", PAWN_GREEN),
        bullet(
          "Staff can push a pawn item to eBay from the admin UI; eBay listing URL appears in item record within 30 seconds",
        ),
        bullet(
          "ebaySyncStatus runs every 4 hours; sold/ended items update in Firestore within 10 minutes of eBay status change",
        ),
        bullet(
          "Cannabis and fireworks items pushed to eBay use local-pickup-only shipping policy automatically",
        ),
        bullet(
          "Bulk cross-post of 10 items completes without eBay rate limit error (500ms delay between calls enforced)",
        ),
        h4("Error Handling"),
        bullet(
          "Failed eBay listing surfaces in admin dashboard with error message and retry button",
        ),
        bullet(
          "eBay OAuth token expiry handled silently by ebayRefreshToken; staff is never logged out mid-session",
        ),
        spacer(120),

        h2("E13 — Merchandising & Discovery Engine"),
        h4("Functional", PAWN_GREEN),
        bullet(
          "Recently viewed: persists in localStorage across page refreshes; shows minimum 4 items after browsing",
        ),
        bullet(
          'Trending module: calculateTrendingScore Cloud Function runs daily; "Trending Now" module shows items with view-velocity above threshold',
        ),
        bullet(
          "Related items: item detail page displays minimum 4 items from the same category/viewTag",
        ),
        bullet(
          "Quick-view modal: opens on hover/focus within 200ms; contains image, price, condition, and enquire button; closes on Escape key",
        ),
        bullet(
          "Algolia search: returns typo-tolerant results within 300ms; faceted filtering by viewTag works correctly",
        ),
        h4("Performance"),
        bullet(
          "Homepage merchandising modules render within 300ms after Firestore query response",
        ),
        h4("Accessibility"),
        bullet(
          "Carousel/scroll controls are keyboard accessible; screen reader labels present on all interactive elements",
        ),
        bullet(
          "Quick-view modal traps focus and is announced correctly by NVDA and VoiceOver",
        ),
        spacer(120),

        h2("E14 — Seasonal Commerce Engine"),
        h4("Functional", PAWN_GREEN),
        bullet(
          "Campaign scheduler: staff creates a campaign in Firestore; fireworks homepage updates within 60 seconds without code deploy",
        ),
        bullet(
          "Countdown timer: displays correct time remaining to configured event; updates in real time; disappears after event date passes",
        ),
        bullet(
          "Category boosts: seasonal items appear at top of fireworks shop grid within 5 minutes of campaign activation",
        ),
        bullet(
          "Holiday templates: Canada Day, Diwali, New Year, Summer BBQ layouts render correctly from Firestore config without code changes",
        ),
        h4("Staff UX"),
        bullet(
          "Non-technical staff can create a campaign via admin UI with no developer involvement",
        ),
        spacer(120),

        h2("E15 — CRM & Customer Intelligence"),
        h4("Functional", PAWN_GREEN),
        bullet(
          "Customer profile created or updated in Firestore within 60 seconds of a pawnRequest, item view, or purchase event",
        ),
        bullet(
          "autoFollowUp: pawnRequest pending for 48h+ triggers staff reminder email; quoted request with no customer reply for 72h+ triggers customer follow-up",
        ),
        bullet(
          "Segmentation: admin can filter customer list by total spend, category preference, view preference, and recency",
        ),
        bullet(
          "VIP flag and reseller tier visible on customer profile and in pawn inbox when a flagged customer submits a request",
        ),
        h4("Privacy"),
        bullet(
          "Abandoned inquiry follow-up stores no PII until form is submitted; only session ID tracked",
        ),
        spacer(120),

        h2("E17 — Conversion Optimization Layer"),
        h4("Functional", PAWN_GREEN),
        bullet(
          "Social proof counters update from Firestore stats doc; display correctly on all three view homepages",
        ),
        bullet(
          "Live activity feed: rate-limited to maximum 1 event per 30 seconds; no PII displayed; gracefully handles zero-activity periods",
        ),
        bullet(
          "A/B experiment framework: Firebase Remote Config controls CTA variant; GA4 experiment event fires on each variant impression",
        ),
        h4("Privacy"),
        bullet(
          "Live activity feed shows only item category and action type — never customer name, uid, or contact info",
        ),
        spacer(120),

        h2("E18 — AI Operations Assistant"),
        h4("Functional", PAWN_GREEN),
        bullet(
          "Generate Description: staff triggers from add/edit item form; response received and pre-filled within 15 seconds; staff can edit before saving",
        ),
        bullet(
          "Price suggestion: eBay sold comps returned within 20 seconds; displayed as a price range, not a single value, to avoid false precision",
        ),
        bullet(
          "Auto-tagging: minimum 3 tag suggestions returned; staff can accept, reject, or modify each",
        ),
        h4("Fallback"),
        bullet(
          "If OpenAI API times out (> 30s) or returns an error, the form falls back to manual entry with a clear error message — no data loss",
        ),
        h4("Content"),
        bullet(
          "AI-generated descriptions are reviewed by staff before publish; the admin UI makes this step mandatory (no auto-publish of AI content)",
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 5 — THREE-VIEW SPECIFICATION
        // ══════════════════════════════════════════════════════════════════════════════
        h1("5. Three-View System — Detailed Specification"),

        ...viewBanner(
          "♦",
          "VIEW 1: PAWN SHOP",
          "/pawn  ·  .view-pawn  ·  All personas",
          PAWN_GREEN,
        ),
        spacer(80),
        h2("5.1 Pawn View — Homepage Structure"),
        bullet(
          'Hero: art-deco gold/black, shimmer headline, "Find of the Day" rotating showcase, dual CTAs (Browse Inventory / Pawn or Sell)',
        ),
        bullet(
          "Trust badge strip: Community-owned · eBay verified · Akwesasne · In-store pickup · Serving Cornwall since [year]",
        ),
        bullet(
          '"Recently sold" social proof strip (E17): builds confidence that items move quickly',
        ),
        bullet(
          "Featured inventory grid: 4 most recent active pawn items from Firestore",
        ),
        bullet(
          "Staff picks collection (E13): curated items with staff note/quote",
        ),
        bullet(
          "Brand narrative callout (E19): Akwesasne story, treasure hunting identity, community roots",
        ),
        bullet(
          "Services strip: Pawn Loans · Buy & Sell · eBay Listings · Reseller Program",
        ),
        bullet(
          "Instagram feed (latest 3 posts), Facebook Messenger widget, WhatsApp floating button",
        ),
        bullet("Masonry discovery section for Sandra impulse browsing (E13)"),
        spacer(80),
        h2("5.2 Pawn View — Compliance & Trust"),
        bullet(
          "Stolen goods serial number check on all pawn intake — serialBlacklist collection",
        ),
        bullet(
          "PIPEDA data retention on all pawn request data — 90-day auto-purge unless policeHold=true",
        ),
        bullet(
          "Anonymous inquiry option for privacy-sensitive sellers (no contact info required)",
        ),
        bullet(
          "Police hold flag on items under investigation — blocks archive and eBay listing",
        ),
        bullet("Accessibility statement page + remediation process (E11)"),
        spacer(80),
        h2("5.3 Pawn View — Merchandising Psychology"),
        bullet(
          'Discovery: related items, "you may also like," most viewed (E13)',
        ),
        bullet(
          'Scarcity: low stock alerts, "X people viewed today," hold expiry countdown on item cards (E17)',
        ),
        bullet(
          "Quick-view modal: hover preview without leaving the shop page (E13)",
        ),
        spacer(160),

        ...viewBanner(
          "✦",
          "VIEW 2: CANNABIS LIFESTYLE",
          "/cannabis  ·  .view-cannabis  ·  Marie, Tanya, Wellness seekers",
          CANNABIS_PU,
        ),
        spacer(80),
        h2("5.4 Cannabis View — Design & Presentation"),
        bullet(
          "Visual identity: deep purple/lavender, Cormorant Garamond display, DM Sans body",
        ),
        bullet(
          "Photography standards: macro product photography, dark luxury lighting, minimalist layout, hover interactions, animated reveals",
        ),
        bullet(
          "Hero: cinematic full-bleed video or image, minimal text overlay, single CTA",
        ),
        bullet(
          "Product cards: large image-first, minimal text, hover reveals condition/details",
        ),
        bullet(
          "Mood collections (E13): Relax · Focus · Social · Ceremony — curated product sets by lifestyle vibe",
        ),
        bullet(
          "Limited edition framing on rare or one-of-a-kind wellness items",
        ),
        spacer(80),
        h2("5.5 Cannabis View — Compliance Layer"),
        bullet(
          "19+ full-screen acknowledgment modal — cannot bypass; sessionStorage prevents repeat within session",
        ),
        bullet(
          "Consent logging: IP, timestamp, policy version stored in Firestore consentLogs/{id} on confirm",
        ),
        bullet(
          'Jurisdiction notice: "Sale subject to provincial regulations. Verify legality in your jurisdiction."',
        ),
        bullet(
          "No international or interprovincial shipping; local pickup + local delivery only",
        ),
        bullet(
          "Legal disclaimer page: /legal/cannabis with full regulatory language",
        ),
        spacer(80),
        h2("5.6 Cannabis View — Discretion UX (Marie Persona)"),
        bullet(
          'Email subjects and SMS copy use generic "IslandGold update" language — no category disclosure',
        ),
        bullet("Anonymous inquiry available from all product pages"),
        bullet(
          "Social proof shows only aggregate stats — no personal purchase activity visible",
        ),
        bullet(
          "Privacy policy page with cannabis-specific data handling disclosure",
        ),
        spacer(160),

        ...viewBanner(
          "★",
          "VIEW 3: FIREWORKS & SEASONAL",
          "/fireworks  ·  .view-fireworks  ·  Tanya, Community, Event buyers",
          FIRE_RED,
        ),
        spacer(80),
        h2("5.7 Fireworks View — Design & Seasonal Commerce"),
        bullet(
          "Visual identity: deep red/amber, Bebas Neue display, Oswald body — high-energy, bold",
        ),
        bullet(
          "Hero: animated countdown timer to next major event, prominent and auto-updating",
        ),
        bullet(
          "Category navigation by event type: Family Night · Display Shows · Sparklers & Kids · Professional",
        ),
        bullet(
          "Bundle builder (E13): staff creates pre-packaged bundles; added as single unit with bundle discount badge",
        ),
        bullet(
          '"Limited inventory" and "Selling fast" indicators on popular items (E17)',
        ),
        bullet(
          "Pickup scheduling CTA on all item detail pages — links to E8 click-and-collect",
        ),
        spacer(80),
        h2("5.8 Fireworks View — Seasonal Campaign Engine (E14)"),
        bullet(
          "Campaign scheduler admin UI: staff sets name, dates, featured items, layout — no code deploy required",
        ),
        bullet(
          "Homepage takeover: Firestore config/campaigns drives CSS class + content swap within 60 seconds of save",
        ),
        bullet(
          "Pre-built holiday templates: Canada Day, Diwali, New Year, Summer BBQ",
        ),
        bullet(
          "Category boosts: seasonal items auto-float to top of shop grid during active campaign",
        ),
        bullet(
          "Event inquiry forms: large-event and commercial fireworks bulk inquiry workflow",
        ),
        spacer(80),
        h2("5.9 Fireworks View — Compliance"),
        bullet(
          "19+ full-screen acknowledgment modal with fireworks-specific copy; consent logged to Firestore",
        ),
        bullet(
          "No interprovincial or international shipping; local pickup only",
        ),
        bullet(
          "Legal disclaimer page: /legal/fireworks — federal Transportation of Dangerous Goods Act notice",
        ),
        bullet(
          "Ontario/Quebec-specific jurisdiction notices on applicable category pages",
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 6 — CRM CUSTOMER JOURNEYS
        // ══════════════════════════════════════════════════════════════════════════════
        h1("6. CRM & Customer Intelligence — Journey Examples"),
        para(
          "These three persona journeys illustrate how E15 CRM automation operates in practice. Each journey maps customer actions to the Firestore triggers and Cloud Functions that respond to them.",
        ),
        spacer(80),

        h2("6.1 Kevin — The Reseller Journey"),
        tbl(
          ["Step", "Customer Action", "System Response (E15)", "CRM Update"],
          [
            [
              "1",
              "Kevin views 8 electronics items in one session",
              "incrementItemViews Cloud Function fires; session tracked in GA4",
              "customers/{uid}.categoryPreference: electronics",
            ],
            [
              "2",
              'Kevin saves a search for "vintage electronics"',
              "savedSearches doc created; notifyOn: [email, sms]",
              "engagementScore +5",
            ],
            [
              "3",
              "New vintage amp added to inventory",
              "sendCategoryAlert fires; Kevin receives SMS + email within 60s",
              "lastAlertSent timestamp updated",
            ],
            [
              "4",
              "Kevin submits pawn enquiry for the amp",
              "onPawnRequestCreate fires; staff inbox notification; serial number blacklist check",
              "inquiryHistory appended; engagementScore +10",
            ],
            [
              "5",
              "Kevin enquiry goes 48h with no staff response",
              'autoFollowUp fires; staff receives reminder email: "Kevin has an open enquiry"',
              "No change — staff-side only",
            ],
            [
              "6",
              "Staff quotes Kevin; Kevin accepts and visits store",
              "pawnRequest status → completed; onItemSold fires",
              "lifetimeValue updated; segment may upgrade to reseller_tier: silver",
            ],
            [
              "7",
              "Admin reviews Kevin in /admin/crm",
              "CRM dashboard shows full history: 8 item views, 1 saved search, 1 completed enquiry, LTV, tier",
              "Admin applies VIP flag; Kevin receives priority response on future enquiries",
            ],
          ],
          [320, 2200, 2800, 4040],
        ),
        spacer(120),

        h2("6.2 Tanya — The Seasonal Buyer Journey"),
        tbl(
          ["Step", "Customer Action", "System Response", "CRM Update"],
          [
            [
              "1",
              "Tanya visits /fireworks in early June — sees Canada Day countdown hero",
              "Active Canada Day campaign in config/campaigns renders takeover; countdown timer shows days remaining",
              "viewPreference: fireworks logged in session",
            ],
            [
              "2",
              "Tanya signs up for newsletter from fireworks homepage",
              "CASL double opt-in email sent; Mailchimp subscription created with viewTag=fireworks preference",
              "Newsletter consent timestamped in Firestore",
            ],
            [
              "3",
              "Tanya clicks a Canada Day bundle card and reserves for pickup",
              "Click-and-collect: item status → pending_pickup; staff notification; Tanya selects pickup window",
              "lifetimeValue initiated; pickupHistory created",
            ],
            [
              "4",
              "Staff confirms pickup window",
              "Confirmation SMS + email sent to Tanya with pickup time and address",
              "engagementScore +15",
            ],
            [
              "5",
              "Post-Canada Day: staff schedules Diwali campaign",
              "sendSeasonalCampaign triggers SendGrid blast to fireworks-preference subscribers including Tanya",
              "campaignEmailSent logged",
            ],
            [
              "6",
              "Tanya visits again in October for Diwali fireworks",
              "Returning visitor tracked by GA4; Diwali campaign takeover active",
              "returnVisits +1; engagementScore +5",
            ],
          ],
          [320, 2400, 3000, 3640],
        ),
        spacer(120),

        h2("6.3 Marie — The Wellness Buyer Journey"),
        tbl(
          ["Step", "Customer Action", "System Response", "CRM Update"],
          [
            [
              "1",
              "Marie visits /cannabis; passes 19+ age gate",
              "consentLogs doc created: IP, timestamp, policy version, viewTag=cannabis",
              "No PII stored — anonymous session",
            ],
            [
              "2",
              "Marie browses mood collections; views 3 wellness items",
              "incrementItemViews fires; GA4 item_view events with viewTag=cannabis",
              "Session analytics only — no uid yet",
            ],
            [
              "3",
              "Marie submits anonymous pawn enquiry (no contact info)",
              "onPawnRequestCreate: email sent to staff. contactMethod=anonymous. No customer email sent.",
              "pawnRequests doc created; no uid linkage",
            ],
            [
              "4",
              "Staff responds via admin pawn inbox",
              "sendPawnReply callable: WhatsApp deep link generated for staff to message Marie. Status → quoted.",
              "No CRM update — anonymous",
            ],
            [
              "5",
              "Marie returns, creates account to save a favourite item",
              "users/{uid} created with role=customer; favourites subcollection created",
              "customers/{uid} profile initialized; anonymousHistory not retroactively linked (privacy)",
            ],
            [
              "6",
              "Marie subscribes to category alerts for wellness",
              "savedSearches doc created: category=wellness, viewTag=cannabis, notifyOn=[email]",
              "categoryPreference: cannabis/wellness; engagementScore +5",
            ],
            [
              "7",
              "New wellness item added — Marie receives alert",
              'sendCategoryAlert: email sent with generic subject "New arrival you may like" — no cannabis mention',
              "lastAlertSent updated; engagementScore +5",
            ],
          ],
          [320, 2200, 2800, 4040],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 7 — COMPLIANCE & PRIVACY
        // ══════════════════════════════════════════════════════════════════════════════
        h1("7. Compliance & Privacy"),

        h2("7.1 Age Gate — Per-View Configuration"),
        tbl(
          [
            "View",
            "Age Requirement",
            "Gate Style",
            "Consent Logged",
            "Shipping Policy",
          ],
          [
            [
              "Pawn Shop",
              "None (general retail)",
              "No gate",
              "N/A",
              "Standard shipping permitted",
            ],
            [
              "Cannabis",
              "19+ (Ontario / Quebec)",
              "Full-screen modal, explicit confirm, no bypass",
              "Yes — IP, timestamp, policy version, viewTag",
              "Local pickup + delivery only. No international.",
            ],
            [
              "Fireworks",
              "19+ (Ontario)",
              "Full-screen modal, explicit confirm, no bypass",
              "Yes — IP, timestamp, policy version, viewTag",
              "Local pickup only. No interprovincial.",
            ],
          ],
          [1200, 1600, 2200, 2000, 2360],
        ),
        spacer(120),

        h2("7.2 PIPEDA Data Retention"),
        tbl(
          ["Data Type", "Retention", "Purge Rule"],
          [
            [
              "Pawn requests (no police hold)",
              "90 days from submission",
              "Monthly Cloud Function: purgeExpiredData",
            ],
            [
              "Pawn requests (police hold=true)",
              "Indefinite",
              "Admin must clear hold flag before purge applies",
            ],
            [
              "Reseller leads",
              "1 year from submission",
              "Same monthly purge function",
            ],
            [
              "Newsletter subscribers",
              "Until unsubscribe",
              "Mailchimp/Buttondown handles; consent timestamp in Firestore",
            ],
            [
              "Audit logs",
              "2 years",
              "Not auto-purged in MVP; BigQuery archival post-launch",
            ],
            [
              "Customer enquiries (item-specific)",
              "90 days",
              "Same monthly purge function",
            ],
            [
              "Consent logs (age gate)",
              "7 years (legal compliance)",
              "Not auto-purged; immutable; create-only Firestore rules",
            ],
          ],
          [2600, 2200, 4560],
        ),
        spacer(120),

        h2("7.3 Accessibility Compliance Program"),
        bullet(
          "Accessibility Statement page (/accessibility): WCAG AA commitment, known limitations, contact for accommodation",
        ),
        bullet(
          "Remediation Process: 30-day SLA for critical issues; 90-day SLA for non-critical; documented internally",
        ),
        bullet(
          "Keyboard Audit: all interactive elements on all three views tested; documented in QA checklist",
        ),
        bullet(
          "Screen Reader QA: NVDA (Windows) and VoiceOver (iOS) on all view homepages, shop pages, and age-gate flows",
        ),
        bullet(
          "Automated: axe-core integrated into Playwright E2E suite; violations fail CI build",
        ),
        bullet("Re-audit: WCAG AA third-party audit at 6 months post-launch"),
        spacer(120),

        h2("7.4 Indigenous Jurisdiction Legal Consultation"),
        callout(
          "HARD GATE: This milestone must be completed and signed off before M11 (Production Launch). Scheduled for Sprint 16 (Week 32). If delayed, launch date adjusts accordingly.",
          WARN_BG,
        ),
        spacer(80),
        bullet(
          "Tax handling: GST/HST applicability on reserve for online transactions",
        ),
        bullet(
          "Cannabis commerce: provincial licensing overlap with on-reserve jurisdiction",
        ),
        bullet(
          "Fireworks commerce: Transportation of Dangerous Goods Act vs. Akwesasne territorial authority",
        ),
        bullet("Cross-border implications: NY State sales to/from Akwesasne"),
        bullet(
          "All jurisdiction disclosure copy reviewed and approved by counsel before launch",
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 8 — SECURITY & OPERATIONAL RUNBOOK
        // ══════════════════════════════════════════════════════════════════════════════
        h1("8. Security & Operational Runbook"),

        h2("8.1 Security Model Summary"),
        tbl(
          ["Measure", "Implementation", "Epic"],
          [
            [
              "Mandatory MFA",
              "TOTP or SMS MFA for admin, manager, inventory_staff. First-login setup flow. Route blocking until MFA verified.",
              "E3",
            ],
            [
              "Session Management UI",
              "Admin views/revokes active sessions via Firebase Auth session management APIs.",
              "E3",
            ],
            [
              "Suspicious Login Alerts",
              "Auth trigger detects new IP/device; email alert sent to user within 60 seconds; logged to auditLogs.",
              "E3",
            ],
            [
              "Admin Audit Alerts",
              "High-risk auditLog writes (price change on high-value item, policeHold toggle) trigger immediate admin email alert.",
              "E10",
            ],
            [
              "Immutable Backup Validation",
              "Monthly Cloud Function validates GCS backup: document count check, sends pass/fail report to admin.",
              "E1",
            ],
            [
              "Secret Rotation",
              "Documented rotation schedule in Runbook: eBay tokens, SendGrid, Twilio, OpenAI, Algolia admin key. Firebase Secret Manager versioning.",
              "E1",
            ],
            [
              "Consent Log Integrity",
              "consentLogs is create-only in Firestore rules; no update/delete path; Admin SDK query only.",
              "E11",
            ],
            [
              "Per-View CSP Headers",
              "Per-view Content Security Policy in firebase.json. Cannabis: stricter frame-ancestors. Fireworks: restricted media-src.",
              "E9",
            ],
            [
              "hCaptcha + Honeypot",
              "All public forms: hCaptcha verified server-side + hidden honeypot field + IP rate-limit (5/hour per IP).",
              "E9",
            ],
            [
              "Firebase App Check",
              "reCAPTCHA Enterprise blocks bot access to Firestore REST and Cloud Functions.",
              "E9",
            ],
            [
              "Firestore Rules Audit",
              "Full rules audit before M10 (Staging Sign-Off). No public write paths; staff rules scoped to uid role claim.",
              "E9",
            ],
          ],
          [2400, 4800, 1160],
        ),
        spacer(120),

        h2("8.2 Operational Runbook — Incident Playbooks"),
        callout(
          "The full runbook is a living document maintained in the repository at /docs/runbook.md. The following playbooks are the minimum required content at v1.",
          CALLOUT_BG,
        ),
        spacer(80),

        h3("Playbook 1: Firebase Service Outage"),
        num(
          "Check Firebase Status page (status.firebase.google.com) to confirm scope of outage",
        ),
        num(
          "If Firestore is down: admin portal will display a maintenance banner (pre-configured static fallback page on Firebase Hosting)",
        ),
        num(
          'Notify staff via WhatsApp group: "Website inventory features temporarily unavailable. Use manual processes."',
        ),
        num(
          "eBay sync is paused automatically (ebaySyncStatus Cloud Function will retry on next 4h schedule)",
        ),
        num(
          "Post incident: verify Firestore data integrity; check auditLogs for any partial writes",
        ),
        spacer(80),
        h3("Playbook 2: eBay API Outage or Rate Limit"),
        num(
          "If eBay returns 429 or 503: ebayListItem Cloud Function returns error to admin UI with retry button",
        ),
        num(
          "Staff can continue adding items to Firestore inventory without eBay listing — eBay push can be retried later",
        ),
        num("Check eBay Developer Status page for outage confirmation"),
        num(
          "If outage > 4 hours: use Kijiji draft generation or Facebook deep-link workflow as manual fallback",
        ),
        num(
          "Post outage: run bulk retry from cross-post dashboard; verify listing status sync",
        ),
        spacer(80),
        h3("Playbook 3: OpenAI API Failure (E18)"),
        num(
          "AI features fail gracefully — form falls back to manual entry; no data loss",
        ),
        num(
          'Admin UI shows clear error: "AI description unavailable — enter manually"',
        ),
        num(
          "Check OpenAI status page; if billing issue, check OpenAI dashboard for API limit or payment",
        ),
        num(
          "AI features can be disabled via config/featureFlags: { aiDescriptionEnabled: false } until resolved",
        ),
        spacer(80),
        h3("Playbook 4: Credential Compromise"),
        num(
          "Immediately revoke compromised key in the relevant service (Firebase Console / SendGrid / OpenAI / Twilio)",
        ),
        num(
          "Generate new credential; update in Firebase Secret Manager; redeploy Cloud Functions (npm run deploy:functions)",
        ),
        num(
          "Review auditLogs for any actions taken under the compromised credential",
        ),
        num(
          "If Firebase Admin SDK service account is compromised: rotate key in Google Cloud IAM; update GitHub secret FIREBASE_TOKEN_PROD",
        ),
        num(
          "Notify affected parties per PIPEDA breach notification requirements if customer data was accessed",
        ),
        spacer(80),
        h3("Playbook 5: Spam Attack on Public Forms"),
        num(
          "IP rate limiting (5 submissions/hour) should catch most attacks automatically",
        ),
        num(
          "If attack continues: temporarily disable public form submission via feature flag { pawnFormEnabled: false }",
        ),
        num(
          "Review Cloud Function logs for pattern; add IP to Firebase App Check deny list if persistent",
        ),
        num(
          "Re-enable form after attack subsides; review hCaptcha score thresholds",
        ),
        spacer(80),
        h3("Playbook 6: MFA Reset for Staff Account"),
        num(
          "Admin logs in to Firebase Console → Authentication → Users → find user",
        ),
        num(
          "In Firebase Console, under Multi-factor, remove enrolled factors for the user",
        ),
        num("Notify user: they will be prompted to re-enrol MFA on next login"),
        num(
          "Log the reset in a manual note in auditLogs if the user had elevated access",
        ),
        spacer(80),
        h3("Playbook 7: Firestore Data Restore"),
        num(
          "Identify the GCS backup to restore from: gs://islandgold-backups/YYYY-MM-DD/",
        ),
        num("Stop all Cloud Function deploys to prevent writes during restore"),
        num(
          "Run: gcloud firestore import gs://islandgold-backups/YYYY-MM-DD/ --project=islandgold-prod",
        ),
        num(
          "Verify document counts against pre-restore state using admin analytics dashboard",
        ),
        num("Re-enable Cloud Function deploys; monitor Sentry for errors"),
        num(
          "Document the restore event in the runbook with date, cause, and data-loss assessment",
        ),
        spacer(80),
        h3("Playbook 8: High-Risk Inventory Flag (Police Hold)"),
        num(
          "Staff sets policeHold=true on item in admin portal — item immediately moves to draft status (not publicly visible)",
        ),
        num(
          "eBay listing is ended automatically by onItemSold Cloud Function if item was listed",
        ),
        num("Admin audit alert sent immediately to admin email"),
        num(
          "Item cannot be archived or deleted while policeHold=true — only an admin can clear the flag",
        ),
        num(
          "Staff contacts law enforcement as appropriate; document in item crmNotes field",
        ),
        spacer(80),
        h3("Playbook 9: Secret Rotation Schedule"),
        tbl(
          ["Secret", "Rotation Frequency", "Process"],
          [
            [
              "eBay OAuth refresh token",
              "Auto-rotated by ebayRefreshToken Cloud Function (daily)",
              "Automatic — no manual step",
            ],
            [
              "SendGrid API key",
              "Annually or on staff departure",
              "Generate new key in SendGrid → update Firebase Secret Manager → redeploy functions",
            ],
            [
              "OpenAI API key",
              "Annually or on suspected compromise",
              "Generate new key in OpenAI dashboard → update Firebase Secret Manager → redeploy functions",
            ],
            [
              "Twilio auth token",
              "Annually or on suspected compromise",
              "Rotate in Twilio Console → update Firebase Secret Manager → redeploy functions",
            ],
            [
              "Algolia admin key",
              "Annually",
              "Generate new key in Algolia → update Firebase Secret Manager → redeploy functions",
            ],
            [
              "Firebase service accounts",
              "On lead developer departure or suspected compromise",
              "Rotate in Google Cloud IAM → update GitHub Secrets FIREBASE_TOKEN_PROD / DEV",
            ],
          ],
          [2000, 2000, 5360],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 9 — GAP ANALYSIS CLOSURE
        // ══════════════════════════════════════════════════════════════════════════════
        h1("9. Gap Analysis — Closure Summary"),
        para(
          "All 17 gaps identified across two rounds of industry deep-review are addressed in this plan.",
        ),
        spacer(80),
        tbl(
          ["Gap ID", "Gap Description", "Closed By", "Sprint"],
          [
            [
              "G1",
              "Missing conversion psychology systems",
              "E17: Conversion Optimization Layer",
              "S14",
            ],
            [
              "G2",
              "Missing advanced merchandising systems",
              "E13: Merchandising & Discovery Engine",
              "S11–12",
            ],
            [
              "G3",
              "Weak loyalty/gamification layer",
              "E12 (expanded) + E15: CRM Intelligence",
              "S16–17",
            ],
            [
              "G4",
              "Missing modern search/discovery UX",
              "E13 + Algolia moved to Sprint 12",
              "S12–13",
            ],
            [
              "G5",
              "Missing trust and authenticity systems",
              "E17 + E19: Editorial & Brand Narrative",
              "S14–15",
            ],
            [
              "G6",
              "Missing omnichannel communications",
              "E15: CRM + E12: SMS/email journeys",
              "S16–17",
            ],
            [
              "G7",
              "Missing inventory monetization workflows",
              "E13: Bundles + E14: Seasonal Engine",
              "S11–14",
            ],
            [
              "G8",
              "Missing AI-assisted operational tooling",
              "E18: AI Operations Assistant",
              "S17–18",
            ],
            [
              "G9",
              "Missing legal/compliance hardening",
              "E11 (expanded): consent logging, jurisdiction review, accessibility",
              "S13",
            ],
            [
              "G10",
              "Missing operational disaster recovery",
              "E1 (expanded): Operational Runbook v1 in S1 (9 playbooks)",
              "S1–2",
            ],
            [
              "G11",
              "Missing advanced analytics/attribution",
              "E10 (expanded): UTM tracking, per-view attribution, CRM analytics",
              "S12",
            ],
            [
              "G12",
              "Missing scalability planning",
              "E4 (expanded): locationId + multi-location fields; Pub/Sub planning",
              "S3–4",
            ],
            [
              "G-SEC",
              "Missing MFA and session management",
              "E3 (expanded): mandatory MFA + session UI + suspicious login alerts",
              "S3",
            ],
            [
              "G-CSS",
              "Missing visual content direction",
              "E2 (expanded): photography brief + motion design spec per view",
              "S2–3",
            ],
            [
              "G-POST",
              "Missing returns/dispute workflows",
              "E16: Post-Sale Operations (return tickets, eBay disputes)",
              "S17",
            ],
            [
              "G-ALGOLIA",
              "Algolia too late in roadmap",
              "Moved from Sprint 20 to Sprint 12 — 8 sprints earlier",
              "S12",
            ],
            [
              "G-MULTI",
              "Single-location schema assumption",
              "locationId field added to item schema in E4 (unused in MVP)",
              "S4",
            ],
          ],
          [900, 2800, 3600, 1060],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 10 — QA & TESTING STRATEGY
        // ══════════════════════════════════════════════════════════════════════════════
        h1("10. QA & Testing Strategy"),
        para(
          "A unified QA strategy covering all testing layers. All gates in the table below must pass before the corresponding milestone is approved.",
        ),
        spacer(80),

        h2("10.1 Performance Targets"),
        tbl(
          ["Metric", "Target", "Tool", "Gate"],
          [
            [
              "Lighthouse Performance (all 3 views)",
              "≥ 90",
              "Lighthouse CI (GitHub Actions)",
              "Pre-launch hard gate (M10)",
            ],
            [
              "Lighthouse Accessibility",
              "≥ 90",
              "Lighthouse CI",
              "Pre-launch hard gate (M10)",
            ],
            [
              "Lighthouse SEO",
              "≥ 95",
              "Lighthouse CI",
              "Pre-launch hard gate (M10)",
            ],
            [
              "Largest Contentful Paint (mobile)",
              "< 2.5s",
              "Core Web Vitals / GA4",
              "Pre-launch hard gate (M10)",
            ],
            [
              "Cloud Function p95 response time",
              "< 500ms",
              "Firebase Performance Monitoring",
              "Soft target — monitored post-launch",
            ],
            [
              "Admin dashboard load time",
              "< 2s",
              "Sentry / Firebase Performance",
              "Soft target — monitored post-launch",
            ],
            [
              "Algolia search response",
              "< 300ms",
              "Algolia dashboard",
              "Sprint 12 acceptance criterion",
            ],
            [
              "Quick-view modal open time",
              "< 200ms",
              "Playwright performance trace",
              "Sprint 12 acceptance criterion",
            ],
          ],
          [2600, 900, 2200, 3660],
        ),
        spacer(120),

        h2("10.2 Accessibility Targets"),
        tbl(
          ["Requirement", "Standard", "Tested By"],
          [
            [
              "Colour contrast on all text",
              "WCAG AA (4.5:1 normal, 3:1 large)",
              "axe-core in CI + manual Storybook audit",
            ],
            [
              "Keyboard navigation — all interactive elements",
              "WCAG 2.1 SC 2.1.1",
              "Manual QA checklist + Playwright keyboard test",
            ],
            [
              "Focus management in modals and age gates",
              "WCAG 2.1 SC 2.4.3",
              "Manual + Playwright",
            ],
            [
              "Screen reader compatibility",
              "NVDA (Windows) + VoiceOver (iOS)",
              "Manual QA on all three view homepages pre-launch",
            ],
            ["Form error messages", "WCAG 2.1 SC 3.3.1", "axe-core + manual"],
            [
              "Alt text on all item images",
              "WCAG 2.1 SC 1.1.1",
              "Automated scan + manual image audit",
            ],
            [
              "Age gate modal: focus trapped, ESC does not dismiss",
              "WCAG 2.1 SC 2.1.2",
              "Playwright E2E test",
            ],
          ],
          [3200, 2400, 3760],
        ),
        spacer(120),

        h2("10.3 SEO Targets"),
        tbl(
          ["Requirement", "Target", "Verified By"],
          [
            ["Lighthouse SEO score (all 3 views)", "≥ 95", "Lighthouse CI"],
            [
              "schema.org LocalBusiness JSON-LD",
              "Present on all view homepages",
              "Manual check + Google Rich Results Test",
            ],
            [
              "Unique meta title + description per page",
              "100% of indexed pages",
              "React Helmet Async audit",
            ],
            [
              "OG and Twitter Card meta per page",
              "100% of indexed pages",
              "Open Graph debugger",
            ],
            [
              "Sitemap.xml generated and submitted",
              "Per-view sitemap present",
              "vite-plugin-sitemap + Google Search Console",
            ],
            [
              "Robots.txt: /admin blocked from crawl",
              "Verified",
              "robots.txt audit",
            ],
            [
              "Category landing pages for long-tail SEO (E19)",
              "Minimum 6 at launch",
              "Manual count at S19",
            ],
          ],
          [2800, 2000, 4560],
        ),
        spacer(120),

        h2("10.4 Testing Layers"),
        h3("Unit Testing (Vitest + React Testing Library)"),
        bullet("All React hooks: useAuth, useFeatureFlag, useViewContext"),
        bullet("All Zod validation schemas used in public forms"),
        bullet(
          "All utility functions: searchToken generation, price formatting, date/hold expiry calculations",
        ),
        bullet(
          "Cloud Function input validation logic (pure functions extracted for testability)",
        ),
        h3("Integration Testing"),
        bullet(
          "Firestore CRUD operations via Firebase emulator: create/edit/archive item, pawnRequest create, auditLog write",
        ),
        bullet(
          "Cloud Function integration: onItemCreate, onPawnRequestCreate, holdExpiry, algoliaIndexSync",
        ),
        bullet(
          "eBay API: full sandbox flow — ebayListItem → ebayPublishOffer → ebaySyncStatus (mocked in CI)",
        ),
        h3("E2E Testing (Playwright)"),
        bullet(
          "Per-view homepage loads with correct CSS class and design tokens",
        ),
        bullet(
          "Age gate: cannabis and fireworks views display modal; confirm button works; ESC does not dismiss",
        ),
        bullet(
          "Shop page: prefix search returns results; category filter updates grid; sort works",
        ),
        bullet(
          "Item detail: enquire CTA opens modal; form submits and creates pawnRequest in Firestore emulator",
        ),
        bullet(
          "Staff portal: login → add item → set hold → view audit log → push to eBay (mocked)",
        ),
        bullet(
          "Seasonal campaign: Firestore config update triggers correct CSS class on fireworks homepage",
        ),
        h3("Accessibility Testing"),
        bullet(
          "axe-core scans run in Playwright suite on all three view pages — violations fail CI build",
        ),
        bullet(
          "Storybook: WCAG AA contrast check on all component variants (all three view palettes)",
        ),
        bullet(
          "Pre-launch manual audit: keyboard navigation and screen reader on all public-facing flows",
        ),
        h3("UAT — User Acceptance Testing"),
        tbl(
          ["UAT Session", "Participants", "Scope", "Sprint"],
          [
            [
              "Alpha UAT (M4)",
              "Lead developer + business owner",
              "All three view homepages, shop, item detail — visual and functional review",
              "S8",
            ],
            [
              "Beta UAT (M7)",
              "Lead developer + staff (all roles)",
              "Staff portal: add item, intake, hold, eBay push, pawn inbox, click-and-collect. Compliance: age gates, consent logging.",
              "S14",
            ],
            [
              "Pre-launch UAT (M10)",
              "Business owner + 2 external users (personas: Kevin + Tanya)",
              "End-to-end persona walkthroughs. Kevin: browse → save search → enquire. Tanya: fireworks → bundle → reserve pickup.",
              "S18",
            ],
          ],
          [1600, 2200, 4000, 1560],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 11 — RELEASE MANAGEMENT
        // ══════════════════════════════════════════════════════════════════════════════
        h1("11. Release Management & Rollback"),

        h2("11.1 Deployment Pipeline"),
        tbl(
          ["Event", "Trigger", "Pipeline Steps", "Approval Required"],
          [
            [
              "PR to develop",
              "Pull request opened",
              "Lint → Typecheck → Vitest → Playwright (smoke) → Lighthouse CI → build",
              "All checks must pass",
            ],
            [
              "Merge to develop",
              "Push to develop branch",
              "Full CI → firebase deploy --only hosting,functions,firestore:rules (dev project)",
              "None — auto-deploys to dev",
            ],
            [
              "Merge to main",
              "Push to main branch",
              "Full CI → vite build → firebase deploy (prod project) → Sentry source maps upload",
              'Manual approval in GitHub Environment "production"',
            ],
            [
              "Hotfix",
              "hotfix/* branch from main",
              "Full CI → deploy to prod → merge hotfix back to develop",
              "Manual approval (expedited — same approver)",
            ],
          ],
          [1400, 1800, 3800, 2360],
        ),
        spacer(120),

        h2("11.2 Production Freeze Rules"),
        bullet(
          "No deployments to production in the 72 hours before a major seasonal event (Canada Day, Diwali, New Year)",
        ),
        bullet(
          "No schema-breaking Firestore changes without a migration plan reviewed by the lead developer",
        ),
        bullet(
          "All production deploys require a passing Playwright E2E run on the dev environment in the same day",
        ),
        bullet(
          "Deployments after 4pm ET on Fridays require explicit business owner approval",
        ),
        spacer(80),

        h2("11.3 Rollback Procedure"),
        num(
          "Identify the last known-good deploy in GitHub Actions deploy-prod.yml run history",
        ),
        num(
          "Re-run that deploy workflow directly from the GitHub Actions UI (re-run last successful deploy)",
        ),
        num(
          "If Firestore schema change caused the issue: restore from GCS backup (see Playbook 7 in Section 8)",
        ),
        num(
          'Notify staff: "Website update rolled back — features from [date] are temporarily unavailable"',
        ),
        num(
          "Post-mortem: document root cause and fix in GitHub issue before re-deploying",
        ),
        spacer(80),

        h2("11.4 Launch-Day Checklist (M11)"),
        tbl(
          ["Task", "Owner", "Verified"],
          [
            [
              "DNS cutover: A/AAAA records pointing to Firebase prod hosting IPs",
              "Developer",
              "☐",
            ],
            [
              "Firebase prod SSL certificate provisioned (auto — Firebase handles)",
              "Developer",
              "☐",
            ],
            [
              "eBay production OAuth credentials active; test listing published and ended",
              "Developer",
              "☐",
            ],
            [
              "SendGrid sending domain DKIM/DMARC verified; test pawn email sent and received",
              "Developer",
              "☐",
            ],
            [
              "GA4 conversion events firing in debug view for all three views",
              "Developer",
              "☐",
            ],
            [
              "All three view age gates confirmed live and logging consent to Firestore",
              "Developer",
              "☐",
            ],
            [
              "Firebase budget alerts configured: $25 / $100 / $500 on both dev and prod projects",
              "Developer",
              "☐",
            ],
            [
              "Sentry receiving errors from production build; test error triggered and confirmed",
              "Developer",
              "☐",
            ],
            [
              "Staff MFA enrolled for all admin/manager/inventory_staff accounts",
              "Developer + Staff",
              "☐",
            ],
            [
              "Staff Loom training walkthrough recorded: all three views + admin portal",
              "Developer",
              "☐",
            ],
            [
              "Legal jurisdiction review sign-off received (indigenous commerce milestone)",
              "Legal",
              "☐",
            ],
            [
              "Indigenous legal consultation sign-off on all three view jurisdiction disclosures",
              "Legal + Developer",
              "☐",
            ],
            [
              "Backup validation: latest GCS backup verified with document count check",
              "Developer",
              "☐",
            ],
            [
              "Operational Runbook final version committed to /docs/runbook.md in repository",
              "Developer",
              "☐",
            ],
            [
              "E12/E15/E17/E18 features gated behind feature flags for soft rollout post-launch",
              "Developer",
              "☐",
            ],
            [
              "Post-launch monitoring schedule set: daily Sentry + GA4 + Firebase Console for 7 days",
              "Developer",
              "☐",
            ],
          ],
          [5200, 1800, 1360],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 12 — MILESTONES
        // ══════════════════════════════════════════════════════════════════════════════
        h1("12. Milestones"),
        tbl(
          ["Milestone", "Deliverable", "Sprint", "Week", "Gate"],
          [
            [
              "M1 — Pipelines & Codespaces",
              "Firebase dev/prod deployed. Codespaces verified. CI/CD green. Backup scheduled. Runbook v1 drafted.",
              "S1",
              "W2",
              "CI must pass on first commit",
            ],
            [
              "M2 — Three-View Design System",
              "All components in Storybook. Three-view tokens committed. Photography brief + motion spec drafted. WCAG AA verified.",
              "S3",
              "W6",
              "WCAG AA contrast pass on all 3 palettes",
            ],
            [
              "M3 — Auth & MFA",
              "Firebase Auth live. MFA enforced for all staff roles. Session management UI live. Audit log writing.",
              "S4",
              "W8",
              "MFA bypass must be impossible",
            ],
            [
              "M4 — Alpha: Three-View Storefront",
              "All 3 view homepages live on dev with real Firestore data. Age gates active. Prefix search working. Mobile-responsive.",
              "S8",
              "W16",
              "Business owner sign-off on visual design",
            ],
            [
              "M5 — eBay & Cross-Post",
              "Staff can push pawn items to eBay. Status syncs back. Cannabis/fireworks use local-pickup-only correctly.",
              "S9",
              "W18",
              "Sandbox end-to-end test passes",
            ],
            [
              "M6 — Merchandising Live",
              "E13 engine live: staff picks, trending, related items, quick-view, collection pages, Algolia integrated.",
              "S12",
              "W24",
              "Algolia search returns results in < 300ms",
            ],
            [
              "M7 — Beta: Full Feature Set",
              "Pawn form, click-and-collect, seasonal engine (E14), conversion optimization (E17), CRM basics, compliance hardened. UAT complete.",
              "S14",
              "W28",
              "Internal UAT sign-off from business owner + staff",
            ],
            [
              "M8 — AI & Post-Sale",
              "E18 AI assistant live. E16 post-sale operations. E19 editorial CMS with first 5 articles.",
              "S16",
              "W32",
              "AI description generation tested on 10 real items",
            ],
            [
              "M9 — CRM & Retention",
              "E15 CRM dashboard live. E12 alerts, favourites, SMS active. Weekly personalised digest per view running.",
              "S17",
              "W34",
              "autoFollowUp tested with real 48h+ pawn request",
            ],
            [
              "M10 — Staging Sign-Off",
              "Lighthouse ≥90 all views. Rules audited. Playwright suite passing. Sentry connected. Backup verified. Runbook complete.",
              "S18",
              "W36",
              "All Lighthouse gates pass. UAT pre-launch signed off.",
            ],
            [
              "M11 — Production Launch",
              "DNS live. eBay prod keys. Staff trained. Legal sign-off received. GA4 goals live. E12/E15/E17/E18 soft-launched via feature flags.",
              "S19",
              "W38",
              "All launch-day checklist items checked. Legal gate cleared.",
            ],
          ],
          [2000, 3800, 600, 600, 2360],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 13 — SPRINT PLAN
        // ══════════════════════════════════════════════════════════════════════════════
        h1("13. Sprint Plan"),

        h2("Phase 1 — Foundation (Sprints 1–3, Weeks 1–6)"),
        para(
          "Goal: Project runs. Three-view design system committed. Operational Runbook v1 drafted. MFA architecture planned.",
        ),
        tbl(
          ["Sprint", "Story / Task", "Pts", "Epic"],
          [
            [
              "S1 — Repo, Pipeline & Runbook\nWeeks 1–2",
              "GitHub org/repo, branch protection (main/develop/feature/*)",
              "2",
              "E1",
            ],
            [
              "",
              "Scaffold Vite + React 18 + TypeScript with path aliases",
              "3",
              "E1",
            ],
            [
              "",
              "Install Tailwind v4, CSS-first config, @theme block",
              "3",
              "E1",
            ],
            [
              "",
              "devcontainer.json: Node 20, Firebase CLI, Java 17, emulator auto-start, port forwarding",
              "3",
              "E1",
            ],
            [
              "",
              "Verify Codespaces: fresh start → npm ci → emulators → Vite on port 5173",
              "2",
              "E1",
            ],
            [
              "",
              "Firebase dev + prod projects: Firestore, Auth, Storage, Functions, Hosting",
              "5",
              "E1",
            ],
            [
              "",
              "GitHub Actions: CI (lint/typecheck/test), deploy-dev, deploy-prod (manual approval gate)",
              "8",
              "E1",
            ],
            [
              "",
              "Nightly Firestore backup to GCS, 90-day retention, failure alert",
              "3",
              "E1",
            ],
            ["", "ESLint, Prettier, Husky pre-commit hooks", "2", "E1"],
            [
              "",
              "OPERATIONAL RUNBOOK v1: all 9 playbooks (Firebase outage, eBay outage, OpenAI failure, credential compromise, spam attack, MFA reset, Firestore restore, police hold, secret rotation schedule)",
              "5",
              "E1",
            ],
            ["", "Vitest + React Testing Library baseline", "2", "E1"],
            [
              "S2 — Design System: Base & Pawn\nWeeks 3–4",
              "Tailwind v4 base @theme: gold/black palette, fonts, spacing, radius",
              "3",
              "E2",
            ],
            [
              "",
              "Google Fonts: Playfair Display, IM Fell English, Cormorant Garamond, DM Sans, Bebas Neue, Oswald",
              "2",
              "E2",
            ],
            [
              "",
              "Core components (pawn view): Button, Badge, Card, Modal, Input, Select, Textarea, Table, Divider",
              "12",
              "E2",
            ],
            [
              "",
              "PWA: vite-plugin-pwa, manifest.json, Workbox service worker with inventory cache strategy",
              "3",
              "E2",
            ],
            [
              "",
              "Storybook: story per component, dark canvas, all variant states",
              "3",
              "E2",
            ],
            [
              "",
              "MOTION DESIGN SPEC: animation timing, hover physics, loading skeletons, page choreography per view",
              "5",
              "E2",
            ],
            [
              "",
              "PHOTOGRAPHY BRIEF v1: per-view standards, lighting rules, aspect ratios, art direction brief for designer",
              "3",
              "E2",
            ],
            [
              "S3 — Design System: Cannabis & Fireworks\nWeeks 5–6",
              "Cannabis: .view-cannabis token overrides — purple/lavender, Cormorant Garamond/DM Sans",
              "5",
              "E2",
            ],
            [
              "",
              "Cannabis: component variants — dark luxury product card, cinematic hero, mood collection card",
              "8",
              "E2",
            ],
            [
              "",
              "Fireworks: .view-fireworks token overrides — red/amber, Bebas Neue/Oswald",
              "5",
              "E2",
            ],
            [
              "",
              "Fireworks: component variants — countdown timer component, bundle card, urgency badge",
              "8",
              "E2",
            ],
            [
              "",
              "ViewContext provider: URL-prefix-based view detection, CSS class injection on root element",
              "5",
              "E2",
            ],
            [
              "",
              "WCAG AA contrast audit on all three view palettes; failures block Storybook merge",
              "3",
              "E2",
            ],
          ],
          [1800, 4620, 600, 840],
        ),

        spacer(120),
        h2("Phase 2 — Core Product (Sprints 4–8, Weeks 7–16)"),
        para(
          "Goal: Auth with MFA. Inventory system with three-view schema. All three view storefronts live on dev.",
        ),
        tbl(
          ["Sprint", "Story / Task", "Pts", "Epic"],
          [
            [
              "S4 — Auth, Roles & MFA\nWeeks 7–8",
              "Firebase Auth: email/password + Google SSO",
              "3",
              "E3",
            ],
            [
              "",
              "Role system: admin, manager, inventory_staff, marketing_staff, customer — custom claims via Admin SDK",
              "3",
              "E3",
            ],
            [
              "",
              "MFA ENFORCEMENT: TOTP/SMS MFA mandatory for admin/manager/inventory_staff. First-login setup flow. Bypass blocks protected routes.",
              "8",
              "E3",
            ],
            [
              "",
              "Session management UI: admin views active sessions per user, can revoke individual sessions",
              "5",
              "E3",
            ],
            [
              "",
              'Suspicious login alerts: new IP/device triggers email to user with "Was this you?" link',
              "5",
              "E3",
            ],
            [
              "",
              "AuthContext + useAuth hook, ProtectedRoute, RoleGate, Login page, Password reset",
              "10",
              "E3",
            ],
            [
              "S5 — Inventory Schema & Admin CRUD\nWeeks 9–10",
              "Firestore schema v3: all v2.1 fields + viewTag, viewTags, locationId, isSeasonalItem, seasonalEvent, bundleIds, isFeatured, merchandisingTags, videoUrl, aiDescription, aiPriceSuggestion",
              "8",
              "E4",
            ],
            [
              "",
              "Add Item form: all fields including viewTag selector",
              "5",
              "E4",
            ],
            [
              "",
              "Intake workflow: sourceType, serial number, testing checklist, authNotes",
              "5",
              "E4",
            ],
            [
              "",
              "Image upload: multi-image, Cloud Storage, per-view watermark applied by onImageUpload Cloud Function",
              "5",
              "E4",
            ],
            [
              "",
              "Hold system: reserved/hold expiry/holdExpiry Cloud Function (30min schedule)",
              "5",
              "E4",
            ],
            [
              "",
              "Audit log: every staff create/edit/archive/price-change/hold writes to auditLogs/{id} within 2s",
              "5",
              "E4",
            ],
            [
              "",
              "searchTokens: normalise title + tags + viewTag into lowercase prefix tokens on create/update",
              "3",
              "E4",
            ],
            [
              "",
              "MULTI-LOCATION FIELDS: locationId, inventoryLocation, pickupLocation, staffLocation added (future-proofed)",
              "2",
              "E4",
            ],
            [
              "",
              "Barcode/QR label generation; stored in Storage at labels/{itemId}.png",
              "3",
              "E4",
            ],
            [
              "",
              "Firestore composite indexes per view: viewTag + status + createdAt",
              "3",
              "E4",
            ],
            [
              "S6 — Pawn View Storefront\nWeeks 11–12",
              "Pawn homepage: art-deco hero, trust badge strip, Find of the Day, featured grid, brand narrative callout, services strip",
              "10",
              "E5",
            ],
            [
              "",
              "Pawn shop page: inventory grid, category filter pills, prefix search, sort (newest/price asc/desc)",
              "8",
              "E5",
            ],
            [
              "",
              "Pawn item detail: image gallery, condition, pricing, enquire CTA, hold status badge",
              "5",
              "E5",
            ],
            [
              '"Recently sold" social proof strip on pawn homepage',
              "",
              "3",
              "E5",
            ],
            ["", "Google Review CTA after enquiry confirmation", "2", "E5"],
            [
              "",
              "schema.org LocalBusiness JSON-LD, React Helmet Async per-view SEO meta (title/description/OG)",
              "3",
              "E5",
            ],
            [
              "",
              "GA4 tracking: per-view page_view, item_view, CTA_click, age_gate_confirm events",
              "3",
              "E5",
            ],
            [
              "S7 — Cannabis View Storefront\nWeeks 13–14",
              "Cannabis homepage: cinematic hero, mood collection cards, lifestyle editorial strip, wellness brand narrative",
              "10",
              "E5",
            ],
            [
              "",
              "Cannabis shop page: large-image grid, mood filter, prefix search",
              "8",
              "E5",
            ],
            [
              "",
              "Cannabis item detail: luxury product presentation, macro image gallery, hover reveal animation",
              "5",
              "E5",
            ],
            [
              "",
              "Cannabis age gate: 19+ full-screen modal, sessionStorage, consent logging (IP/timestamp/version/viewTag)",
              "8",
              "E11",
            ],
            [
              "",
              "Cannabis /legal/cannabis disclaimer page; jurisdiction notice on category pages",
              "3",
              "E11",
            ],
            [
              "",
              "Per-view sitemap.xml generation on build (vite-plugin-sitemap)",
              "2",
              "E5",
            ],
            [
              "S8 — Fireworks View Storefront\nWeeks 15–16",
              "Fireworks homepage: countdown timer hero, event category nav, bundle showcase, urgency strip",
              "10",
              "E5",
            ],
            [
              "",
              'Fireworks shop page: event-filtered grid, bundle cards, "limited inventory" badges',
              "8",
              "E5",
            ],
            [
              "",
              "Fireworks item detail: urgency copy, pickup scheduling CTA, bundle upsell module",
              "5",
              "E5",
            ],
            [
              "",
              "Fireworks age gate: 19+ modal, consent logging to Firestore",
              "5",
              "E11",
            ],
            [
              "",
              "Fireworks /legal/fireworks page: Transportation of Dangerous Goods Act notice; Ontario/Quebec notices",
              "3",
              "E11",
            ],
            [
              "",
              "Countdown timer component: event-driven, auto-updates from config/campaigns Firestore doc",
              "5",
              "E14",
            ],
            [
              "",
              "Mobile-responsive audit: all three views at 375px, 768px, 1280px viewports",
              "5",
              "E5",
            ],
          ],
          [1800, 4620, 600, 840],
        ),

        spacer(120),
        h2(
          "Phase 3 — Listing Engine, Operations & Merchandising (Sprints 9–13, Weeks 17–26)",
        ),
        para(
          "Goal: eBay live. Pawn system operational. Merchandising engine and Algolia live. Attribution tracking active.",
        ),
        tbl(
          ["Sprint", "Story / Task", "Pts", "Epic"],
          [
            [
              "S9 — Cross-Platform Listing\nWeeks 17–18",
              "eBay: OAuth consent flow, condition mapping, ebayListItem Cloud Function (pawn items only)",
              "15",
              "E6",
            ],
            [
              "",
              "eBay: ebayPublishOffer, ebaySyncStatus (4h schedule), ebayRefreshToken (daily)",
              "13",
              "E6",
            ],
            [
              "",
              "Admin UI: per-item eBay toggle, listing dashboard with status + link + view count",
              "5",
              "E6",
            ],
            [
              "",
              "Kijiji: draft text generation; Facebook: deep-link URL workflow",
              "5",
              "E6",
            ],
            [
              "",
              "Cross-post dashboard: all items with per-platform status chips; bulk eBay post (500ms delay)",
              "5",
              "E6",
            ],
            [
              "",
              "Cannabis/fireworks eBay listings: auto-apply local-pickup-only shipping policy",
              "3",
              "E6",
            ],
            [
              "S10 — Pawn System & Operations\nWeeks 19–20",
              "Multi-step pawn form: item details, condition, contact method, serial number, anonymous option",
              "10",
              "E7",
            ],
            [
              "",
              "Admin pawn inbox: status updates, police hold toggle, reply workflow (email/WhatsApp deep link)",
              "8",
              "E7",
            ],
            [
              "",
              "Inventory hold/reservation system + holdExpiry Cloud Function (30min schedule)",
              "8",
              "E10",
            ],
            [
              "",
              "Audit log viewer (/admin/audit): searchable by actor/action/date; before/after snapshots",
              "5",
              "E10",
            ],
            [
              "",
              "Serial number blacklist: flag, check on intake, staff alert on match",
              "5",
              "E10",
            ],
            [
              "",
              "Feature flag system: config/featureFlags Firestore doc + useFeatureFlag(key) hook",
              "3",
              "E10",
            ],
            [
              "",
              "UTM ATTRIBUTION: UTM params captured on all landing pages, stored in Firestore per session, linked to conversions. Per-view attribution dashboard.",
              "8",
              "E10",
            ],
            [
              "S11 — Merchandising Part 1\nWeeks 21–22",
              "Staff picks: admin UI to curate featured items with note/quote; rendered on view homepages",
              "5",
              "E13",
            ],
            [
              "",
              'Trending: calculateTrendingScore Cloud Function (daily); "Trending Now" module on all view homepages',
              "5",
              "E13",
            ],
            [
              "",
              "Related items: item detail shows 4 items from same category/viewTag",
              "5",
              "E13",
            ],
            [
              "",
              "Recently viewed: localStorage, shown on homepage and shop, persists across refreshes",
              "3",
              "E13",
            ],
            [
              '"Just arrived" automation: items created in last 48h auto-tagged with new-drop merchandisingTag',
              "",
              "3",
              "E13",
            ],
            [
              '"Rare find" tagging: staff marks item rare; badge on card and detail',
              "",
              "2",
              "E13",
            ],
            [
              "",
              "Collection pages: admin creates named collections; shown in per-view navigation",
              "8",
              "E13",
            ],
            [
              "",
              "Bundle recommendations: fireworks view — bundle cards with suggested add-ons",
              "5",
              "E13",
            ],
            [
              "S12 — Merchandising Part 2 & Algolia\nWeeks 23–24",
              "Quick-view modal: hover card reveals image, price, condition, enquire button; Escape key closes",
              "5",
              "E13",
            ],
            [
              "",
              "Visual category cards: image-led navigation on cannabis/fireworks views (replaces text filter pills)",
              "5",
              "E13",
            ],
            [
              "",
              "Infinite scroll / load-more on all view shop pages",
              "3",
              "E13",
            ],
            [
              "",
              "Masonry discovery section on pawn homepage (Sandra impulse browsing)",
              "3",
              "E13",
            ],
            [
              "",
              "Vertical video support: videoUrl on item detail pages (cannabis/fireworks priority)",
              "5",
              "E13",
            ],
            [
              "",
              "ALGOLIA: replace Firestore prefix search. Typo-tolerance, fuzzy, synonyms, weighted relevance, per-view faceting, admin index management.",
              "15",
              "E13",
            ],
            [
              "S13 — Analytics & Attribution\nWeeks 25–26",
              "Admin analytics dashboard: per-view sales velocity, aging (30/60/90 days), most viewed, top categories",
              "8",
              "E10",
            ],
            [
              "",
              "Per-view pawn conversion funnel: enquiries → quoted → completed → drop-off rates",
              "3",
              "E10",
            ],
            [
              "",
              "Inventory profitability: gross margin per item, category profitability, time-to-sale by category",
              "5",
              "E10",
            ],
            [
              "",
              "Campaign attribution: Facebook / eBay / Instagram / Google Maps / TikTok source per conversion",
              "5",
              "E10",
            ],
            [
              "",
              "Customer acquisition cost tracking per view and per channel",
              "3",
              "E10",
            ],
            [
              "",
              "Revenue intelligence: eBay conversion vs in-store, category ROI",
              "5",
              "E10",
            ],
          ],
          [1800, 4620, 600, 840],
        ),

        spacer(120),
        h2(
          "Phase 4 — Community, Compliance & Conversion (Sprints 14–16, Weeks 27–32)",
        ),
        para(
          "Goal: Conversion optimization live. Seasonal engine active. Compliance fully hardened. Community features complete.",
        ),
        tbl(
          ["Sprint", "Story / Task", "Pts", "Epic"],
          [
            [
              "S14 — Conversion Optimization\nWeeks 27–28",
              "E17: Social proof widgets — transaction counters, years in business, trust stats on all view homepages",
              "5",
              "E17",
            ],
            [
              "",
              'E17: Live activity feed — "Someone just enquired about a guitar" (rate-limited, privacy-safe; no PII)',
              "5",
              "E17",
            ],
            [
              "",
              "E17: Testimonials module — staff-curated customer quotes on pawn homepage",
              "3",
              "E17",
            ],
            [
              "",
              'E17: Urgency modules — low stock alerts, "X people viewed today," hold countdown on item cards',
              "5",
              "E17",
            ],
            [
              "",
              'E17: Scarcity indicators — limited edition flag, "only 1 left" badge on fireworks bundles',
              "3",
              "E17",
            ],
            [
              "",
              "E17: A/B EXPERIMENT FRAMEWORK — Firebase Remote Config; CTA/hero testing per view; GA4 experiment event tagging",
              "10",
              "E17",
            ],
            [
              "",
              "E17: Recent activity feed on pawn and cannabis homepages",
              "3",
              "E17",
            ],
            [
              "S15 — Seasonal Commerce Engine\nWeeks 29–30",
              "E14: Campaign scheduler admin UI: name, dates, viewTag, featured items — no code deploy required",
              "8",
              "E14",
            ],
            [
              "",
              "E14: Homepage takeover: config/campaigns doc drives CSS class + content swap (fireworks view, <60s)",
              "8",
              "E14",
            ],
            [
              "",
              "E14: Holiday templates: Canada Day, Diwali, New Year, Summer BBQ — Firestore config sets",
              "5",
              "E14",
            ],
            [
              "",
              "E14: Category boosts: seasonal items auto-float to top of fireworks shop grid during campaign",
              "3",
              "E14",
            ],
            [
              "",
              "E14: Event inquiry forms: large-event and commercial fireworks bulk inquiry workflow",
              "5",
              "E14",
            ],
            [
              "",
              "E14: Pickup surge workflows: high-volume slot management for holiday pickup periods",
              "5",
              "E14",
            ],
            [
              "",
              "E8: Click-and-collect full workflow: reserve → staff notification → pickup window → confirmation email/SMS",
              "5",
              "E8",
            ],
            [
              "S16 — Community, Compliance & Pre-Launch\nWeeks 31–32",
              "E8: Facebook Messenger plugin, WhatsApp button, Google Maps embed, Instagram feed (3 posts)",
              "9",
              "E8",
            ],
            [
              "",
              "E8: Newsletter CASL double opt-in; seasonal reminder email campaigns via SendGrid",
              "5",
              "E8",
            ],
            [
              "",
              "E8: Reseller registration form + Cloud Function auto-reply + staff lead notification",
              "3",
              "E8",
            ],
            [
              "",
              "E11: ACCESSIBILITY COMPLIANCE PROGRAM — /accessibility page, remediation process, keyboard audit, NVDA/VoiceOver QA, axe-core in CI",
              "8",
              "E11",
            ],
            [
              "",
              "E11: CONSENT LOGGING — IP, timestamp, policy version, re-consent on policy update for all three view age gates",
              "5",
              "E11",
            ],
            [
              "",
              "E11: INDIGENOUS LEGAL CONSULTATION MILESTONE — jurisdiction review checklist reviewed with counsel; all copy approved",
              "3",
              "E11",
            ],
            [
              "",
              "E9: hCaptcha all public forms (server-side verify), honeypot fields, IP rate-limit (5/hour)",
              "5",
              "E9",
            ],
            [
              "",
              "E9: WebP + AVIF pipeline, lazy loading, Firebase App Check (reCAPTCHA Enterprise), CSP headers, CORS",
              "10",
              "E9",
            ],
            [
              "",
              "E9: Sentry, Lighthouse CI (≥90 gates), Playwright E2E full smoke test suite on all three views",
              "8",
              "E9",
            ],
            [
              "",
              "E9: PIPEDA purgeExpiredData Cloud Function (monthly): pawn requests 90d, reseller leads 1yr",
              "5",
              "E11",
            ],
          ],
          [1800, 4620, 600, 840],
        ),

        spacer(120),
        h2(
          "Phase 5 — AI, CRM, Post-Sale & Editorial (Sprints 17–19, Weeks 33–38)",
        ),
        para(
          "Goal: AI assistant live. CRM operational. Post-sale workflows complete. Editorial CMS launched. Production launch.",
        ),
        tbl(
          ["Sprint", "Story / Task", "Pts", "Epic"],
          [
            [
              "S17 — AI Assistant & Post-Sale\nWeeks 33–34",
              "E18: AI description generation — generateAIDescription callable; OpenAI GPT-4o; staff reviews before publish",
              "8",
              "E18",
            ],
            [
              "",
              "E18: eBay title optimization — AI suggests SEO title based on item + comps",
              "5",
              "E18",
            ],
            [
              "",
              "E18: Auto-tagging — minimum 3 tag suggestions; staff accept/reject/modify each",
              "5",
              "E18",
            ],
            [
              "",
              "E18: Category recommendation — AI suggests viewTag and category from description",
              "3",
              "E18",
            ],
            [
              "",
              "E18: Price suggestion — suggestItemPrice callable; eBay sold comps; returns price range; 30s timeout with fallback",
              "8",
              "E18",
            ],
            [
              "",
              "E18: Duplicate detection — detectDuplicateItem Firestore trigger; Algolia near-match; admin notification",
              "3",
              "E18",
            ],
            [
              "",
              "E16: Return/dispute tickets: create ticket linked to item/pawnRequest; statuses open/pending/resolved",
              "5",
              "E16",
            ],
            [
              "",
              "E16: Dispute tracking, refund log, shipping claim, customer issue logging, staff resolution notes",
              "10",
              "E16",
            ],
            [
              "",
              "E16: eBay dispute workflow: eBay dispute maps to return ticket; opens eBay case via API if applicable",
              "5",
              "E16",
            ],
            [
              "S18 — CRM & Customer Intelligence\nWeeks 35–36",
              "E15: Customer profiles — customers/{uid} with purchaseHistory, inquiryHistory, lifetimeValue, first/last seen",
              "8",
              "E15",
            ],
            [
              "",
              "E15: Segmentation — filter by total spend, category preference, viewTag preference, recency",
              "8",
              "E15",
            ],
            [
              "",
              "E15: VIP flag + reseller tiers (bronze/silver/gold) — visible in pawn inbox when flagged customer submits",
              "5",
              "E15",
            ],
            [
              "",
              "E15: Automated follow-ups — 48h pending → staff reminder; 72h quoted no response → customer gentle follow-up",
              "8",
              "E15",
            ],
            [
              "",
              "E15: Engagement scoring — weighted: enquiries, purchases, newsletter opens, return visits",
              "5",
              "E15",
            ],
            [
              "",
              "E15: CRM dashboard (/admin/crm): customer list, search, segment filter, VIP flag, notes, contact history",
              "8",
              "E15",
            ],
            [
              "",
              "E15: Abandoned inquiry follow-up — session-only tracking; no PII until form submitted",
              "5",
              "E15",
            ],
            [
              "S19 — Retention, Editorial & Launch\nWeeks 37–38",
              "E12: Favourites/wishlist, saved searches, category watchlist, notification centre, RSS feed",
              "23",
              "E12",
            ],
            [
              "",
              "E12: SMS alerts (Twilio), seasonal reminders, pickup confirmation workflow",
              "15",
              "E12",
            ],
            [
              "",
              "E12: Feature flag rollout: enable E12/E15/E17/E18 progressively; monitor Sentry before full enable",
              "3",
              "E12",
            ],
            [
              "",
              "E19: EDITORIAL CMS — blog/article admin UI; Firestore articles/{id}; public /blog with per-view editorial sections",
              "10",
              "E19",
            ],
            [
              "",
              "E19: BRAND NARRATIVE — About page, founder story, Akwesasne identity, community story published at launch",
              "5",
              "E19",
            ],
            [
              "",
              'E19: Buying guides — "How to Pawn," "Fireworks Safety," "Cannabis Wellness 101" — published at launch',
              "5",
              "E19",
            ],
            [
              "",
              "E19: Local SEO landing pages: /pawn/electronics, /fireworks/canada-day, /cannabis/wellness + 3 more",
              "5",
              "E19",
            ],
            [
              "",
              "E19: FAQ engine: staff-managed FAQ per view; shown on homepage and item detail",
              "3",
              "E19",
            ],
            [
              "",
              "Production launch: DNS, eBay prod keys, SendGrid verified, staff trained on all 3 views",
              "5",
              "E1",
            ],
            [
              "",
              "Staff training: Loom per view + admin portal; written guide covering all 3 storefronts, CRM, AI assistant",
              "8",
              "E1",
            ],
            [
              "",
              "GA4: per-view conversion goals, attribution dashboard, CRM analytics live",
              "3",
              "E10",
            ],
            [
              "",
              "Final Lighthouse + Playwright run on all views. 7-day post-launch stabilisation window.",
              "5",
              "E9",
            ],
          ],
          [1800, 4620, 600, 840],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 14 — POST-LAUNCH BACKLOG
        // ══════════════════════════════════════════════════════════════════════════════
        h1("14. Post-Launch Backlog"),

        h2("Phase 6 — E-Commerce (8–10 weeks post-launch)"),
        bullet(
          "Shopping cart + Stripe checkout: item reservation on add-to-cart (15-minute Firestore transaction hold). Order confirmation email per view.",
        ),
        bullet(
          "Pawn loan tracking portal: customer view of outstanding loans, due dates, reclaim amounts, SMS reminders.",
        ),
        bullet(
          "Cannabis online checkout: age-verified purchase flow — pending legal consultation outcome.",
        ),
        bullet(
          "Online auctions: eBay-style bidding on select pawn items (24–72h windows).",
        ),
        bullet(
          "Pricing intelligence dashboard: eBay sold comps lookup during intake — extends E18 AI price suggestion.",
        ),

        spacer(80),
        h2("Phase 7 — Multilingual (10–14 weeks post-launch)"),
        bullet(
          "French/English toggle: i18next, per-view locale files, URL-based locale (/fr/...). Priority for Tanya and Makoonsii personas.",
        ),
        bullet(
          "Mohawk language support: key community-facing phrases in Kanien'kéha. Community review before publishing.",
        ),
        bullet("WCAG AA third-party accessibility audit."),

        spacer(80),
        h2("Phase 8 — Mobile App (6+ months post-launch)"),
        bullet(
          "React Native (Expo): shared business logic with web. Staff app for barcode scanning and inventory intake via phone camera.",
        ),
        bullet(
          "Customer app: per-view browse, favourites, category alerts, push notifications.",
        ),
        bullet(
          "TikTok/Reels: staff posts short-form product videos from app; auto-embedded in item detail vertical video player.",
        ),

        spacer(80),
        h2("Phase 9 — Live Shopping & Community (12+ months post-launch)"),
        bullet(
          "Facebook Live + Instagram Live: featured items during stream link to live shop.",
        ),
        bullet(
          "Loyalty/gamification: points per purchase, referral rewards, seasonal challenges.",
        ),
        bullet(
          "Multi-location support: activate locationId fields if second store opens. Schema is already future-proofed.",
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // SECTION 15 — READINESS SCORES
        // ══════════════════════════════════════════════════════════════════════════════
        h1("15. Readiness Scores"),
        tbl(
          ["Dimension", "v2.1", "v3.0", "v4.0", "Key Drivers — v4.0"],
          [
            [
              "Technical Architecture",
              "9/10",
              "9.5/10",
              "9.5/10",
              "Architecture diagram deliverables added; env var reference complete",
            ],
            [
              "Operational Maturity",
              "9.5/10",
              "9.5/10",
              "9.5/10",
              "Runbook now has 9 explicit playbooks; launch-day checklist formalized",
            ],
            [
              "Compliance Readiness",
              "8.5/10",
              "9/10",
              "9.5/10",
              "Legal consultation as hard gate; consent log 7-year retention; accessibility SLA",
            ],
            [
              "Commerce Readiness",
              "7.5/10",
              "9/10",
              "9/10",
              "Maintained; acceptance criteria make delivery measurable",
            ],
            [
              "Lifestyle Brand Readiness",
              "6/10",
              "8.5/10",
              "8.5/10",
              "Maintained; CRM journeys now make brand strategy actionable",
            ],
            [
              "Conversion Optimization",
              "6.5/10",
              "8.5/10",
              "8.5/10",
              "Maintained; A/B framework acceptance criteria added",
            ],
            [
              "AI & Automation",
              "4/10",
              "8/10",
              "8/10",
              "Maintained; fallback and mandatory-review criteria added",
            ],
            [
              "Customer Intelligence",
              "5/10",
              "8.5/10",
              "8.5/10",
              "Maintained; three concrete CRM journey examples added",
            ],
            [
              "Documentation Maturity",
              "6/10",
              "7/10",
              "9.5/10",
              "TOC, document control, QA strategy, acceptance criteria, release management, runbook detail, glossary, env var reference",
            ],
            ["Long-Term Scalability", "8/10", "9.5/10", "9.5/10", "Maintained"],
            [
              "Overall",
              "7.8/10",
              "9/10",
              "9.5/10",
              "Documentation maturity closes the final enterprise-grade gap",
            ],
          ],
          [2400, 900, 900, 900, 4260],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // APPENDIX A — FIRESTORE COLLECTIONS
        // ══════════════════════════════════════════════════════════════════════════════
        h1("Appendix A — Firestore Collections Reference"),
        tbl(
          ["Collection", "Purpose", "Retention", "Security"],
          [
            [
              "items/{id}",
              "Unified inventory. viewTag routes to view. Real-time listener powers shop + admin.",
              "Indefinite",
              "Staff write; public read on status=active only",
            ],
            [
              "items/{id}/listingEvents",
              "One doc per platform action (eBay/Kijiji/Facebook) with timestamp and outcome.",
              "Indefinite",
              "Staff read; Cloud Functions write only",
            ],
            [
              "users/{uid}",
              "User profile + role + MFA status.",
              "Until account delete",
              "Owner read; admin read all; Cloud Functions write",
            ],
            [
              "users/{uid}/favourites",
              "Customer saved item IDs.",
              "Until removed",
              "Owner read/write",
            ],
            [
              "users/{uid}/notifications",
              "In-app notifications for alerts, holds, campaigns.",
              "Until dismissed",
              "Owner read/write",
            ],
            [
              "customers/{uid}",
              "E15 CRM: purchaseHistory, inquiryHistory, lifetimeValue, segment, vipFlag, resellerTier, engagementScore.",
              "Indefinite",
              "Manager read; Cloud Functions write",
            ],
            [
              "pawnRequests/{id}",
              "Pawn/sell enquiry submissions. status: pending/quoted/completed/declined.",
              "90 days (auto-purge)",
              "Public create; staff read/update",
            ],
            [
              "returnTickets/{id}",
              "E16: Post-sale return/dispute tickets. itemId, status, refundLog, shippingClaim, staffNotes.",
              "2 years",
              "Staff read/write; Cloud Functions write",
            ],
            [
              "resellerLeads/{id}",
              "Reseller registration submissions.",
              "1 year (auto-purge)",
              "Public create; staff read",
            ],
            [
              "auditLogs/{id}",
              "Staff action audit trail. Immutable. One doc per action with before/after snapshot.",
              "2 years",
              "Manager read; Admin SDK write only",
            ],
            [
              "serialBlacklist/{id}",
              "Flagged serial numbers (stolen goods). staffNote, flaggedAt, flaggedBy.",
              "Indefinite",
              "Staff read; manager write",
            ],
            [
              "savedSearches/{id}",
              "Customer saved searches and category subscriptions.",
              "Until deleted",
              "Owner read/write",
            ],
            [
              "consentLogs/{id}",
              "Age gate consent records. IP, timestamp, policy version, viewTag.",
              "7 years",
              "Create-only; Admin SDK query",
            ],
            [
              "articles/{id}",
              "E19: Editorial content. title, body, viewTag, slug, seoMeta, publishedAt.",
              "Indefinite",
              "Public read (published only); staff write",
            ],
            [
              "config/campaigns",
              "E14: Seasonal campaign configs. name, viewTag, startDate, endDate, heroMode, featuredItemIds, categoryBoosts.",
              "Indefinite",
              "Staff read; admin write",
            ],
            [
              "config/collections",
              "E13: Staff-curated item collections. name, viewTag, itemIds, displayOrder.",
              "Indefinite",
              "Staff read; admin write",
            ],
            [
              "config/featureFlags",
              "Feature flag key-value store. useFeatureFlag(key) hook reads on app init.",
              "Indefinite",
              "Staff read; admin write",
            ],
            [
              "config/banners",
              "Seasonal banner messages with showFrom/showUntil.",
              "Indefinite",
              "Staff read; admin write",
            ],
            [
              "config/crossPostSettings",
              "eBay default shipping, return, payment policy IDs.",
              "Indefinite",
              "Staff read; admin write",
            ],
            [
              "stats/inventory",
              "Aggregated counters per view: totalActive, byCategory, totalViews.",
              "Indefinite",
              "Public read; Cloud Functions write",
            ],
          ],
          [2000, 3800, 1400, 2160],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // APPENDIX B — ENV VARS (already in section 2.4 — cross-reference note)
        // ══════════════════════════════════════════════════════════════════════════════
        h1("Appendix B — Tooling & Accounts Checklist"),
        tbl(
          ["Service", "Requirements"],
          [
            [
              "GitHub",
              "Organisation + repository. Branch protection on main and develop. Actions enabled. production Environment with manual approval. Codespaces enabled with 4-core prebuilds.",
            ],
            [
              "Firebase (dev)",
              "Blaze plan (required for Cloud Functions + external calls). All services initialised: Firestore, Auth, Storage, Functions, Hosting. Budget alert at $25.",
            ],
            [
              "Firebase (prod)",
              "Separate billing account recommended. Budget alerts at $25, $100, $500. Separate service account with least-privilege IAM.",
            ],
            [
              "GCS Backup Bucket",
              "gs://islandgold-backups. Lifecycle policy: delete objects > 90 days. Private; only Firebase service account has write access.",
            ],
            [
              "eBay Developer",
              "Sandbox keys for Sprint 9. Production app submitted for review no later than Sprint 8 end (3–5 business day approval window).",
            ],
            [
              "SendGrid",
              "Sending domain authenticated (DKIM/DMARC). API key in Firebase Secret Manager. Transactional templates per view.",
            ],
            [
              "Algolia",
              "Account created. App ID + search-only key (public) + admin key (Secret Manager). Single index with viewTag facet.",
            ],
            [
              "OpenAI",
              "API key in Firebase Secret Manager. GPT-4o model access confirmed. Usage limits set.",
            ],
            [
              "Google Analytics 4",
              "Property created and linked to Firebase. Measurement ID in environment variables. Per-view conversion events configured.",
            ],
            [
              "Sentry",
              "Project created. DSN in VITE_SENTRY_DSN. Auth token in SENTRY_AUTH_TOKEN GitHub secret. Source maps upload configured in CI.",
            ],
            [
              "Twilio",
              "Account created (Phase 5). Phone number acquired. Auth token in Firebase Secret Manager.",
            ],
            [
              "Custom Domain",
              "Domain registered. A/AAAA records pointing to Firebase Hosting. SSL auto-provisioned by Firebase.",
            ],
            [
              "Mailchimp/Buttondown",
              "API key in Firebase Secret Manager. CASL double opt-in configured. Per-view subscriber lists (pawn/cannabis/fireworks).",
            ],
            [
              "Facebook Business",
              "Page verified. Messenger Chat Plugin App ID. Instagram Basic Display API app for feed embed.",
            ],
            [
              "WhatsApp Business",
              "Business account. Click-to-chat link: https://wa.me/1XXXXXXXXXX",
            ],
            [
              "Google Business",
              "Profile verified for Cornwall Island. Powers Maps embed and local search ranking.",
            ],
            [
              "hCaptcha",
              "Site key as VITE_HCAPTCHA_SITE_KEY (public). Secret key in Firebase Secret Manager for server-side verification.",
            ],
          ],
          [1800, 7560],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // APPENDIX C — RISKS
        // ══════════════════════════════════════════════════════════════════════════════
        h1("Appendix C — Risk Register"),
        tbl(
          ["Risk", "Probability", "Impact", "Mitigation"],
          [
            [
              "Three-view CSS token system causes cross-browser rendering bugs",
              "Medium",
              "Medium",
              "Playwright cross-browser suite tests all three view CSS classes. Storybook Chromatic visual regression.",
            ],
            [
              "OpenAI API latency degrades AI assistant UX (E18)",
              "Medium",
              "Low",
              "AI is async with loading state. 30s timeout with graceful fallback to manual entry. Disable via feature flag.",
            ],
            [
              "Cannabis/fireworks legal consultation delays launch",
              "Medium",
              "High",
              "Scheduled in S16 (Week 32) — 6-week buffer before launch. Hard gate; launch date adjusts if delayed.",
            ],
            [
              "MFA friction causes staff login issues at launch",
              "Low",
              "Medium",
              "Guided MFA setup flow. Admin MFA reset playbook in runbook. Staff training session covers MFA.",
            ],
            [
              "Seasonal campaign engine requires design capacity beyond plan",
              "Medium",
              "Low",
              "Holiday templates are Firestore config sets — additional campaigns need no code changes after initial build.",
            ],
            [
              "eBay production approval delayed",
              "Medium",
              "Medium",
              "Submit for prod review at S8 end (3–5 business day SLA). Admin UI works without eBay; manual fallback workflow.",
            ],
            [
              "Concurrent in-store + online sale creates inventory conflict",
              "High",
              "High",
              "E10 hold/reservation system resolves this. Staff training explicitly covers hold workflow.",
            ],
            [
              "CASL compliance violation on email marketing",
              "Medium",
              "High",
              "CASL double opt-in on all newsletter forms. Consent timestamps in Firestore. Per-view subscriber lists.",
            ],
            [
              "Per-view Algolia index cost exceeds budget",
              "Low",
              "Low",
              "Single Algolia index with viewTag facet. Free tier handles 10k records/month. Upgrade plan documented.",
            ],
            [
              "Firestore data loss (accidental or malicious)",
              "Low",
              "High",
              "Nightly GCS backup. Monthly integrity validation Cloud Function. Restore playbook in runbook.",
            ],
            [
              "Tailwind v4 breaking changes during build",
              "Low",
              "Low",
              "Pin tailwindcss@4.x in package.json. Subscribe to Tailwind changelog.",
            ],
          ],
          [2600, 1000, 800, 4960],
        ),
        spacer(200),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════════════════
        // APPENDIX D — GLOSSARY
        // ══════════════════════════════════════════════════════════════════════════════
        h1("Appendix D — Glossary"),
        tbl(
          ["Term", "Definition"],
          [
            [
              "Age Gate",
              "A mandatory confirmation screen requiring users to verify they are 19+ before accessing cannabis or fireworks content. Cannot be bypassed.",
            ],
            [
              "Algolia",
              "A hosted search-as-a-service platform. Replaces Firestore prefix token search from Sprint 12. Provides typo-tolerance, fuzzy matching, and faceted filtering.",
            ],
            [
              "Audit Log",
              "An immutable record of every staff action (create/edit/archive/price-change/hold-set). Written by Admin SDK only; staff cannot delete or modify.",
            ],
            [
              "CASL",
              "Canada's Anti-Spam Legislation. Requires explicit consent before sending commercial electronic messages. Double opt-in is CASL best practice.",
            ],
            [
              "Cloud Function",
              "A serverless function deployed on Firebase (Google Cloud Run). Executes server-side logic for eBay API calls, email dispatch, Firestore triggers, and scheduled jobs.",
            ],
            [
              "CRM",
              "Customer Relationship Management. In this plan: an internal Firestore-based system (E15) tracking customer profiles, purchase history, segments, and automated follow-up journeys.",
            ],
            [
              "CSP",
              "Content Security Policy. An HTTP header that restricts which scripts, styles, and media can be loaded — prevents cross-site scripting (XSS) attacks.",
            ],
            [
              "Engagement Score",
              "A weighted numeric score per customer in the CRM. Calculated from enquiries (+10), purchases (+15), newsletter opens (+3), and return visits (+5). Used for segmentation.",
            ],
            [
              "Feature Flag",
              "A boolean toggle stored in Firestore config/featureFlags. Allows features to be enabled or disabled per environment without a code deploy.",
            ],
            [
              "Firestore",
              "Google Firebase's NoSQL cloud database. Real-time listeners power the staff dashboard and shop inventory. Security Rules enforce role-based access.",
            ],
            [
              "Hold System",
              'An inventory reservation mechanism. Item status changes to "reserved" with a holdExpiresAt timestamp. A scheduled Cloud Function resets expired holds to "active" every 30 minutes.',
            ],
            [
              "MFA",
              "Multi-Factor Authentication. Requires a second verification step (TOTP authenticator app or SMS code) in addition to password. Mandatory for all staff roles.",
            ],
            [
              "PIPEDA",
              "Personal Information Protection and Electronic Documents Act. Canada's federal privacy law. Governs how personal data (pawn requests, customer records) is collected, used, and retained.",
            ],
            [
              "Police Hold",
              "A flag (policeHold=true) on an inventory item that suspends it from public view, prevents archiving, and triggers an admin alert. Used when a serial number is flagged by law enforcement.",
            ],
            [
              "PWA",
              "Progressive Web App. A web application that can be installed on a device home screen, works offline (via Workbox service worker), and supports push notifications.",
            ],
            [
              "Serial Blacklist",
              "A Firestore collection (serialBlacklist/{id}) of flagged serial numbers. The pawn intake form and onPawnRequestCreate Cloud Function check submitted serials against this list.",
            ],
            [
              "TOTP",
              "Time-Based One-Time Password. A six-digit code generated by an authenticator app (e.g. Google Authenticator) that refreshes every 30 seconds. Used for MFA.",
            ],
            [
              "UTM Attribution",
              "URL parameters (utm_source, utm_medium, utm_campaign) that identify the origin of a visit. Captured on all landing pages and stored in Firestore per session to track which channels drive conversions.",
            ],
            [
              "ViewContext",
              "A React context provider mounted at the router root. Reads the URL prefix (/pawn, /cannabis, /fireworks) and injects the corresponding CSS class on the root element, activating the correct design token theme.",
            ],
            [
              "viewTag",
              "A Firestore field on every inventory item (pawn | cannabis | fireworks | all) that routes the item to the correct view storefront.",
            ],
            [
              "WCAG AA",
              "Web Content Accessibility Guidelines Level AA. The accessibility standard this platform targets. Requires 4.5:1 contrast ratio for normal text, keyboard navigability, and screen reader compatibility.",
            ],
          ],
          [1800, 7560],
        ),
        spacer(200),

        // ══════════════════════════════════════════════════════════════════════════════
        // END
        // ══════════════════════════════════════════════════════════════════════════════
        divider(),
        new Paragraph({
          spacing: sp(200, 80),
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "◆  IslandGold Pawn & Trade — Website Build Project Plan v4.0  ◆",
              bold: true,
              size: 22,
              font: "Arial",
              color: GOLD,
            }),
          ],
        }),
        new Paragraph({
          spacing: sp(0, 80),
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Pawn Shop · Cannabis Lifestyle · Fireworks & Seasonal",
              size: 20,
              font: "Arial",
              color: "888888",
            }),
          ],
        }),
        new Paragraph({
          spacing: sp(0, 80),
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "© 2025 IslandGold Pawn & Trade, Cornwall Island, Akwesasne",
              size: 18,
              font: "Arial",
              color: "888888",
            }),
          ],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc)
  .then((buf) => {
    fs.writeFileSync(
      "./IslandGold-Project-Plan-v4.0.docx",
      buf,
    );
    console.log("Done. Document saved to the current directory.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });