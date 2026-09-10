import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content, LANGS } from '../content.js';

// "AI" appears verbatim in French and Spanish writing too, so every language
// is checked against both the English and the localized form.
const BANNED = {
  en: [/automation agency/i, /\bsolutions?\b/i],
  fr: [/agence d'automatisation/i, /\bsolutions?\b/i],
  es: [/agencia de automatizaci/i, /\bsoluciones?\b/i],
};

// AI/IA moved out of BANNED on 2026-08-02 (decision #8b: "never in the hero or the
// triggers, exactly once in the build step"). Widened to #8c on 2026-09-09 when the page
// went cold-traffic and fired gate 2 in BRIEF.md: with no referrer granting attention,
// "AI audit" is the term a stranger searches, so step 1 names it too.
//
// #8c: never in the hero or the triggers. Exactly once in the audit step (steps[0]) and
// exactly once in the build step (steps[1]), phrased as what it DOES, never as a category.
// All three halves are enforced below. Deleting any of them re-opens the drift they stop.
const AI_WORDS = /\b(AI|IA)\b/g;

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

test('AI/IA appears nowhere outside the audit and build steps', () => {
  for (const lang of LANGS) {
    const allowed = new Set([
      content[lang].steps[0].title,
      content[lang].steps[0].body,
      content[lang].steps[1].body,
    ]);
    for (const s of allStrings(content[lang])) {
      if (allowed.has(s)) continue;
      assert.ok(
        !new RegExp(AI_WORDS.source).test(s),
        `${lang}: AI/IA outside the audit and build steps, violating decision #8c: "${s}"`,
      );
    }
  }
});

test('AI/IA appears exactly once across the audit step', () => {
  for (const lang of LANGS) {
    const step = content[lang].steps[0];
    const hits = ((step.title + ' ' + step.body).match(AI_WORDS) || []).length;
    assert.equal(
      hits,
      1,
      `${lang}: audit step must name AI/IA exactly once (found ${hits}) - it is what a cold reader searches for, and twice makes it a category label`,
    );
  }
});

test('AI/IA appears exactly once, inside the build step', () => {
  for (const lang of LANGS) {
    const body = content[lang].steps[1].body;
    const hits = (body.match(AI_WORDS) || []).length;
    assert.equal(
      hits,
      1,
      `${lang}: build step must name AI/IA exactly once (found ${hits}) — one mention is the capability claim, more is the commodity claim`,
    );
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
