# Keel Systems

Static trilingual (EN / FR / ES) single-page site. No dependencies, no build step, no external requests.

## Structure

- `content.js` — all page copy, keyed by language. **Single source of truth.**
- `config.js` — contact details.
- `app.js` — renders the page from `content.js` and handles the language toggle.
- `index.html` — shell, inline styles, and a static fallback so the page still says something with no JavaScript.
- `og.png` — social preview card.

## Tests

```
node --test
```

Run from the repo root. Note the bare form: `node --test test/` fails on Node 24.

The suite checks structural parity across the three languages, enforces the copy rules (no numerals, no banned marketing words, no em dashes), verifies the static fallback in `index.html` has not drifted from `content.js`, and drives real headless Chrome to confirm every string renders and that switching language fully replaces the previous one. Set `CHROME_PATH` if Chrome is not in a standard location.

## Deploy

Pushed to `main`, served by GitHub Pages from the repo root.
