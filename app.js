import { content, LANGS } from './content.js';
import { contact } from './config.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Presentation only, deliberately NOT in content.js. Place names, language
// codes and digits read the same in all three languages, so putting them here
// keeps the translatable copy untouched and the parity tests meaningful.
const LOCALE_LINE =
  'Gatineau <span class="sep">/</span> Ottawa <span class="sep">/</span> ' +
  'EN <span class="sep">&middot;</span> FR <span class="sep">&middot;</span> ES';

const WA_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
  '<path d="M12 2a10 10 0 0 0-8.7 15l-1.3 5 5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.1c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.5-.3.3c-.1.1-.2.3 0 .5.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.4.2.1.4.1.5-.1l.8-1c.2-.2.3-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.5Z"/></svg>';

export function render(doc, lang) {
  const c = content[lang];
  doc.documentElement.lang = c.htmlLang;
  doc.title = c.title;

  const wa = `https://wa.me/${encodeURIComponent(contact.whatsapp)}`;
  const mail = `mailto:${contact.email}`;

  // The CTA label must sit flush against </a> with no whitespace: a shell test
  // asserts the exact substring `>LABEL</a>`, and the icon supplies the `>`.
  const ctaBlock = `
    <div class="cta">
      <a class="primary" href="${esc(wa)}">${WA_ICON}${esc(c.ctaLabel)}</a>
      <a class="secondary" href="${esc(mail)}">${esc(contact.email)}</a>
    </div>`;

  doc.getElementById('app').innerHTML = `
    <section class="hero">
      <div class="wrap">
        <p class="eyebrow">${LOCALE_LINE}</p>
        <h1>${esc(c.heroHeadline)}</h1>
        <p class="sub">${esc(c.heroSub)}</p>
        ${ctaBlock}
      </div>
    </section>

    <section class="triggers-sec">
      <div class="wrap">
        <p class="eyebrow"><span class="num">01</span></p>
        <h2>${esc(c.triggersHeading)}</h2>
        <p class="lead">${esc(c.triggersLead)}</p>
        <ul class="triggers">
          ${c.triggers.map((t) => `<li>${esc(t)}</li>`).join('')}
        </ul>
        <p class="close">${esc(c.triggersClose)}</p>
      </div>
    </section>

    <section class="how">
      <div class="wrap">
        <p class="eyebrow"><span class="num">02</span></p>
        <h2>${esc(c.howHeading)}</h2>
        <ol class="steps">
          ${c.steps.map((s, i) =>
            `<li><span class="n">0${i + 1}</span><div>` +
            `<span class="t">${esc(s.title)}</span>` +
            `<span class="b">${esc(s.body)}</span></div></li>`
          ).join('')}
        </ol>
      </div>
    </section>

    <section class="about">
      <div class="wrap">
        <p class="eyebrow"><span class="num">03</span></p>
        <h2>${esc(c.aboutHeading)}</h2>
        ${c.aboutParas.map((p) => `<p>${esc(p)}</p>`).join('')}
        ${ctaBlock}
      </div>
    </section>
  `;

  doc.querySelectorAll('#langbar button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
}

// Precedence: the page's own declared language, then a saved choice, then the
// browser, then English.
//
// The declared language wins on purpose. /fr/ and /es/ exist so a forwarded
// link previews with the right card, and whoever sent it chose that URL
// deliberately for that recipient. A stale localStorage value from some
// earlier visit must not override that intent. The root page declares
// nothing, so there a saved choice still wins.
function pickInitial(doc, win) {
  const declared = doc.documentElement.dataset.initialLang;
  if (LANGS.includes(declared)) return declared;

  let stored;
  try {
    stored = win.localStorage.getItem('keelLang');
  } catch {
    stored = undefined;
  }
  if (LANGS.includes(stored)) return stored;

  const nav = (win.navigator.language || '').slice(0, 2);
  if (LANGS.includes(nav)) return nav;
  return 'en';
}

export function init(doc, win) {
  const bar = doc.getElementById('langbar');
  bar.innerHTML = LANGS.map((l) =>
    `<button type="button" data-lang="${l}" aria-pressed="false">${esc(content[l].label)}</button>`
  ).join('');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-lang]');
    if (!btn) return;
    try {
      win.localStorage.setItem('keelLang', btn.dataset.lang);
    } catch {
      // Persistence is best-effort; the toggle still works this session.
    }
    render(doc, btn.dataset.lang);
  });

  render(doc, pickInitial(doc, win));
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  init(document, window);
}
