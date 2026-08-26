# Publishing your brandbook

The book works fine on localhost, but it is only useful to the **other tools** once it has a
public URL: the Post Generator and everything else in the
[Builders toolkit](https://toolkit.builders.studio) read your published book as their source of
truth. One link, and every tool knows your brand.

Nothing here happens automatically. Publishing is your call — run these yourself, or ask Claude
to walk you through them.

## Local preview

```bash
./serve.sh
```

Serves the book at http://localhost:4611. Ctrl-C to stop.

## Option A — Vercel (recommended)

Fastest path to a real URL, and it redeploys on every push.

```bash
npm i -g vercel
vercel
```

Accept the defaults: no build command, and the output directory is the repo root. You get a
`*.vercel.app` URL immediately, and `vercel --prod` promotes it.

To use your own domain, add it in the Vercel dashboard under **Settings → Domains**.

## Option B — GitHub Pages

Free and needs no extra account, since the book is already a static site in a repo.

1. Push your book to a GitHub repo of your own.
2. **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site appears at `https://<you>.github.io/<repo>/` within a minute or two.

Pages serves from the repo root, which is exactly where `render.mjs` writes.

## Before you publish

- Re-render, so the site matches the JSON: `node render.mjs`
- Check the fonts load from the public URL too — a licensed face served from your own domain
  needs `access-control-allow-origin` open.
- Decide whether the repo should be public. The book contains your brand, not your secrets, but
  that is still your call.
- If your book is private, the other toolkit tools cannot read it. A public brandbook is the
  point.

## Telling the toolkit about it

Once it is live, give the URL to the other tools — they take a brandbook link as input. Keep the
URL stable: re-render and redeploy to the same place rather than publishing a new link each time.
