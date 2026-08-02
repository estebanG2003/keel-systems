import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content, LANGS } from '../content.js';

// "AI" appears verbatim in French and Spanish writing too, so every language
// is checked against both the English and the localized form.
const BANNED = {
  en: [/\bAI\b/, /\bIA\b/, /automation agency/i, /\bsolutions?\b/i],
  fr: [/\bAI\b/, /\bIA\b/, /agence d'automatisation/i, /\bsolutions?\b/i],
  es: [/\bAI\b/, /\bIA\b/, /agencia de automatizaci/i, /\bsoluciones?\b/i],
};

function allStrings(langObj) {
  const out = [];
  const walk = (v) => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(langObj);
  return out;
}

test('every language is present', () => {
  assert.deepEqual(Object.keys(content).sort(), [...LANGS].sort());
});

test('every language has identical key structure', () => {
  const shape = (o) =>
    Object.keys(o).sort().map((k) =>
      Array.isArray(o[k]) ? `${k}[${o[k].length}]` : k
    ).join(',');
  const reference = shape(content.en);
  for (const lang of LANGS) {
    assert.equal(shape(content[lang]), reference, `${lang} structure differs from en`);
  }
});

test('every language has exactly 6 triggers and 3 steps', () => {
  for (const lang of LANGS) {
    assert.equal(content[lang].triggers.length, 6, `${lang} trigger count`);
    assert.equal(content[lang].steps.length, 3, `${lang} step count`);
    for (const step of content[lang].steps) {
      assert.equal(typeof step.title, 'string');
      assert.equal(typeof step.body, 'string');
    }
  }
});

test('no string is empty or whitespace-only', () => {
  for (const lang of LANGS) {
    for (const s of allStrings(content[lang])) {
      assert.ok(s.trim().length > 0, `${lang} has an empty string`);
    }
  }
});

test('no banned marketing words', () => {
  for (const lang of LANGS) {
    for (const s of allStrings(content[lang])) {
      for (const pattern of BANNED[lang]) {
        assert.ok(!pattern.test(s), `${lang} copy matches banned ${pattern}: "${s}"`);
      }
    }
  }
});

test('no statistics', () => {
  for (const lang of LANGS) {
    for (const s of allStrings(content[lang])) {
      assert.ok(!/\d+\s?%/.test(s), `${lang} copy contains a percentage: "${s}"`);
    }
  }
});

// Stronger than the percentage check above: any digit at all is banned, so
// "Thirty minutes" cannot quietly become "30 minutes" and no figure, price or
// statistic can enter the copy in any notation.
test('no numerals or currency symbols anywhere in copy', () => {
  for (const lang of LANGS) {
    for (const s of allStrings(content[lang])) {
      assert.ok(!/\d/.test(s), `${lang} copy contains a numeral: "${s}"`);
      assert.ok(!/[$€£¢]/.test(s), `${lang} copy contains a currency symbol: "${s}"`);
    }
  }
});

test('no em dashes', () => {
  for (const lang of LANGS) {
    for (const s of allStrings(content[lang])) {
      assert.ok(!s.includes('—'), `${lang} copy contains an em dash: "${s}"`);
    }
  }
});
