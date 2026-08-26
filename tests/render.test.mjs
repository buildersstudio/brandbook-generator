import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
let work;

before(() => { work = mkdtempSync(join(tmpdir(), "brandbook-")); });
after(() => rmSync(work, { recursive: true, force: true }));

/* Drives render.mjs the way a founder does, rather than importing its internals. */
function renderBook(book, name = "book.json") {
  const dataPath = join(work, name);
  const out = join(work, name.replace(/\.json$/, "-site"));
  writeFileSync(dataPath, JSON.stringify(book));
  execFileSync("node", [join(root, "render.mjs"), dataPath, "--out", out], {
    cwd: root, stdio: "pipe",
  });
  return {
    out,
    read: (f) => readFileSync(join(out, f), "utf8"),
    files: () => readdirSync(out),
  };
}

/* The smallest book render.mjs accepts: brand.name, brand.tagline, logo, colors,
   typography and messaging are all required up front. */
const minimal = {
  version: 1,
  brand: { name: "Acme", tagline: "We make things" },
  theme: { bg: "#111", ink: "#eee" },
  toc: [],
  logo: { rules: [] },
  colors: { groups: [] },
  typography: { faces: [] },
  messaging: { voice: [] },
};

describe("renderer", () => {
  test("renders a minimal brand book without throwing", () => {
    const site = renderBook(minimal);
    assert.ok(site.files().includes("index.html"));
    assert.match(site.read("index.html"), /Acme/);
  });

  test("escapes HTML in a value", () => {
    // A brand name is founder-supplied text, not markup.
    const site = renderBook(
      { ...minimal, brand: { ...minimal.brand, name: '<img src=x onerror=alert(1)>' } },
      "escape.json"
    );
    const html = site.read("index.html");
    assert.ok(!html.includes("<img src=x"), "raw tag survived into the page");
    assert.match(html, /&lt;img/);
  });

  test("refuses a book missing a required section, and names it", () => {
    // A readable failure beats a half-rendered site.
    const bad = { ...minimal };
    delete bad.colors;
    assert.throws(
      () => renderBook(bad, "missing.json"),
      (e) => /missing "colors"/.test(String(e.stderr ?? e))
    );
  });

  test("omits a section that carries no entries", () => {
    const site = renderBook(minimal, "sparse.json");
    // colors is present but empty, so no swatch should be invented.
    assert.ok(!/#[0-9a-f]{6}/i.test(site.read("colors.html")));
  });

  test("emits @font-face for each declared face, pointing at the given url", () => {
    const site = renderBook(
      {
        ...minimal,
        fonts: { faces: [{ family: "Acme Sans", url: "https://acme.example/a.woff2", format: "woff2" }] },
      },
      "fonts.json"
    );
    const html = site.read("index.html");
    assert.match(html, /@font-face/);
    assert.match(html, /Acme Sans/);
    assert.match(html, /https:\/\/acme\.example\/a\.woff2/);
  });

  test("never writes a font file into the output", () => {
    // The tool's promise is that licensed faces load from the brand's own
    // domain and are never vendored.
    const site = renderBook(
      { ...minimal, fonts: { faces: [{ family: "X", url: "https://x.example/x.otf", format: "opentype" }] } },
      "nofont.json"
    );
    const fonts = site.files().filter((f) => /\.(otf|ttf|woff2?)$/.test(f));
    assert.deepEqual(fonts, []);
  });

  test("is deterministic: rendering twice gives identical bytes", () => {
    const a = renderBook(minimal, "det-a.json");
    const b = renderBook(minimal, "det-b.json");
    assert.equal(a.read("index.html"), b.read("index.html"));
  });
});

describe("the committed site matches its source", () => {
  test("re-rendering brand-book.json reproduces every published page", () => {
    // If these drift, the repo is showing a page nobody can regenerate — the
    // failure mode that makes a generator rot into a hand-edited site.
    const out = join(work, "regen");
    execFileSync("node", [join(root, "render.mjs"), join(root, "brand-book.json"), "--out", out], {
      cwd: root, stdio: "pipe",
    });
    const pages = readdirSync(out).filter((f) => f.endsWith(".html"));
    assert.ok(pages.length >= 7, `only ${pages.length} pages rendered`);
    for (const page of pages) {
      assert.equal(
        readFileSync(join(out, page), "utf8"),
        readFileSync(join(root, page), "utf8"),
        `${page} differs from a fresh render`
      );
    }
  });
});
