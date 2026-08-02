import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { content, LANGS } from '../content.js';

// Drives the REAL shells in a real browser, not a harness copy of them.
//
// What this protects: /fr/ and /es/ exist so a forwarded link previews with
// the right card AND opens in the right language. If pickInitial's precedence
// regressed, or a shell lost its data-initial-lang, the page would silently
// fall back to English and every French recipient would get an English page
// with no error anywhere.

const CHROME = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => existsSync(p)) || 'chrome';

const ROOT = resolve(import.meta.dirname, '..');
const SHELL = { en: 'index.html', fr: 'fr/index.html', es: 'es/index.html' };

function dump(relPath) {
  const url = `file:///${resolve(ROOT, relPath).replace(/\\/g, '/')}`;
  return execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    '--virtual-time-budget=4000', '--dump-dom', url,
  ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
}

for (const lang of LANGS) {
  test(`${SHELL[lang]} renders in ${lang}`, () => {
    const dom = dump(SHELL[lang]);
    const c = content[lang];

    // Headline and all six triggers must be the ones for THIS language.
    assert.ok(dom.includes(c.heroHeadline), `${lang} shell did not render its own headline`);
    for (const t of c.triggers) {
      assert.ok(dom.includes(t.slice(0, 30)), `${lang} shell missing a trigger: ${t.slice(0, 30)}`);
    }
    assert.ok(dom.includes(c.aboutHeading), `${lang} shell missing its about heading`);
  });

  test(`${SHELL[lang]} does not leak another language's headline`, () => {
    const dom = dump(SHELL[lang]);
    for (const other of LANGS.filter((l) => l !== lang)) {
      assert.notEqual(
        content[other].heroHeadline, content[lang].heroHeadline,
        `${lang} and ${other} share a headline; this check would be vacuous`
      );
      assert.ok(
        !dom.includes(content[other].heroHeadline),
        `${lang} shell leaked the ${other} headline`
      );
    }
  });
}

test('the localized shells pin their language; the root does not', () => {
  // A pinned shell must win over any saved preference, because whoever sent
  // that URL chose it deliberately for that recipient.
  assert.match(dump('fr/index.html'), /data-initial-lang="fr"/);
  assert.match(dump('es/index.html'), /data-initial-lang="es"/);
  assert.ok(!/data-initial-lang=/.test(dump('index.html')),
    'the root shell must not pin a language, or a returning visitor loses their choice');
});
