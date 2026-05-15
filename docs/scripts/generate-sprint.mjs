#!/usr/bin/env node
/**
 * generate-sprint.mjs
 *
 * Queries the GitHub Projects v2 API for the active Sprint iteration and
 * writes docs/ACTIVE_SPRINT.md. Committed automatically by docs-sync.yml
 * with [skip ci] — do not edit ACTIVE_SPRINT.md manually.
 *
 * Usage:
 *   node docs/scripts/generate-sprint.mjs
 *
 * Required env vars:
 *   GITHUB_TOKEN          — token with read:project scope
 *   GITHUB_REPOSITORY     — "owner/repo"
 *
 * Optional env vars:
 *   GITHUB_PROJECT_NUMBER — numeric project number (e.g. 1).
 *                           Required after the GitHub Projects board is created
 *                           in E01. Set as a repository variable:
 *                           Settings → Secrets and variables → Actions → Variables.
 *                           Without this, the script exits 0 with a setup notice.
 */

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT   = join(__dirname, '../..');
const OUTPUT_FILE = join(REPO_ROOT, 'docs/ACTIVE_SPRINT.md');

const TOKEN          = process.env.GITHUB_TOKEN;
const REPO           = process.env.GITHUB_REPOSITORY;
const PROJECT_NUMBER = process.env.GITHUB_PROJECT_NUMBER
  ? parseInt(process.env.GITHUB_PROJECT_NUMBER, 10)
  : null;

// ── GitHub GraphQL helper ─────────────────────────────────────────────────────

async function graphql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join('\n'));
  return json.data;
}

// ── Query: fetch project + iteration + items ──────────────────────────────────

async function fetchProjectData(owner, projectNumber) {
  // Try as organization first, fall back to user
  const query = `
    query($owner: String!, $number: Int!) {
      repositoryOwner(login: $owner) {
        ... on Organization {
          projectV2(number: $number) { ...ProjectFields }
        }
        ... on User {
          projectV2(number: $number) { ...ProjectFields }
        }
      }
    }

    fragment ProjectFields on ProjectV2 {
      title
      url
      fields(first: 30) {
        nodes {
          ... on ProjectV2IterationField {
            id
            name
            configuration {
              iterations {
                id
                title
                startDate
                duration
              }
              completedIterations {
                id
                title
                startDate
                duration
              }
            }
          }
        }
      }
      items(first: 100) {
        nodes {
          id
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldIterationValue {
                iterationId
                title
                field { ... on ProjectV2IterationField { name } }
              }
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field { ... on ProjectV2SingleSelectField { name } }
              }
              ... on ProjectV2ItemFieldTextValue {
                text
                field { ... on ProjectV2Field { name } }
              }
              ... on ProjectV2ItemFieldNumberValue {
                number
                field { ... on ProjectV2Field { name } }
              }
            }
          }
          content {
            ... on Issue {
              number
              title
              state
              url
              labels(first: 10) {
                nodes { name }
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphql(query, { owner, number: projectNumber });
  return data.repositoryOwner?.projectV2 ?? null;
}

// ── Find the active iteration ─────────────────────────────────────────────────

function findActiveIteration(project) {
  const iterationField = project.fields.nodes.find(
    f => f.configuration?.iterations,
  );
  if (!iterationField) return null;

  const today = new Date().toISOString().slice(0, 10);

  // Active = started but not yet ended
  const active = iterationField.configuration.iterations.find(it => {
    const start = it.startDate;
    const end   = addDays(start, it.duration);
    return start <= today && today < end;
  });

  return active ?? null;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'month', month: 'long', day: 'numeric',
  });
}

// ── Filter items for the active iteration ────────────────────────────────────

function getSprintItems(project, activeIteration) {
  return project.items.nodes
    .filter(item => {
      if (!item.content?.number) return false; // skip non-issues (PRs, drafts)
      const iterValue = item.fieldValues.nodes.find(
        fv => fv.iterationId === activeIteration.id,
      );
      return !!iterValue;
    })
    .map(item => {
      const fvs = item.fieldValues.nodes;
      const get = name => fvs.find(fv => fv.field?.name === name);

      return {
        number:      item.content.number,
        title:       item.content.title,
        state:       item.content.state,
        url:         item.content.url,
        labels:      item.content.labels.nodes.map(l => l.name),
        status:      get('Status')?.name ?? 'Todo',
        epic:        get('Epic')?.text  ?? '',
        points:      get('Story Points')?.number ?? null,
        priority:    get('Priority')?.name ?? '',
      };
    })
    .sort((a, b) => {
      // P0 first, then by issue number
      const pa = a.labels.find(l => l.startsWith('priority:')) ?? '';
      const pb = b.labels.find(l => l.startsWith('priority:')) ?? '';
      if (pa !== pb) return pa.localeCompare(pb);
      return a.number - b.number;
    });
}

// ── Render ACTIVE_SPRINT.md ───────────────────────────────────────────────────

function renderSprintDoc(project, iteration, items, now) {
  const startDate = iteration.startDate;
  const endDate   = addDays(startDate, iteration.duration);

  const statusEmoji = { Todo: '⬜', 'In Progress': '🔵', 'In Review': '🟡', Done: '✅', Blocked: '🔴' };

  const p0Blockers    = items.filter(i => i.labels.includes('priority:p0') && i.state !== 'CLOSED' && i.status !== 'Done');
  const complianceItems = items.filter(i => i.labels.includes('type:compliance'));
  const carryover     = items.filter(i => i.state === 'OPEN' && i.status === 'Todo');

  const tableRows = items.map(i => {
    const emoji  = statusEmoji[i.status] ?? '⬜';
    const points = i.points ? `~${i.points}` : '—';
    const epic   = i.epic ? `E${i.epic}` : '—';
    return `| [#${i.number}](${i.url}) | ${i.title.slice(0, 60)} | ${epic} | ${i.priority.toUpperCase() || '—'} | ${points} | ${emoji} ${i.status} |`;
  }).join('\n');

  return `# Active Sprint

> ⚠️ *This file is auto-generated by \`generate-sprint.mjs\`. Do not edit manually.*
> *Last synced: ${now}*

---

**Sprint:** ${iteration.title} | **Dates:** ${startDate} → ${endDate}
**Project:** [${project.title}](${project.url})

---

## Sprint Backlog (${items.length} issues)

| # | Title | Epic | Priority | Points | Status |
|---|---|---|---|---|---|
${tableRows}

---

## P0 Blockers

${p0Blockers.length === 0
  ? '_None currently._'
  : p0Blockers.map(i => `* [#${i.number}](${i.url}) ${i.title}`).join('\n')}

---

## Compliance Items This Sprint

${complianceItems.length === 0
  ? '_None this sprint._'
  : complianceItems.map(i => `* [#${i.number}](${i.url}) ${i.title} \`type:compliance\``).join('\n')}

---

## Open Items (Todo)

${carryover.length === 0
  ? '_All items are in progress or complete._'
  : carryover.map(i => `* [#${i.number}](${i.url}) ${i.title}`).join('\n')}
`;
}

// ── Fallback doc when project isn't configured yet ────────────────────────────

function renderSetupNotice(reason) {
  const now = new Date().toISOString();
  return `# Active Sprint

> ⚠️ *This file is auto-generated by \`generate-sprint.mjs\`. Do not edit manually.*
> *Last synced: ${now}*

---

**Status:** Sprint data unavailable — ${reason}

## Setup Required

To enable auto-generated sprint docs:

1. Create the GitHub Projects board (Epic E01 task)
2. Add a **Sprint** Iteration field to the board
3. Set the \`GITHUB_PROJECT_NUMBER\` repository variable:
   - GitHub → Settings → Secrets and variables → Actions → Variables
   - Name: \`GITHUB_PROJECT_NUMBER\`
   - Value: the numeric project number (visible in the project URL)
4. Assign issues to sprint iterations on the board
5. Re-run the \`Docs ↔ Issues Sync\` workflow (\`workflow_dispatch\`)
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!TOKEN || !REPO) {
    console.error('GITHUB_TOKEN and GITHUB_REPOSITORY must be set.');
    process.exit(1);
  }

  const now   = new Date().toISOString();
  const owner = REPO.split('/')[0];

  console.log('\n── Generate ACTIVE_SPRINT.md ───────────────────────────────\n');

  if (!PROJECT_NUMBER) {
    console.log('ℹ  GITHUB_PROJECT_NUMBER not set — writing setup notice.');
    await writeFile(OUTPUT_FILE, renderSetupNotice('GITHUB_PROJECT_NUMBER not configured'), 'utf8');
    console.log(`   Written → docs/ACTIVE_SPRINT.md`);
    return;
  }

  console.log(`   Owner:   ${owner}`);
  console.log(`   Project: #${PROJECT_NUMBER}`);

  const project = await fetchProjectData(owner, PROJECT_NUMBER);
  if (!project) {
    console.warn(`⚠  Project #${PROJECT_NUMBER} not found for ${owner}.`);
    await writeFile(OUTPUT_FILE, renderSetupNotice(`project #${PROJECT_NUMBER} not found`), 'utf8');
    return;
  }

  const iteration = findActiveIteration(project);
  if (!iteration) {
    console.warn('⚠  No active iteration found in the Sprint field.');
    await writeFile(
      OUTPUT_FILE,
      renderSetupNotice('no active iteration — ensure a Sprint iteration is current on the board'),
      'utf8',
    );
    return;
  }

  console.log(`   Sprint:  ${iteration.title} (${iteration.startDate}, ${iteration.duration} days)`);

  const items = getSprintItems(project, iteration);
  console.log(`   Items:   ${items.length} assigned to this iteration`);

  const content = renderSprintDoc(project, iteration, items, now);
  await writeFile(OUTPUT_FILE, content, 'utf8');

  console.log(`\n✅ docs/ACTIVE_SPRINT.md updated (${items.length} issues)`);
}

main().catch(err => { console.error(err); process.exit(1); });
