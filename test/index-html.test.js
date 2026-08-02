import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { content, LANGS } from '../content.js';
import { contact } from '../config.js';

// There are three entry shells: / (English), /fr/ and /es/. They exist so a
// forwarded link previews with a card in the recipient's language, since
// OpenGraph tags cannot vary by viewer and the crawler that renders the
// preview has no language of its own.
//
// Each shell hand-copies its hero copy and meta description from content.js
// so crawlers and no-JS visitors get real text instead of an empty body.
// That duplication is the whole risk these tests exist to catch: if a shell
// and content.js ever disagree, one of these fails.

const ROOT = resolve(import.meta.dirname, '..');
const BASE = 'https://estebang2003.github.io/keel-systems/';

const SHELLS = {
  en: { file: 'index.html', url: BASE, image: `${BASE}og.png`, locale: 'en_CA', declaresLang: false },
  fr: { file: 'fr/index.html', url: `${BASE}fr/`, image: `${BASE}og-fr.png`, locale: 'fr_CA', declaresLang: true },
  es: { file: 'es/index.html', url: `${BASE}es/`, image: `${BASE}og-es.png`, locale: 'es_CO', declaresLang: true },
};

const html = (lang) => readFileSync(resolve(ROOT, SHELLS[lang].file), 'utf8');
const meta = (h, re) => { const m = h.match(re); return m && m[1]; };

for (const lang of LANGS) {
  const shell = SHELLS[lang];
  const c = content[lang];

  test(`${lang}: shell exists`, () => {
    assert.ok(existsSync(resolve(ROOT, shell.file)), `missing ${shell.file}`);
  });

  test(`${lang}: static fallback headline and sub match content.${lang} exactly`, () => {
    const h = html(lang);
    assert.ok(h.includes(c.heroHeadline), `heroHeadline not verbatim in ${shell.file}`);
    assert.ok(h.includes(c.heroSub), `heroSub not verbatim in ${shell.file}`);
  });

  test(`${lang}: static fallback CTA label matches content.${lang}`, () => {
    assert.ok(html(lang).includes(`>${c.ctaLabel}</a>`), `ctaLabel not verbatim in ${shell.file}`);
  });

  test(`${lang}: meta and og descriptions match content.${lang}.heroSub`, () => {
    const h = html(lang);
    assert.equal(meta(h, /<meta name="description" content="([^"]*)">/), c.heroSub);
    assert.equal(meta(h, /<meta property="og:description" content="([^"]*)">/), c.heroSub);
  });

  test(`${lang}: og:url, og:image and og:locale are correct for this shell`, () => {
    const h = html(lang);
    assert.equal(meta(h, /<meta property="og:url" content="([^"]*)">/), shell.url);
    assert.equal(meta(h, /<meta property="og:image" content="([^"]*)">/), shell.image);
    assert.equal(meta(h, /<meta property="og:locale" content="([^"]*)">/), shell.locale);
  });

  test(`${lang}: preview image file exists`, () => {
    const name = shell.image.slice(BASE.length);
    assert.ok(existsSync(resolve(ROOT, name)), `missing ${name}; a forward would preview with no thumbnail`);
  });

  test(`${lang}: carries static language buttons for the no-JS case`, () => {
    const h = html(lang);
    for (const l of LANGS) {
      assert.match(h, new RegExp(`<button[^>]*data-lang="${l}"`),
        `${shell.file} is missing the ${l} button; a JS load failure would strand the reader`);
    }
  });

  test(`${lang}: twitter:card is summary_large_image`, () => {
    assert.equal(meta(html(lang), /<meta name="twitter:card" content="([^"]*)">/), 'summary_large_image');
  });

  test(`${lang}: declares hreflang alternates for all three languages`, () => {
    const h = html(lang);
    for (const l of LANGS) {
      assert.match(h, new RegExp(`hreflang="${l}"`), `${shell.file} missing hreflang=${l}`);
    }
  });

  // Only /fr/ and /es/ pin a language. The root deliberately does not, so a
  // returning visitor's saved choice still wins there.
  test(`${lang}: data-initial-lang is ${shell.declaresLang ? `"${lang}"` : 'absent on the root'}`, () => {
    const declared = meta(html(lang), /<html[^>]*data-initial-lang="([^"]*)"/);
    if (shell.declaresLang) assert.equal(declared, lang);
    else assert.equal(declared, null, 'root shell must not pin a language');
  });

  test(`${lang}: contact links are present and the mailto is not percent-encoded`, () => {
    const h = html(lang);
    assert.ok(h.includes(`mailto:${contact.email}`), `${shell.file} missing plain mailto`);
    assert.ok(h.includes(contact.whatsapp), `${shell.file} missing WhatsApp number`);
  });

  test(`${lang}: stylesheet and app script resolve from this shell's depth`, () => {
    const h = html(lang);
    const prefix = shell.file.includes('/') ? '../' : './';
    assert.ok(h.includes(`href="${prefix}style.css"`), `${shell.file} has a wrong stylesheet path`);
    assert.ok(h.includes(`src="${prefix}app.js"`), `${shell.file} has a wrong app.js path`);
  });
}

test('every shell shares one stylesheet, so styling cannot drift between them', () => {
  assert.ok(existsSync(resolve(ROOT, 'style.css')), 'style.css missing');
  for (const lang of LANGS) {
    assert.ok(!/<style[\s>]/.test(html(lang)), `${SHELLS[lang].file} has inline <style>; styling would drift`);
  }
});
