# jophotos

Black-and-white photography portfolio for Joyal Johnson (Jo), published as `callmejo`.

A plain static site with no build step or dependencies:

- `index.html` — page structure
- `styles.css` — styling (responsive: 3 / 4 / 5 photos per row on mobile / tablet / desktop)
- `script.js` — tabs, bio expand, share, photo lightbox, enquiry form

Fonts (Fraunces, Work Sans, IBM Plex Mono) load from Google Fonts.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploy

Pushing to `main` deploys the site to GitHub Pages via `.github/workflows/static.yml`.

## Notes

- The grid currently uses generated grayscale artwork as placeholders. To use real photos, replace each `<svg>` inside a `.grid-photo` figure in `index.html` with an `<img>` and keep the `data-*` attributes (title, genre, year, note) that feed the lightbox.
- The enquiry form is front-end only and does not send messages anywhere yet.
