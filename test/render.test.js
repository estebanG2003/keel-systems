import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { content, LANGS } from '../content.js';

const CHROME = process.env.CHROME_PATH ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = resolve(import.meta.dirname, '..');

function renderedText(lang) {
  const dir = mkdtempSync(join(tmpdir(), 'keel-'));
  const harness = `
    <!doctype html><html><head><meta charset="utf-8"></head>
    <body><nav id="langbar"></nav><main id="app"></main>
    <script type="module">
      import { render } from 'file:///${ROOT.replace(/\\/g, '/')}/app.js';
      render(document, '${lang}');
      document.title = 'READY';
    </script></body></html>`;
  const file = join(dir, 'h.html');
  writeFileSync(file, harness, 'utf8');
  const out = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    '--virtual-time-budget=3000', '--dump-dom', `file:///${file.replace(/\\/g, '/')}`,
  ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  return out;
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

  test(`${lang}: no other language's headline leaks through`, () => {
    const dom = renderedText(lang);
    for (const other of LANGS.filter((l) => l !== lang)) {
      const needle = content[other].heroHeadline.slice(0, 25);
      if (needle === content[lang].heroHeadline.slice(0, 25)) continue;
      assert.ok(!dom.includes(needle), `${lang} render leaked ${other} headline`);
    }
  });
}
