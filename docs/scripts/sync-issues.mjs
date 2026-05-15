#!/usr/bin/env node
/**
 * sync-issues.mjs
 *
 * Reads Epic markdown frontmatter and syncs labels, milestones, and project
 * fields on the corresponding GitHub Issues. Runs in two directions:
 *
 *   Docs → Issues  (authoritative): frontmatter drives labels + milestone
 *   Issues → Docs  (status only):   closed issue sets Epic status=implemented
 *
 * Usage:
 *   node docs/scripts/sync-issues.mjs [--dry-run]
 *
 * Required env vars:
 *   GITHUB_TOKEN       — token with issues:write, contents:write scope
 *   GITHUB_REPOSITORY  — "owner/repo"
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = join(__dirname, '../..');
const EPICS_DIR  = join(REPO_ROOT, 'docs/product/epics');
const REPORTS_DIR = join(REPO_ROOT, 'docs/reports/sprint-reviews');

const REPO    = process.env.GITHUB_REPOSITORY;
const TOKEN   = process.env.GITHUB_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

// ── Personas that must exist in PERSONAS.md ──────────────────────────────────

const KNOWN_PERSONAS = new Set([
  'dale', 'marie', 'tanya', 'marcus', 'jordan', 'kevin', 'makoonsii', 'sandra',
]);

// ── Inline YAML frontmatter parser ───────────────────────────────────────────
// Handles the specific frontmatter shape used in this repo:
// scalar strings/booleans/numbers, null values, and flat arrays (- item).

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return null;

  const result  = {};
  let currentKey = null;
  let inArray    = false;

  for (let line of match[1].split('\n')) {
    // Strip inline YAML comments
    line = line.replace(/\s+#.*$/, '');

    // Array element:  "  - value"
    const arrayItem = line.match(/^  - (.+)/);
    if (arrayItem) {
      if (currentKey && inArray) {
        if (!Array.isArray(result[currentKey])) result[currentKey] = [];
        result[currentKey].push(arrayItem[1].trim());
      }
      continue;
    }

    // Empty inline array:  "key: []"
    const emptyArray = line.match(/^(\w+):\s*\[\]\s*$/);
    if (emptyArray) {
      result[emptyArray[1]] = [];
      currentKey = emptyArray[1];
      inArray    = false;
      continue;
    }

    // Key-value pair:  "key: value"
    const kv = line.match(/^(\w+):\s*(.*)/);
    if (kv) {
      currentKey  = kv[1];
      const raw   = kv[2].trim().replace(/^["']|["']$/g, '');

      if (raw === '')            { result[currentKey] = null;             inArray = true;  }
      else if (raw === 'true')   { result[currentKey] = true;             inArray = false; }
      else if (raw === 'false')  { result[currentKey] = false;            inArray = false; }
      else if (/^\d+$/.test(raw)){ result[currentKey] = parseInt(raw, 10);inArray = false; }
      else                       { result[currentKey] = raw;              inArray = false; }
    }
  }

  return result;
}

// ── Load all Epic files ───────────────────────────────────────────────────────

async function loadEpics() {
  const files = (await readdir(EPICS_DIR))
    .filter(f => /^E\d+/.test(f) && f.endsWith('.md'))
    .sort();

  return Promise.all(files.map(async f => {
    const filePath = join(EPICS_DIR, f);
    const raw      = await readFile(filePath, 'utf8');
    const fm       = parseFrontmatter(raw);
    if (!fm) throw new Error(`No frontmatter found in ${f}`);
    return { file: f, path: filePath, raw, fm };
  }));
}

// ── GitHub REST API helper ────────────────────────────────────────────────────

async function ghFetch(path, opts = {}) {
  const url = path.startsWith('https://') ? path : `https://api.github.com${path}`;
  const res  = await fetch(url, {
    ...opts,
    headers: {
      Authorization:        `Bearer ${TOKEN}`,
      'Content-Type':       'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      Accept:               'application/vnd.github+json',
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API ${url}: ${res.status} — ${body.slice(0, 300)}`);
  }
  return res.json();
}

// ── Milestone cache ───────────────────────────────────────────────────────────

let _milestonesCache = null;

async function getMilestones() {
  if (_milestonesCache) return _milestonesCache;
  const data        = await ghFetch(`/repos/${REPO}/milestones?state=all&per_page=100`);
  _milestonesCache  = Object.fromEntries(data.map(m => [m.title, m.number]));
  return _milestonesCache;
}

// ── Derive expected labels from Epic frontmatter ──────────────────────────────

function epicToLabels(fm) {
  const labels = new Set(['type:feature']);

  if (fm.priority)               labels.add(`priority:${fm.priority.toLowerCase()}`);
  if (Array.isArray(fm.views))   fm.views.forEach(v => labels.add(`view:${v}`));
  if (Array.isArray(fm.personas))fm.personas.forEach(p => labels.add(`persona:${p}`));
  if (fm.compliance_review === 'required') labels.add('type:compliance');
  if (fm.schema_impact === true) labels.add('area:schema');

  return [...labels];
}

// ── Drift detection ───────────────────────────────────────────────────────────

const MANAGED_PREFIXES = ['priority:', 'view:', 'persona:', 'type:', 'area:'];

async function detectDrift(epic, liveIssue) {
  const drift         = [];
  const expectedLabels = new Set(epicToLabels(epic.fm));
  const liveLabels    = new Set(liveIssue.labels.map(l => l.name));

  // Labels we manage that are missing from the live issue
  const missingLabels = [...expectedLabels].filter(l => !liveLabels.has(l));
  // Labels we manage that exist on the live issue but aren't in the frontmatter
  const staleLabels   = [...liveLabels].filter(
    l => MANAGED_PREFIXES.some(p => l.startsWith(p)) && !expectedLabels.has(l),
  );

  if (missingLabels.length) drift.push(`Missing labels: ${missingLabels.join(', ')}`);
  if (staleLabels.length)   drift.push(`Stale labels:   ${staleLabels.join(', ')}`);

  // Milestone drift
  if (epic.fm.github_milestone) {
    const milestones         = await getMilestones();
    const expectedMilestone  = milestones[epic.fm.github_milestone];
    const liveMilestone      = liveIssue.milestone?.number ?? null;
    if (expectedMilestone && liveMilestone !== expectedMilestone) {
      drift.push(
        `Milestone: expected "${epic.fm.github_milestone}" (#${expectedMilestone}), ` +
        `got #${liveMilestone ?? 'none'}`,
      );
    }
  }

  // Status drift: issue closed but Epic not marked implemented
  if (liveIssue.state === 'closed' && epic.fm.status !== 'implemented') {
    drift.push(`Issue closed but Epic status is "${epic.fm.status}" not "implemented"`);
  }

  return drift;
}

// ── Apply corrections (Docs → Issues) ────────────────────────────────────────

async function applyCorrections(fm, drift) {
  const issueNum = fm.github_issue;

  if (drift.some(d => d.startsWith('Missing') || d.startsWith('Stale'))) {
    if (DRY_RUN) {
      console.log(`   [dry-run] Would PUT labels on #${issueNum}`);
    } else {
      await ghFetch(`/repos/${REPO}/issues/${issueNum}/labels`, {
        method: 'PUT',
        body:   JSON.stringify({ labels: epicToLabels(fm) }),
      });
    }
  }

  if (drift.some(d => d.startsWith('Milestone'))) {
    const milestones    = await getMilestones();
    const milestoneNum  = milestones[fm.github_milestone];
    if (milestoneNum) {
      if (DRY_RUN) {
        console.log(`   [dry-run] Would PATCH milestone #${milestoneNum} on #${issueNum}`);
      } else {
        await ghFetch(`/repos/${REPO}/issues/${issueNum}`, {
          method: 'PATCH',
          body:   JSON.stringify({ milestone: milestoneNum }),
        });
      }
    }
  }
}

// ── Back-sync: closed issue → Epic status = implemented ──────────────────────

async function backSyncStatus(epic, liveIssue) {
  if (liveIssue.state !== 'closed' || epic.fm.status === 'implemented') return;

  console.log(`   ↩  Closed issue #${epic.fm.github_issue} — setting Epic status: implemented`);
  if (DRY_RUN) return;

  const updated = epic.raw.replace(/^status:\s*.+$/m, 'status: implemented');
  await writeFile(epic.path, updated, 'utf8');
}

// ── Validate personas ─────────────────────────────────────────────────────────

function unknownPersonas(fm) {
  if (!Array.isArray(fm.personas)) return [];
  return fm.personas.filter(p => !KNOWN_PERSONAS.has(p));
}

// ── Write drift report ────────────────────────────────────────────────────────

async function writeDriftReport(report) {
  const date    = new Date().toISOString().slice(0, 10);
  const outPath = join(REPORTS_DIR, `sync-report-${date}.json`);
  await mkdir(REPORTS_DIR, { recursive: true });
  await writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n   Report written → ${outPath}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!REPO || !TOKEN) {
    console.error('GITHUB_REPOSITORY and GITHUB_TOKEN must be set.');
    process.exit(1);
  }

  console.log(`\n── Epic ↔ Issue Sync ${DRY_RUN ? '[DRY RUN] ' : ''}──────────────────────`);
  console.log(`   Repo: ${REPO}\n`);

  const epics  = await loadEpics();
  const report = {
    date:            new Date().toISOString(),
    dryRun:          DRY_RUN,
    synced:          [],
    drifted:         [],
    skipped:         [],
    errors:          [],
    personaWarnings: [],
  };

  for (const epic of epics) {
    const { fm, file } = epic;

    // Persona validation
    const unknown = unknownPersonas(fm);
    if (unknown.length) {
      report.personaWarnings.push({ file, unknown });
      console.warn(`⚠  ${file}: persona labels not in PERSONAS.md — ${unknown.join(', ')}`);
    }

    // Skip epics with no linked issue yet
    if (!fm.github_issue) {
      report.skipped.push(file);
      console.log(`·  ${file}: github_issue not set — skipping`);
      continue;
    }

    try {
      const liveIssue = await ghFetch(`/repos/${REPO}/issues/${fm.github_issue}`);
      const drift     = await detectDrift(epic, liveIssue);

      await backSyncStatus(epic, liveIssue);

      if (drift.length > 0) {
        report.drifted.push({ file, issue: fm.github_issue, drift });
        console.log(`⚡ ${file} (#${fm.github_issue}) — ${drift.length} drift(s):`);
        drift.forEach(d => console.log(`   • ${d}`));
        await applyCorrections(fm, drift);
        if (!DRY_RUN) console.log(`   ✅ corrected`);
      } else {
        report.synced.push(file);
        console.log(`✓  ${file} (#${fm.github_issue}) in sync`);
      }
    } catch (err) {
      report.errors.push({ file, error: err.message });
      console.error(`✗  ${file}: ${err.message}`);
    }
  }

  // Summary
  console.log('\n── Summary ───────────────────────────────────────');
  console.log(`   Synced:           ${report.synced.length}`);
  console.log(`   Drifted:          ${report.drifted.length}${DRY_RUN ? ' (not corrected — dry run)' : ' (corrected)'}`);
  console.log(`   Skipped:          ${report.skipped.length} (no github_issue)`);
  console.log(`   Errors:           ${report.errors.length}`);
  if (report.personaWarnings.length) {
    console.log(`   Persona warnings: ${report.personaWarnings.length}`);
  }

  if (!DRY_RUN) await writeDriftReport(report);

  if (report.errors.length > 0) {
    console.error('\n── Errors ────────────────────────────────────────');
    report.errors.forEach(e => console.error(`   ${e.file}: ${e.error}`));
    process.exit(1);
  }

  // Fail CI on unresolved drift in dry-run (used for validation checks)
  if (DRY_RUN && report.drifted.length > 0) {
    console.log('\n── Drift detected (dry run) ──────────────────────');
    report.drifted.forEach(d => {
      console.log(`   ${d.file} (#${d.issue}):`);
      d.drift.forEach(msg => console.log(`     • ${msg}`));
    });
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
