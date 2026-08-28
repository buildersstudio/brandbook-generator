#!/usr/bin/env node
/**
 * Append photographs to the numbered library.
 *
 *   node add-photos.mjs ~/Desktop/boats.jpg
 *   node add-photos.mjs ~/Desktop/*.jpg --alt "Studio offsite"
 *
 * Appends only — existing numbers never move, because other projects reference
 * them ("use 12 and 79 for that carousel"). Each photo becomes the next number,
 * thumbnailed to the size schema.md documents, and brand-book.json is updated.
 *
 * Re-run `node render.mjs` after this (or pass --render).
 *
 * macOS only: uses sips for the thumbnail. On Linux, swap in ImageMagick.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = join(HERE, 'assets', 'library');
const BOOK = join(HERE, 'brand-book.json');

/* Thumbnail spec — keep in step with schema.md. */
const LONG_EDGE = 360;
const QUALITY = 55;

const argv = process.argv.slice(2);
const altFlag = argv.indexOf('--alt');
const sharedAlt = altFlag >= 0 ? argv[altFlag + 1] : null;
const doRender = argv.includes('--render');
const files = argv.filter((a, i) =>
  !a.startsWith('--') && argv[i - 1] !== '--alt');

if (!files.length) {
  console.error('usage: node add-photos.mjs <image…> [--alt "text"] [--render]');
  process.exit(1);
}

const missing = files.filter((f) => !existsSync(f));
if (missing.length) {
  console.error('✗ not found:');
  for (const m of missing) console.error(`   ${m}`);
  process.exit(1);
}

const book = JSON.parse(readFileSync(BOOK, 'utf8'));
book.photography ??= {};
book.photography.library ??= { label: 'Library', note: '', items: [] };
const items = book.photography.library.items;

/* Guard the contract: the numbering must already be contiguous, or appending
   would cement a gap that other references depend on. */
const expected = items.map((_, i) => `assets/library/${String(i + 1).padStart(3, '0')}.jpg`);
const drift = items.findIndex((it, i) => it.src !== expected[i]);
if (drift >= 0) {
  console.error(`✗ library numbering is not contiguous at position ${drift + 1}`);
  console.error(`   expected ${expected[drift]}, found ${items[drift].src}`);
  console.error('   fix that before appending — see schema.md.');
  process.exit(1);
}

/* Don't add the same photograph twice. */
const known = new Set(items.map((it) => it.file));

const titleCase = (s) => {
  const t = basename(s, extname(s)).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return t ? t[0].toUpperCase() + t.slice(1) : 'Photograph';
};

mkdirSync(LIB_DIR, { recursive: true });

let n = items.length;
const added = [];
for (const src of files) {
  const file = basename(src);
  if (known.has(file)) {
    console.log(`· skipped ${file} — already in the library`);
    continue;
  }
  n += 1;
  const name = `${String(n).padStart(3, '0')}.jpg`;
  const out = join(LIB_DIR, name);
  try {
    execFileSync('sips', [
      '-Z', String(LONG_EDGE),
      '-s', 'format', 'jpeg',
      '-s', 'formatOptions', String(QUALITY),
      '--out', out, resolve(src),
    ], { stdio: 'pipe' });
  } catch (e) {
    console.error(`✗ could not thumbnail ${src}: ${e.message}`);
    process.exit(1);
  }
  if (!existsSync(out)) {
    console.error(`✗ sips reported success but wrote nothing for ${src}`);
    process.exit(1);
  }
  items.push({ src: `assets/library/${name}`, alt: sharedAlt || titleCase(src), file });
  known.add(file);
  added.push({ n, name, file });
}

if (!added.length) {
  console.log('nothing to add.');
  process.exit(0);
}

book.updatedAt = book.updatedAt ?? '';
writeFileSync(BOOK, JSON.stringify(book, null, 2) + '\n');

for (const a of added) console.log(`✓ ${a.file}  ->  ${a.n}  (${a.name})`);
console.log(`library: ${items.length} photographs, ${readdirSync(LIB_DIR).length} files`);

if (doRender) {
  execFileSync('node', [join(HERE, 'render.mjs')], { stdio: 'inherit' });
} else {
  console.log('run `node render.mjs` to rebuild the pages.');
}
