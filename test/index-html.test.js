import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { content } from '../content.js';
import { contact } from '../config.js';

// index.html carries a static no-JS/pre-render fallback (inside #app) plus
// meta/OG tags, both hand-copied from content.en so crawlers and no-JS
// visitors see real copy instead of an empty <body>. That duplicates strings
// content.js already owns. These tests are the guard against that copy
// silently drifting from content.en: if either file changes without the
// other, one of these assertions fails.

const HTML = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf8');
const en = content.en;

test('index.html static fallback headline matches content.en exactly', () => {
  assert.ok(
    HTML.includes(en.heroHeadline),
    `content.en.heroHeadline not found verbatim in index.html: "${en.heroHeadline}"`
  );
});

test('index.html static fallback hero sub matches content.en exactly', () => {
  assert.ok(
    HTML.includes(en.heroSub),
    `content.en.heroSub not found verbatim in index.html: "${en.heroSub}"`
  );
});

test('index.html static fallback CTA label matches content.en exactly', () => {
  assert.ok(
    HTML.includes(`>${en.ctaLabel}</a>`),
    `content.en.ctaLabel not found verbatim in the static fallback: "${en.ctaLabel}"`
  );
});

test('index.html carries static language buttons for the no-JS case', () => {
  for (const lang of ['en', 'fr', 'es']) {
    assert.match(
      HTML,
      new RegExp(`<button[^>]*data-lang="${lang}"`),
      `static langbar is missing the ${lang} button; a JS load failure would strand non-English readers`
    );
  }
});

test('index.html static fallback includes both contact links', () => {
  assert.ok(
    HTML.includes(`mailto:${contact.email}`),
    'static fallback is missing a plain (non-percent-encoded) mailto link'
  );
  assert.ok(
    HTML.includes(contact.whatsapp),
    'static fallback is missing the WhatsApp contact number'
  );
});

test('meta description matches content.en.heroSub exactly', () => {
  const match = HTML.match(/<meta name="description" content="([^"]*)">/);
  assert.ok(match, 'no <meta name="description"> tag found');
  assert.equal(match[1], en.heroSub);
});

test('og:title is "Keel Systems"', () => {
  const match = HTML.match(/<meta property="og:title" content="([^"]*)">/);
  assert.ok(match, 'no og:title tag found');
  assert.equal(match[1], 'Keel Systems');
});

test('og:description matches content.en.heroSub exactly', () => {
  const match = HTML.match(/<meta property="og:description" content="([^"]*)">/);
  assert.ok(match, 'no og:description tag found');
  assert.equal(match[1], en.heroSub);
});

test('og:type is "website"', () => {
  const match = HTML.match(/<meta property="og:type" content="([^"]*)">/);
  assert.ok(match, 'no og:type tag found');
  assert.equal(match[1], 'website');
});

test('og:locale tag is present', () => {
  assert.match(HTML, /<meta property="og:locale" content="[^"]+">/);
});

// summary_large_image, not summary: an og:image now exists, and the preview
// card is the first thing a recipient sees when this link is forwarded.
test('twitter:card is "summary_large_image"', () => {
  const match = HTML.match(/<meta name="twitter:card" content="([^"]*)">/);
  assert.ok(match, 'no twitter:card tag found');
  assert.equal(match[1], 'summary_large_image');
});

test('og:image and og:url are present and same-origin', () => {
  const img = HTML.match(/<meta property="og:image" content="([^"]*)">/);
  const url = HTML.match(/<meta property="og:url" content="([^"]*)">/);
  assert.ok(img, 'no og:image tag found; a forwarded link would preview with no thumbnail');
  assert.ok(url, 'no og:url tag found');
  assert.ok(
    img[1].startsWith(url[1]),
    `og:image must be served from the same origin as the page: ${img[1]}`
  );
});
