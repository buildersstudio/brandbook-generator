import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (p) => readFileSync(root + p, "utf8");

describe("no licensed font is ever vendored", () => {
  // The README promises faces load from the brand's own domain. That is what
  // keeps an MIT repo redistributable while the brand uses a commercial face.
  test("the repo ships no font files", async () => {
    const { execFileSync } = await import("node:child_process");
    const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" });
    const fonts = tracked.split("\n").filter((f) => /\.(otf|ttf|woff2?)$/.test(f));
    assert.deepEqual(fonts, [], `font files are committed: ${fonts.join(", ")}`);
  });

  test("declared faces are absolute URLs, not repo paths", () => {
    const book = JSON.parse(read("brand-book.json"));
    for (const face of book.fonts?.faces ?? []) {
      assert.match(face.url, /^https?:\/\//, `${face.family} is not an absolute URL`);
    }
  });
});

describe("the preview server stays local", () => {
  test("serve.sh binds loopback only", () => {
    const servers = read("serve.sh").split("\n").filter((l) => l.includes("http.server"));
    assert.ok(servers.length > 0, "serve.sh starts no server");
    for (const line of servers) assert.match(line, /--bind 127\.0\.0\.1/);
  });

  test("serve.sh picks and remembers a high port", () => {
    const src = read("serve.sh");
    assert.match(src, /\.dev-port/, "port is not remembered");
    assert.match(src, /20000/, "no high base port");
    assert.match(src, /RANDOM/, "port is not randomised");
    assert.match(src, /lsof/, "port is never probed");
  });

  test("serve.sh is executable", () => {
    assert.ok(statSync(root + "serve.sh").mode & 0o111);
  });

  test(".dev-port is git-ignored", () => {
    assert.match(read(".gitignore"), /^\.dev-port$/m);
  });
});

describe("the skill is loadable", () => {
  const skill = ".claude/skills/build-brandbook.md";

  test("it exists", () => assert.ok(existsSync(root + skill)));

  test("its frontmatter parses and carries a name", () => {
    const src = read(skill);
    assert.match(src, /^---\n/, "no frontmatter block");
    const front = src.split("---")[1] ?? "";
    assert.match(front, /^name:\s*\S+/m, "no name");
  });

  test("its description is long enough to route on", () => {
    // A one-word description means the skill never triggers.
    const front = read(skill).split("---")[1] ?? "";
    const description = /^description:\s*(.+)$/m.exec(front)?.[1] ?? "";
    assert.ok(description.length > 80, `description is only ${description.length} chars`);
  });
});

describe("repo standard", () => {
  for (const file of ["LICENSE", "README.md", "AGENTS.md", "CLAUDE.md", "schema.md", "PUBLISH.md"]) {
    test(`${file} is present`, () => assert.ok(existsSync(root + file)));
  }

  test("CLAUDE.md imports AGENTS.md rather than duplicating it", () => {
    // Two real files always drift; the import cannot.
    assert.match(read("CLAUDE.md").trim(), /^@AGENTS\.md$/);
  });

  test("LICENSE is MIT and names the studio", () => {
    const src = read("LICENSE");
    assert.match(src, /MIT License/);
    assert.match(src, /Builders Studio/);
  });

  test("schema.md documents every top-level key of brand-book.json", () => {
    const book = JSON.parse(read("brand-book.json"));
    const schema = read("schema.md");
    const undocumented = Object.keys(book).filter((k) => !schema.includes(k));
    assert.deepEqual(undocumented, [], `undocumented: ${undocumented.join(", ")}`);
  });
});
