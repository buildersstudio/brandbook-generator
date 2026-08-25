# Brandbook Generator

A free, open-source tool for founders, part of the [Builders Studio toolkit](https://toolkit.builders.studio).

Point it at your website (or a deck, screenshots, a logo folder — whatever carries your brand)
and it produces a complete **brandbook site**: logo rules, colors, typography, spacing,
photography direction, and messaging. One structured `brand-book.json` plus a rendered,
publishable site.

The brandbook then acts as the **single source of truth** for every other marketing tool —
starting with the Post Generator Studio — and as the founder's marketing repository.

## How it works

There is no app and no API. The tool runs inside [Claude Code](https://claude.com/claude-code)
on your machine:

1. **Point** — clone this repo, open it in Claude Code, and say what your brand is
   (`"My website is acme.example — build my brandbook."`).
2. **Distill** — Claude extracts logo, palette, type system, spacing, photography style, and
   voice, and writes them into `brand-book.json` + a rendered brandbook site.
3. **Publish** — the book lives on localhost by default. When you're ready, one command
   publishes it to a public link (Vercel or GitHub Pages) so your team and your tools can
   point at it.

Your brand never leaves your machine unless you publish it.

## In this repo

The site at the root is what the tool produces — the **Builders Studio brandbook**, generated
from our own brand, one chapter per page:

- `index.html` — overview and chapter index
- `logo.html` · `colors.html` · `typography.html` · `spacing.html` · `photography.html` · `messaging.html`
- `tutorial.html` — how to use the tool on your own brand
- `style.css` / `toolbar.js` — the shared shell and the floating toolkit bar
  (the same bar every Builders toolkit tool mounts)

The generator skill (schema, extraction workflow, renderer, publish flow) lands next.
