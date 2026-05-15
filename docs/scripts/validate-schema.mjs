#!/usr/bin/env node
/**
 * validate-schema.mjs
 *
 * Scans src/ and functions/src/ for Firestore collection references and
 * cross-checks them against docs/schema/firestore-schema.md.
 *
 * Exits 1 with a diff if any referenced collection is not documented.
 *
 * Usage:
 *   node docs/scripts/validate-schema.mjs [--warn-only]
 *
 * --warn-only  Print violations but exit 0 (useful during initial adoption).
 */

import { readFile } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT  = join(__dirname, '../..');
const SCHEMA_DOC = join(REPO_ROOT, 'docs/schema/firestore-schema.md');
const WARN_ONLY  = process.argv.includes('--warn-only');

// Source directories to scan
const SCAN_DIRS = [
  join(REPO_ROOT, 'src'),
  join(REPO_ROOT, 'functions/src'),
];

// File extensions to scan
const SCAN_EXTS = /\.(ts|tsx|js|jsx|mjs)$/;

// ── Extract documented collections from schema doc ────────────────────────────
// Matches:  ### `collectionName/{id}`
//           ### `collectionName` (Single Document)
//           ### `config/featureFlags` (Single Document)

function parseDocumentedCollections(schemaContent) {
  const documented = new Set();
  const headerRe   = /^### `([^`]+)`/gm;
  let m;

  while ((m = headerRe.exec(schemaContent)) !== null) {
    // Normalise: strip /{id}, /{uid}, etc. and take the top-level name
    const rawPath   = m[1];
    const topLevel  = rawPath.split('/')[0];
    documented.add(topLevel);
  }

  // Also capture deprecated entries so we can warn specifically about them
  const deprecatedRe = /\|\s*`([^`]+)`\s*\|.*Replaced By/gi;
  while ((m = deprecatedRe.exec(schemaContent)) !== null) {
    documented.add(m[1]); // still "documented" — but as deprecated
  }

  return documented;
}

function parseDeprecatedCollections(schemaContent) {
  const deprecated = new Set();
  const re         = /\|\s*`([^`]+)`\s*\|[^|]+\|[^|]*[Rr]eplaced/g;
  let m;
  while ((m = re.exec(schemaContent)) !== null) {
    deprecated.add(m[1]);
  }
  return deprecated;
}

// ── Scan source files for Firestore collection references ─────────────────────
//
// Detects:
//   Modular Web SDK:   collection(db, 'name') | collection(db, "name")
//                      doc(db, 'name', id)    | doc(db, "name", id)
//                      collectionGroup('name')
//   Namespaced SDK:    .collection('name')    | .collection("name")
//   Admin SDK:         db.collection('name')  — same as namespaced

const COLLECTION_PATTERNS = [
  // Modular: collection(db, 'name') or collection(db, "name")
  /\bcollection\s*\(\s*\w+\s*,\s*['"]([^'"]+)['"]/g,
  // Modular: doc(db, 'name', ...) — first path segment is collection
  /\bdoc\s*\(\s*\w+\s*,\s*['"]([^'"]+)['"]/g,
  // Namespaced: .collection('name')
  /\.collection\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  // collectionGroup('name')
  /\bcollectionGroup\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

async function findSourceFiles(dir) {
  try {
    const out = execSync(`find "${dir}" -type f`, { encoding: 'utf8' });
    return out.trim().split('\n').filter(f => SCAN_EXTS.test(f));
  } catch {
    return []; // directory doesn't exist yet
  }
}

async function scanFile(filePath) {
  const content    = await readFile(filePath, 'utf8');
  const references = new Map(); // collectionName → Set<lineNumbers>

  for (const pattern of COLLECTION_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(content)) !== null) {
      const name = m[1].split('/')[0]; // top-level collection name
      if (!references.has(name)) references.set(name, new Set());

      // Find the line number of this match
      const lineNum = content.slice(0, m.index).split('\n').length;
      references.get(name).add(lineNum);
    }
  }

  return references;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n── Firestore Schema Guard ───────────────────────────────────\n');

  // Load schema doc
  let schemaContent;
  try {
    schemaContent = await readFile(SCHEMA_DOC, 'utf8');
  } catch {
    console.error(`✗  Cannot read schema doc: ${SCHEMA_DOC}`);
    process.exit(1);
  }

  const documented = parseDocumentedCollections(schemaContent);
  const deprecated = parseDeprecatedCollections(schemaContent);

  console.log(`   Schema doc:   ${relative(REPO_ROOT, SCHEMA_DOC)}`);
  console.log(`   Documented:   ${[...documented].join(', ')}`);
  console.log(`   Deprecated:   ${deprecated.size > 0 ? [...deprecated].join(', ') : 'none'}`);
  console.log();

  // Collect all source references
  const violations  = []; // { file, collection, lines }
  const deprecUsage = []; // { file, collection, lines }

  for (const dir of SCAN_DIRS) {
    const files = await findSourceFiles(dir);
    for (const file of files) {
      const refs = await scanFile(file);
      for (const [collection, lines] of refs) {
        const relFile = relative(REPO_ROOT, file);

        if (deprecated.has(collection)) {
          deprecUsage.push({ file: relFile, collection, lines: [...lines] });
        } else if (!documented.has(collection)) {
          violations.push({ file: relFile, collection, lines: [...lines] });
        } else {
          console.log(`✓  ${relFile}  →  \`${collection}\` (documented)`);
        }
      }
    }
  }

  // Report deprecated usage (warnings only — not a CI failure)
  if (deprecUsage.length > 0) {
    console.log('\n── Deprecated Collections ───────────────────────────────────');
    console.log('   These collections are documented as deprecated. Migrate to their replacements.\n');
    for (const { file, collection, lines } of deprecUsage) {
      console.warn(`⚠  ${file}:${lines.join(',')}  →  \`${collection}\` is deprecated`);
    }
  }

  // Report violations
  if (violations.length === 0) {
    console.log('\n✅ All Firestore collection references are documented.\n');
    return;
  }

  console.log('\n── Undocumented Collections ─────────────────────────────────');
  console.log('   Add these to docs/schema/firestore-schema.md before merging.\n');
  for (const { file, collection, lines } of violations) {
    console.error(`✗  ${file}:${lines.join(',')}  →  \`${collection}\` not in schema doc`);
  }

  console.log(`
── How to fix ────────────────────────────────────────────────
  1. Open docs/schema/firestore-schema.md
  2. Add a new ### section for each undocumented collection
  3. Define all fields, types, and security rule requirements
  4. Include this file in your PR

  See docs/schema/firestore-schema.md for the existing format.
`);

  if (WARN_ONLY) {
    console.warn(`⚠  --warn-only: ${violations.length} violation(s) suppressed.`);
  } else {
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
