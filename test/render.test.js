import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { content, LANGS } from '../content.js';
import { contact } from '../config.js';

const CHROME = process.env.CHROME_PATH ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = resolve(import.meta.dirname, '..');
const APP_URL = `file:///${ROOT.replace(/\\/g, '/')}/app.js`;

// Every mkdtempSync'd harness dir is recorded here and removed once, after
// the whole file's tests finish, instead of being left behind. Without this,
// each render/toggle test call leaks one `keel-*` dir into the OS temp
// folder per run.
const tempDirs = [];
after(() => {
  for (const dir of tempDirs) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup; nothing actionable if this fails
    }
  }
});

function dumpDom(harness) {
  const dir = mkdtempSync(join(tmpdir(), 'keel-'));
  tempDirs.push(dir);
  const file = join(dir, 'h.html');
  writeFileSync(file, harness, 'utf8');
  return execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    '--virtual-time-budget=3000', '--dump-dom', `file:///${file.replace(/\\/g, '/')}`,
  ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
}

function renderedText(lang) {
  return dumpDom(`
    <!doctype html><html><head><meta charset="utf-8"></head>
    <body><nav id="langbar"></nav><main id="app"></main>
    <script type="module">
      import { render } from '${APP_URL}';
      render(document, '${lang}');
      document.title = 'READY';
    </script></body></html>`);
}

// Drives the page's actual toggle path instead of calling render() twice:
// importing app.js with no bindings still runs its top-level init(document,
// window) side effect (wires up #langbar's buttons and does the first
// render), and clicking a real button exercises the same code path a user
// triggers, including the aria-pressed bookkeeping. We click through `langs`
// in order, so the final DOM reflects whatever render() left behind after
// each toggle.
function renderedAfterClicks(langs) {
  const clicks = langs
    .map((l) => `document.querySelector('#langbar button[data-lang="${l}"]').click();`)
    .join('\n      ');
  return dumpDom(`
    <!doctype html><html><head><meta charset="utf-8"></head>
    <body><nav id="langbar"></nav><main id="app"></main>
    <script type="module">
      import '${APP_URL}';
      ${clicks}
      document.title = 'READY';
    </script></body></html>`);
}

function assertLangContentPresent(dom, lang) {
  const c = content[lang];
  assert.ok(dom.includes(c.heroHeadline), `${lang} headline missing`);
  for (const [i, t] of c.triggers.entries()) {
    assert.ok(dom.includes(t), `${lang} trigger[${i}] missing`);
  }
  for (const [i, s] of c.steps.entries()) {
    assert.ok(dom.includes(s.title), `${lang} step[${i}] title missing`);
  }
  for (const [i, p] of c.aboutParas.entries()) {
    assert.ok(dom.includes(p), `${lang} about paragraph[${i}] missing`);
  }
}

// Asserts none of `staleLang`'s user-visible content is present in `dom`
// (a render of `presentLang`). Covers headline, triggers, step titles and
// about paragraphs — not just the headline — so a leaked trigger, step or
// about-paragraph is actually caught.
//
// The headline check keeps the original 25-char prefix comparison (matching
// what content.test.js's copy-rule checks assume elsewhere), but a review
// found today's content has no prefix collisions between languages; if a
// future headline edit ever creates one, the old code silently `continue`d
// past that pair instead of checking it. Fail loudly instead: a collision
// means the prefix can no longer distinguish the two languages, which is a
// bug in the check itself, not something to skip quietly. Triggers, step
// titles and about paragraphs are compared as full strings instead of
// prefixes (none of this content contains &, <, >, or " — the characters
// esc() escapes — so a full-string match round-trips cleanly through the
// HTML and is strictly more precise than a truncated one).
function assertLangContentAbsent(dom, presentLang, staleLang) {
  const own = content[presentLang];
  const stale = content[staleLang];

  const ownHeadlinePrefix = own.heroHeadline.slice(0, 25);
  const staleHeadlinePrefix = stale.heroHeadline.slice(0, 25);
  assert.notEqual(
    staleHeadlinePrefix, ownHeadlinePrefix,
    `${presentLang}/${staleLang} headlines share a 25-char prefix ` +
    `("${staleHeadlinePrefix}") — this slice can no longer tell them apart, ` +
    `widen it instead of trusting a check that can't distinguish the two`
  );
  assert.ok(!dom.includes(staleHeadlinePrefix), `${staleLang} headline leaked into ${presentLang} render`);

  for (const [i, t] of stale.triggers.entries()) {
    assert.ok(!dom.includes(t), `${staleLang} trigger[${i}] leaked into ${presentLang} render`);
  }
  for (const [i, s] of stale.steps.entries()) {
    assert.ok(!dom.includes(s.title), `${staleLang} step[${i}] title leaked into ${presentLang} render: "${s.title}"`);
  }
  for (const [i, p] of stale.aboutParas.entries()) {
    assert.ok(!dom.includes(p), `${staleLang} about paragraph[${i}] leaked into ${presentLang} render`);
  }
}

for (const lang of LANGS) {
  test(`${lang}: every trigger and step renders`, () => {
    const dom = renderedText(lang);
    for (const t of content[lang].triggers) {
      const needle = t.slice(0, 25);
      assert.ok(dom.includes(needle), `${lang} missing trigger: ${needle}`);
    }
    for (const s of content[lang].steps) {
      assert.ok(dom.includes(s.title), `${lang} missing step title: ${s.title}`);
    }
    assert.ok(dom.includes(content[lang].heroHeadline.slice(0, 25)), `${lang} missing headline`);
  });

  test(`${lang}: no other language's content leaks through`, () => {
    const dom = renderedText(lang);
    for (const other of LANGS.filter((l) => l !== lang)) {
      assertLangContentAbsent(dom, lang, other);
    }
  });
}

// GAP: the toggle is the page's only interactive feature, and a stale node
// the renderer forgot to clear is only observable by actually toggling —
// every test above renders exactly once onto a fresh document, so that bug
// class was structurally uncatchable. Drive the real click path for every
// ordered pair of languages (not just one direction) so a bug that only
// shows up going one way (e.g. a node cleared on the way to 'en' but not on
// the way to 'fr') can't hide behind an untested direction.
const TOGGLE_PAIRS = LANGS.flatMap((a) => LANGS.filter((b) => b !== a).map((b) => [a, b]));

// Regression guard for the mailto encodeURIComponent bug (commit c7c126c):
// encodeURIComponent(contact.email) percent-encodes the structural '@'
// delimiter into '%40', producing a mailto URI with no domain. Assert the
// real rendered href in the DOM is exactly `mailto:` + the plain email,
// with no percent-encoding, so that regression can't come back unnoticed.
test('rendered mailto href is not percent-encoded', () => {
  const dom = renderedText('en');
  const match = dom.match(/class="secondary" href="([^"]*)"/);
  assert.ok(match, 'secondary (mailto) link not found in rendered DOM');
  assert.equal(match[1], `mailto:${contact.email}`);
  assert.ok(!match[1].includes('%40'), 'mailto href is percent-encoded');
});

for (const [from, to] of TOGGLE_PAIRS) {
  test(`toggle ${from} -> ${to}: stale ${from} content is fully replaced`, () => {
    const dom = renderedAfterClicks([from, to]);
    assertLangContentPresent(dom, to);
    assertLangContentAbsent(dom, to, from);
    assert.ok(
      dom.includes(`data-lang="${to}" aria-pressed="true"`),
      `${to} button not marked aria-pressed after toggle`
    );
    assert.ok(
      dom.includes(`data-lang="${from}" aria-pressed="false"`),
      `${from} button still marked aria-pressed after toggling away from it`
    );
  });
}
