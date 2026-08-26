# `brand-book.json` — schema v1

One file holds the whole brand. The renderer turns it into the site; every other tool in the
[Builders toolkit](https://toolkit.builders.studio) reads it as the source of truth. Keep it
valid and other tools keep working.

Conventions used below:

- **required** — `render.mjs` refuses to run without it.
- Fields marked **html** may contain inline `<em>`, `<b>`, `<br>` and are injected raw. Everything
  else is escaped, so quotes and ampersands are safe to type literally.
- Any optional section you omit disappears from the page rather than rendering empty.
- Asset paths are relative to the book's own folder — always `assets/…`.

---

## `version` — required

| field | type | notes |
|---|---|---|
| `version` | number | Schema version this book targets. `1` today. A tool reading the book should check it before trusting the shape, so a future breaking change is detectable rather than silent. |

## `brand` — required

| field | type | notes |
|---|---|---|
| `name` | string | **required.** Brand name. Used in titles and the sidebar fallback. |
| `tagline` | string | **required.** The line the brand leads with. |
| `oneLiner` | string | What the company does, one sentence. |
| `description` | **html** | The hero paragraph. One `<em>` flourish reads well here. |
| `website` | string | Full URL. |
| `websiteLabel` | string | Display form, e.g. `acme.example`. |
| `year` | string | Shown in the hero kicker. |
| `heroImage` | path | Optional gradient/photo behind the hero. Omit for a flat ground. |

## `theme` — required

The five colors the book's own chrome uses. Take them from the brand, not from taste.

| field | notes |
|---|---|
| `deep` | The brand's darkest ground. Logo stage, hero. |
| `cream` | The brand's lightest ground. |
| `ink` | Body-text color on the light ground. |
| `accent` | The primary accent. Drives links, bars, the mono kicker in the formula card. |
| `ok` | The affirmative color used by "Do" lists. Reuse `accent` if the brand has no green. |

## `type` — required

CSS font stacks per role. Always end each stack with a real system fallback.

| field | notes |
|---|---|
| `display` | Headlines. |
| `body` | Body copy. |
| `flourish` | The italic/serif accent voice. Reuse `body` if the brand has none. |
| `mono` | Kickers, labels, code. |
| `displayTracking` | Letter-spacing for display type, e.g. `-.022em`. |
| `displayWeight` | Weight for display type, e.g. `700`. Set it explicitly: a variable family can serve display and body at once, and then the family name alone cannot tell them apart. |
| `bodyWeight` | Weight for body copy, e.g. `400`. |

## `fonts`

How the faces actually load.

| field | notes |
|---|---|
| `googleFontsUrl` | One combined `css2?family=…` URL. |
| `faces[]` | Self-hosted faces: `{ family, url, format, style? }`. **Never commit a licensed font file** — point `url` at the brand's own domain. |

## `toc`

One line per chapter for the overview cards: `logo`, `colors`, `typography`, `spacing`,
`photography`, `messaging`.

---

## `logo` — required

| field | notes |
|---|---|
| `intro` | The chapter's one-paragraph summary. |
| `primary` | `{ src, alt, on }` — dark logo for light grounds. `on` is the caption, e.g. `"on cream"`. |
| `inverse` | `{ src, alt, on }` — light logo for dark grounds. Also used in the sidebar. |
| `mark` | Optional small-space mark. Either `{ path, viewBox }` for an inline SVG glyph, or `{ src }` for a file — plus `label`, `use`, `alt`. |
| `clearSpace` | The clear-space rule in plain English. |
| `dos[]` / `donts[]` | Short imperatives. Four each is a good target. |

## `colors` — required

| field | notes |
|---|---|
| `intro` | Chapter summary. |
| `groups[]` | `{ name, description, swatches[] }`, each swatch `{ name, value, usage }`. Group by job (Grounds, Accents, Semantic), not by hue. |
| `scale` | Optional ordered ramp: `{ name, description, values[] }`. |
| `note` | Accessibility note. State the real contrast situation; don't claim AA you haven't checked. |

## `typography` — required

| field | notes |
|---|---|
| `intro` | Chapter summary. |
| `sampleLine` | The sentence every scale row renders, so sizes compare honestly. |
| `fonts[]` | `{ role, name, cls, sample, sampleSize?, stack }`. `cls` is `xb` (display), `fav` (body), `serif` (flourish), or `kick` (mono). |
| `scale[]` | `{ name, spec, cls, previewSize }`. `spec` is the real `size / line-height`; `previewSize` is only what fits the table. |
| `pairing` | `{ kicker, headline (**html**), body }` — the light card showing the fonts working together. |

## `spacing`

| field | notes |
|---|---|
| `intro` | Chapter summary. |
| `spacing[]` / `radius[]` | `{ name, value, demo }`. `value` is the token; `demo` is the px the swatch draws. |
| `shadows[]` | `{ name, value, demo }` where `demo` is inline CSS applied to the sample chip. |
| `note` | Optional. |

## `photography`

Omit the whole section for a brand with no image library.

| field | notes |
|---|---|
| `intro` | Chapter summary. |
| `groups[]` | `{ name, items[] }`, each item `{ src, alt, tag? }`. Three per row. |
| `faces` / `facesLabel` | Square portrait grid, four per row. |
| `style[]` | `{ label, value }` rows: subject, light, treatment, and so on. |
| `dos[]` / `donts[]` | Short imperatives. |
| `signatures[]` | `{ name, note }` — recurring devices that belong to this brand. |

## `messaging` — required

The chapter downstream tools read first. Be concrete here or the tools guess.

| field | notes |
|---|---|
| `intro` | Chapter summary. |
| `voice` | `{ primary, style }` — the register in one line, then how it behaves. |
| `avoid[]` / `prefer[]` | Short chips, three each. |
| `formula` | `{ pattern, example (**html**), guidance (**html**) }` — how a headline is built. |
| `claims[]` | `{ stat, label }`. **Only claims that are true.** Never invent a metric; if the brand has no numbers, use qualitative anchors instead. |
| `claimsLabel` | Heading for that row, e.g. `"What we talk about"`. |
| `headlines[]` | **html.** Real examples, in the brand's voice. |
| `dos[]` / `donts[]` | **html.** This is where hard bans belong — exact phrasings never to use. |

## `updatedAt`

ISO date. Bump it whenever the book changes.

---

## Validating

```bash
node -e "JSON.parse(require('fs').readFileSync('brand-book.json','utf8'));console.log('valid')"
node render.mjs
```

`render.mjs` checks `brand.name`, `brand.tagline`, `logo`, `colors`, `typography`, and
`messaging` before writing anything, and names the missing path if one is absent.
