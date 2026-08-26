---
name: build-brandbook
description: Extract a founder's brand from their website, deck, or asset folder and produce a complete brand-book.json plus a rendered brandbook site. Use when someone wants a brandbook, brand guidelines, a design system summary, or a marketing source of truth built from what their brand already looks like.
---

# Build a brandbook

Turn whatever a founder has — a live site, a deck, a folder of screenshots — into
`brand-book.json` and a rendered seven-page book. Read `schema.md` for the field contract and
`CLAUDE.md` for the rules; this file is the extraction recipe.

**The rule that overrides everything: never invent a value.** No fabricated metrics, no
made-up customer names, no guessed hex codes presented as facts. Omit what you cannot find and
say what you omitted.

## Step 1 — Pull the raw material

### From a website

```bash
curl -s https://example.com > /tmp/bb/home.html
```

Then, from that HTML:

1. **Stylesheets.** Grab every `<link rel="stylesheet">` href and fetch each one. The compiled
   CSS is where the real palette and type stacks live.
2. **Google Fonts.** The `fonts.googleapis.com/css2?family=…` link gives you the font names and
   weights directly — reuse that whole URL as `fonts.googleFontsUrl`.
3. **Self-hosted fonts.** Search the CSS for `@font-face`, `.woff2`, `.otf`. Check whether the
   file is served with CORS open before pointing the book at it:

   ```bash
   curl -sI https://example.com/fonts/Brand.woff2 | grep -i "access-control-allow-origin\|HTTP/"
   ```

   Open (`*`) means the book can load it from their domain. Closed means fall back to the nearest
   Google font and tell the founder.
4. **Logos.** Look for `.svg` in the header, `<link rel="icon">`, and any `/logo` path. Prefer SVG.
   Download into `assets/`. If a wordmark exists in only one color, note that the inverse is
   missing rather than recoloring it yourself.
5. **Photography.** Pull the `<img>` and `og:image` sources that are real photographs, not UI
   chrome. Save the good ones into `assets/`, keeping each under ~250KB.
6. **Copy.** `<title>`, the meta description, every `<h1>`/`<h2>`, and the hero paragraph. This is
   your evidence for voice and for claims.

### Extracting the palette

Count actual usage rather than collecting every hex in the file:

```bash
grep -ohE '#[0-9a-fA-F]{6}\b' /tmp/bb/*.css | tr 'A-F' 'a-f' | sort | uniq -c | sort -rn | head -20
```

Also read the CSS custom properties (`--brand`, `--primary`, …) — a brand that defines tokens has
already named its own colors, and those names beat any you'd invent. Then sort what you found into
**Grounds** (the darkest and lightest), **Accents** (the saturated ones), and drop the rest.
Six to nine swatches is a real palette; twenty is a dump.

### From a deck or screenshots

Read the file, sample colors off the slides, identify the fonts by eye, and pull the claims from
the content slides. Say in your summary that values were read visually and should be confirmed.

## Step 2 — Infer the parts that aren't in the CSS

**Voice** comes from their real copy. Read the headlines and the hero paragraph and answer:
second person or third? Short declaratives or long sentences? Concrete numbers or abstractions?
Write `voice.primary` as one line naming the register, and `voice.style` as how it behaves. Quote
their actual patterns in `headlines[]` — do not compose new ones in a voice you invented.

**Claims** must come from their material. Real numbers they publish, or qualitative anchors if they
publish none. Never a plausible-sounding metric.

**Photography direction** is described from what they actually use: subject, light, treatment. If
they use illustration or gradients instead, say that.

**Spacing, radii, shadows** come from the CSS if it's tokenized. If not, read the rendered page
and describe the pattern you can see. Don't emit a full 8-step scale from a site that uses three
values.

## Step 3 — Ask, once

Batch everything you couldn't determine into a single message. Typical gaps: the inverse logo,
whether a font is licensed, which claims are safe to publish, and the clear-space rule. Then
proceed with your best reading of the rest — they iterate on a rendered book far more easily
than on a list of questions.

## Step 4 — Write, render, check

Write `brand-book.json` per `schema.md`, then:

```bash
node render.mjs
./serve.sh
```

Open it and verify, don't assume:

- every `@font-face` actually loads (check in the browser, not by reading the CSS)
- no broken images
- no section rendering empty or with a stray label
- text on the brand's grounds is genuinely readable

Fix in the JSON, re-render.

## Step 5 — Hand it back

Tell the founder, plainly:

1. What you extracted and from where.
2. What you had to infer, and what you left out because you couldn't verify it.
3. That publishing is the step that makes the book usable by the other toolkit tools
   (`PUBLISH.md`), and that it's theirs to trigger.

## Anti-patterns

- Recoloring a logo to manufacture the inverse variant.
- Committing a licensed font file into the repo.
- A twenty-swatch palette scraped from every hex in the CSS.
- Claims, stats, or customer names that appear nowhere in their material.
- Editing the generated HTML instead of the JSON.
- Declaring WCAG AA without checking the contrast.
