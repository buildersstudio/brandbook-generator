#!/usr/bin/env node
/**
 * Brandbook renderer — brand-book.json + template/ -> a static brandbook site.
 *
 *   node render.mjs                          # brand-book.json -> ./  (in place)
 *   node render.mjs my-book.json --out site  # somewhere else
 *
 * Zero dependencies. Node 18+.
 *
 * Template syntax (deliberately tiny):
 *   {{ a.b }}              escaped value
 *   {{{ a.b }}}            raw HTML — for copy that carries <em> emphasis
 *   {{#each list}} … {{/each}}   loop; inside: {{.field}}, {{.}} for strings,
 *                                {{@n}} 1-based index, {{$ a.b }} reaches the root
 *   {{#if a.b}} … {{/if}}        render when truthy (non-empty array counts)
 *   {{#unless a.b}} … {{/unless}}
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------ chapters */
/* The book's structure is fixed — this is what downstream tools rely on. */
const CHAPTERS = [
  { file: 'index.html',       name: 'Overview',         num: null },
  { file: 'logo.html',        name: 'Logo',             num: '01' },
  { file: 'colors.html',      name: 'Colors',           num: '02' },
  { file: 'typography.html',  name: 'Typography',       num: '03' },
  { file: 'spacing.html',     name: 'Spacing & Layout', num: '04' },
  { file: 'photography.html', name: 'Photography',      num: '05' },
  { file: 'messaging.html',   name: 'Messaging',        num: '06' },
];
const TUTORIAL = { file: 'tutorial.html', name: 'How to use' };

/* ------------------------------------------------------------------- engine */

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Resolve a dotted path against the context stack. `.x` = current item, `$x` = root. */
function lookup(path, stack) {
  path = path.trim();
  let scope;
  if (path.startsWith('$')) { scope = stack[0]; path = path.slice(1).trim(); }
  else if (path.startsWith('.')) { scope = stack[stack.length - 1]; path = path.slice(1).trim(); }
  else scope = stack[stack.length - 1];

  // `{{.}}` on a list of plain strings: the loop stashes the primitive under the '' key.
  if (path === '') {
    return (scope && typeof scope === 'object' && '' in scope) ? scope[''] : scope;
  }
  let cur = scope;
  for (const key of path.split('.')) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  // Fall back up the stack so outer values stay reachable inside a loop.
  if (cur === undefined && stack.length > 1 && !path.startsWith('$')) {
    for (let i = stack.length - 2; i >= 0; i--) {
      let probe = stack[i];
      for (const key of path.split('.')) {
        if (probe == null) { probe = undefined; break; }
        probe = probe[key];
      }
      if (probe !== undefined) return probe;
    }
  }
  return cur;
}

const truthy = (v) => Array.isArray(v) ? v.length > 0 : !!v;

/** Find the matching {{/kind}} for a block that opened at `from`, honouring nesting. */
function matchEnd(src, kind, from) {
  const re = new RegExp(`\\{\\{(#${kind}\\s[^}]*|\\/${kind})\\}\\}`, 'g');
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(src))) {
    depth += m[1].startsWith('#') ? 1 : -1;
    if (depth === 0) return { bodyEnd: m.index, next: re.lastIndex };
  }
  throw new Error(`unclosed {{#${kind}}}`);
}

function render(tpl, stack) {
  let out = '';
  let i = 0;
  const open = /\{\{(#each|#if|#unless)\s+([^}]+)\}\}|\{\{\{([^}]+)\}\}\}|\{\{([^#/][^}]*)\}\}/g;
  open.lastIndex = 0;
  let m;
  while ((m = open.exec(tpl))) {
    out += tpl.slice(i, m.index);
    const [, block, blockPath, rawPath, valPath] = m;

    if (block) {
      const kind = block.slice(1);
      const { bodyEnd, next } = matchEnd(tpl, kind, open.lastIndex);
      const body = tpl.slice(open.lastIndex, bodyEnd);
      const val = lookup(blockPath, stack);

      if (kind === 'each') {
        const list = Array.isArray(val) ? val : [];
        list.forEach((item, idx) => {
          const scope = (item !== null && typeof item === 'object')
            ? { ...item, '@n': idx + 1, '@index': idx }
            : { '': item, '@n': idx + 1, '@index': idx };
          // `{{.}}` on a primitive resolves through the '' key above.
          out += render(body, [...stack, scope]);
        });
      } else if ((kind === 'if') === truthy(val)) {
        out += render(body, stack);
      }
      i = next;
      open.lastIndex = next;
      continue;
    }

    const path = rawPath ?? valPath;
    let v = lookup(path, stack);
    if (v === undefined || v === null) v = '';
    out += rawPath ? String(v) : esc(v);
    i = open.lastIndex;
  }
  return out + tpl.slice(i);
}

/* ------------------------------------------------------------------- chrome */

function navHtml(current) {
  const rows = [];
  for (const c of CHAPTERS) {
    rows.push(`      <a href="${c.file}"${c.file === current ? ' class="on"' : ''}>${esc(c.name)}</a>`);
  }
  rows.push('      <div class="div"></div>');
  rows.push(`      <a href="${TUTORIAL.file}"${TUTORIAL.file === current ? ' class="on"' : ''}>${esc(TUTORIAL.name)}</a>`);
  return rows.join('\n');
}

function pagerHtml(current) {
  const idx = CHAPTERS.findIndex((c) => c.file === current);
  if (idx < 0) return '';
  const parts = [];
  if (idx > 0) {
    const p = CHAPTERS[idx - 1];
    parts.push(`      <a href="${p.file}"><span class="pk">Previous</span><span class="pt">${esc(p.name)}</span></a>`);
  }
  if (idx < CHAPTERS.length - 1) {
    const n = CHAPTERS[idx + 1];
    parts.push(`      <a href="${n.file}" class="next"><span class="pk">Next</span><span class="pt">${esc(n.name)}</span></a>`);
  }
  return parts.length ? `    <div class="pager">\n${parts.join('\n')}\n    </div>` : '';
}

/* --------------------------------------------------------------------- main */

const argv = process.argv.slice(2);
const outFlag = argv.indexOf('--out');
const outDir = resolve(outFlag >= 0 ? argv[outFlag + 1] : HERE);
const dataPath = resolve(argv.find((a, k) => !a.startsWith('--') && argv[k - 1] !== '--out') ?? join(HERE, 'brand-book.json'));

if (!existsSync(dataPath)) {
  console.error(`✗ no brand book at ${dataPath}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(readFileSync(dataPath, 'utf8'));
} catch (e) {
  console.error(`✗ ${dataPath} is not valid JSON: ${e.message}`);
  process.exit(1);
}

/* A few required fields, checked up front so failures are readable. */
for (const path of ['brand.name', 'brand.tagline', 'logo', 'colors', 'typography', 'messaging']) {
  if (lookup(path, [data]) === undefined) {
    console.error(`✗ brand book is missing "${path}" — see schema.md`);
    process.exit(1);
  }
}

const tplDir = join(HERE, 'template');
const layout = readFileSync(join(tplDir, 'layout.html'), 'utf8');

mkdirSync(outDir, { recursive: true });

const pages = [...CHAPTERS, TUTORIAL];
for (const page of pages) {
  const bodyTpl = readFileSync(join(tplDir, 'pages', page.file), 'utf8');
  const ctx = { ...data, _chapter: page.name, _num: page.num ?? '' };
  const body = render(bodyTpl, [ctx]);

  const title = page.file === 'index.html'
    ? `${data.brand.name} — Brandbook`
    : page.file === 'tutorial.html'
      ? 'How to use — Brandbook Generator'
      : `${page.name} — ${data.brand.name} Brandbook`;

  const html = render(layout, [{
    ...ctx,
    _title: title,
    _body: body,
    _nav: navHtml(page.file),
    _pager: pagerHtml(page.file),
  }]);

  writeFileSync(join(outDir, page.file), html);
}

/* style.css carries the brand accent, so it is rendered too. */
writeFileSync(join(outDir, 'style.css'), render(readFileSync(join(tplDir, 'style.css'), 'utf8'), [data]));
copyFileSync(join(tplDir, 'toolbar.js'), join(outDir, 'toolbar.js'));

console.log(`✓ ${data.brand.name} brandbook — ${pages.length} pages -> ${outDir}`);
const assets = join(outDir, 'assets');
if (!existsSync(assets)) {
  console.log('  note: no assets/ folder here yet — put logos and photos there,');
  console.log('        matching the paths in the brand book.');
} else {
  console.log(`  assets/: ${readdirSync(assets).length} files`);
}
