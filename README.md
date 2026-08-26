# Brandbook Generator

A free, open-source tool for founders, part of the [Builders Studio toolkit](https://toolkit.builders.studio).

Point it at your website and it produces a complete **brandbook**: one structured
`brand-book.json` plus a rendered, publishable seven-page site — logo rules, colors, typography,
spacing, photography direction, and messaging.

The published book becomes the **single source of truth** for every other marketing tool —
starting with the Post Generator Studio — and doubles as the founder's marketing repository.

## Quick start

You need [Claude Code](https://claude.com/claude-code) and Node 18+.

```bash
git clone https://github.com/buildersstudio/brandbook-generator.git
cd brandbook-generator
claude
```

Then say what carries your brand:

> My website is acme.example — build my brandbook.

Claude reads `CLAUDE.md` on open, so it already knows the workflow: it fetches your site, pulls
the real logo files, palette, font stacks, imagery and copy, writes `brand-book.json`, and renders
the book. Iterate in plain words ("the green is wrong, use the darker one from our logo") and
publish when you're happy.

## Doing it by hand

The tool is a renderer plus a contract, so it works without Claude too:

```bash
node render.mjs        # brand-book.json + template/ -> the seven pages
./serve.sh             # http://localhost:4611
```

Edit `brand-book.json` (see `schema.md`), re-run, reload.

## What's in here

| | |
|---|---|
| `CLAUDE.md` | The operating manual — auto-loads in Claude Code. |
| `.claude/skills/build-brandbook.md` | The extraction recipe: what to fetch, how to read a palette out of CSS, how to infer voice. |
| `brand-book.json` | The brand as data. **The artifact that matters** — this is what other tools read. |
| `schema.md` | Field-by-field contract for that file. |
| `render.mjs` | Zero-dependency renderer. JSON + template in, static site out. |
| `template/` | `layout.html`, `pages/*.html`, `style.css`, `toolbar.js`. Edit to change how every book looks. |
| `PUBLISH.md` | Vercel / GitHub Pages. |
| `assets/` | Logos and photography, referenced by path from the JSON. |
| `*.html` at the root | **Generated.** Don't edit them; edit the JSON and re-render. |

## The book that ships here

The pages at the root are the **Builders Studio** brandbook — we ran the tool on our own brand,
so what you land on is real output rather than a placeholder. Run the tool and it becomes yours.

Two rules the tool holds to: it never invents a value (no fabricated metrics, no guessed hexes
presented as fact — missing sections are simply omitted), and it never commits a licensed font
file (faces load from the brand's own domain instead).

Your brand never leaves your machine unless you publish it.
