import { content, LANGS } from './content.js';
import { contact } from './config.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function render(doc, lang) {
  const c = content[lang];
  doc.documentElement.lang = c.htmlLang;
  doc.title = c.title;

  const wa = `https://wa.me/${contact.whatsapp}`;
  const mail = `mailto:${contact.email}`;

  doc.getElementById('app').innerHTML = `
    <h1>${esc(c.heroHeadline)}</h1>
    <p class="sub">${esc(c.heroSub)}</p>

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
      <h2>${esc(c.aboutHeading)}</h2>
      ${c.aboutParas.map((p) => `<p>${esc(p)}</p>`).join('')}
      <div class="cta">
        <a class="primary" href="${wa}">${esc(c.ctaLabel)}</a>
        <a class="secondary" href="${mail}">${esc(contact.email)}</a>
      </div>
    </section>
  `;

  doc.querySelectorAll('#langbar button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
}

function pickInitial(win) {
  const stored = win.localStorage.getItem('keelLang');
  if (LANGS.includes(stored)) return stored;
  const nav = (win.navigator.language || '').slice(0, 2);
  if (LANGS.includes(nav)) return nav;
  return 'en';
}

export function init(doc, win) {
  const bar = doc.getElementById('langbar');
  bar.innerHTML = LANGS.map((l) =>
    `<button type="button" data-lang="${l}" aria-pressed="false">${content[l].label}</button>`
  ).join('');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-lang]');
    if (!btn) return;
    win.localStorage.setItem('keelLang', btn.dataset.lang);
    render(doc, btn.dataset.lang);
  });

  render(doc, pickInitial(win));
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  init(document, window);
}
