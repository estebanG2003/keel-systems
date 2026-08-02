import { content, LANGS } from './content.js';
import { contact } from './config.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function render(doc, lang) {
  const c = content[lang];
  doc.documentElement.lang = c.htmlLang;
  doc.title = c.title;

  const wa = `https://wa.me/${encodeURIComponent(contact.whatsapp)}`;
  const mail = `mailto:${contact.email}`;

  const ctaBlock = `
    <div class="cta">
      <a class="primary" href="${esc(wa)}">${esc(c.ctaLabel)}</a>
      <a class="secondary" href="${esc(mail)}">${esc(contact.email)}</a>
    </div>`;

  doc.getElementById('app').innerHTML = `
    <div class="hero">
      <h1>${esc(c.heroHeadline)}</h1>
      <p class="sub">${esc(c.heroSub)}</p>
      ${ctaBlock}
    </div>

    <section>
      <h2>${esc(c.triggersHeading)}</h2>
      <ul class="triggers">
        ${c.triggers.map((t) => `<li>${esc(t)}</li>`).join('')}
      </ul>
      <p class="close">${esc(c.triggersClose)}</p>
    </section>

    <section>
      <h2>${esc(c.howHeading)}</h2>
      <ol class="steps">
        ${c.steps.map((s) =>
          `<li><span class="t">${esc(s.title)}</span><span class="b">${esc(s.body)}</span></li>`
        ).join('')}
      </ol>
    </section>

    <section>
      <h2>${esc(c.proofHeading)}</h2>
      <ul class="proof">
        ${c.proofItems.map((p) =>
          `<li><span class="t">${esc(p.title)}</span><span class="b">${esc(p.body)}</span></li>`
        ).join('')}
      </ul>
    </section>

    <section>
      <h2>${esc(c.aboutHeading)}</h2>
      ${c.aboutParas.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${ctaBlock}
    </section>
  `;

  doc.querySelectorAll('#langbar button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
}

function pickInitial(win) {
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

  render(doc, pickInitial(win));
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  init(document, window);
}
