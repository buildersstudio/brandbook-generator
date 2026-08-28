# Brandbook Generator — operating manual (read me first)

This repo is a **Claude-native tool**. There is no app and no API: you (Claude) are the engine.
A founder points you at their brand, you distill it into one `brand-book.json`, and a
zero-dependency renderer turns that into a seven-page brandbook site they can publish.

The published book is then the **source of truth** for every other tool in the
[Builders toolkit](https://toolkit.builders.studio) — the Post Generator reads it so it already
knows the founder's colors, fonts, voice, and which claims are real.

## The one principle: the JSON is the product

The HTML is disposable output. `brand-book.json` is the artifact that matters, because it is what
other tools consume. So:

- **Never hand-edit the generated `*.html` at the root.** Edit `brand-book.json`, re-run the
  renderer. Anything you type into HTML is lost on the next render.
- **Never invent a value to fill a field.** An absent section renders as nothing, which is
  correct. A fabricated metric is a lie the founder will publish. This is the one rule with no
  exceptions.
- If the brand genuinely has no photography, no flourish font, or no numbers, omit those fields
  and say so in your summary.

## The workflow

### 1. Understand the input

The founder says what carries the brand. In order of richness:

- **A live website** — the best input. Fetch it, then fetch its compiled CSS.
- **A deck, PDF, or screenshots** — read them; ask where the logo files live.
- **Just a description** — possible, but say plainly that the result is a proposal rather than an
  extraction, and that colors and fonts are your suggestions.

### 2. Extract

Follow `.claude/skills/build-brandbook.md`. It has the concrete recipe: which files to fetch,
how to pull palette and type out of CSS, how to find real logo and photo assets, and how to infer
voice from real copy. Read it before you start.

Ask the founder only what you truly cannot infer, and batch the questions into one message.
Bias toward *showing* over asking — they iterate once they see a book.

### 3. Write `brand-book.json`

`schema.md` is the field-by-field contract. Rules that matter:

- Save real asset files into `assets/` and reference them as `assets/name.ext`.
- **Never commit a licensed font file.** Point `fonts.faces[].url` at the brand's own domain
  (check it sends `access-control-allow-origin`), or fall back to the nearest Google font and
  tell the founder you did.
- `theme` and `type` come from the brand, not from your taste — the book renders in the founder's
  colors and fonts, not in Builders'.
- `messaging` deserves the most care. It is the chapter other tools lean on hardest.

### 4. Render and look at it

```bash
node render.mjs        # brand-book.json + template/ -> the seven pages at the repo root
./serve.sh             # http://localhost:4611
```

Then actually open it and check: fonts loading, no broken images, no empty sections, contrast
readable. Fix by editing the JSON and re-rendering.

### 5. Iterate in plain words

The founder reacts ("the green is wrong", "our voice is warmer than this"). Edit the JSON,
re-render, re-open. Never argue with them about their own brand.

### 6. Offer to publish

The book is only useful to other tools once it has a public URL. When the founder is happy, walk
them through `PUBLISH.md` (Vercel or GitHub Pages). Publishing is theirs to trigger — ask before
pushing anything anywhere.

## Where things go

```
brand-book.json        the brand as data — the artifact that matters
assets/                logos and imagery, referenced from the JSON
  library/NNN.jpg      the numbered photo library — position IS the number,
                       so append only, never reorder (see schema.md)
render.mjs             the renderer (zero deps, Node 18+)
template/
  layout.html          the shell: head, sidebar, pager
  pages/*.html         one template per chapter
  style.css            the shared stylesheet (brand tokens are placeholders)
  toolbar.js           the floating toolkit bar, shared with the other tools
schema.md              the field-by-field contract
PUBLISH.md             Vercel / GitHub Pages
*.html                 GENERATED. Do not edit.
```

## Template syntax

`render.mjs` implements a deliberately tiny language, documented in its header comment:
`{{ value }}`, `{{{ raw html }}}`, `{{#each list}}`, `{{#if x}}`, `{{#unless x}}`; inside a loop
`{{.field}}`, `{{.}}`, `{{@n}}`, and `{{$ root.path }}`.

Changing the *design* of every book means editing `template/`. Changing *one* brand's content
means editing its JSON. Don't confuse the two.

## The book that ships in this repo

The pages at the root are the **Builders Studio** brandbook — we ran the tool on our own brand, so
the repo demonstrates real output rather than a placeholder. A founder running the tool replaces
it with their own. If you need to regenerate it, its data is the `brand-book.json` in this repo.

## Voice for the copy you write

The book's own prose (chapter intros, rules, style direction) should read like the brand, not
like documentation. Short declaratives. No hype adjectives, no "leverage" or "seamless", no em
dashes as a tic. If the brand's voice is warm, write warm. Match what you found on their site.
