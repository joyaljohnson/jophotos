# jophotos

Black-and-white photography portfolio for Joyal Johnson (Jo), published as `callmejo`.

A plain static site with no build step or dependencies:

- `index.html` — page structure
- `styles.css` — styling (responsive: 3 / 4 / 5 photos per row on mobile / tablet / desktop)
- `script.js` — tabs, bio expand, share, photo lightbox, enquiry form
- `intro.js` — the opening animation (camera zoom-out, camera placed in hand, circle drawn into the profile picture, typed name, dissolve into the site). It has a Skip button, can be dismissed with Esc, and is not shown to visitors who prefer reduced motion. Its images are `assets/intro/camera.png` and `assets/avatar.jpg`.

Fonts (Fraunces, Work Sans, IBM Plex Mono) load from Google Fonts.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploy

Pushing to `main` deploys the site to GitHub Pages via `.github/workflows/static.yml`.

## Notes

- Photos live in `assets/photos/` (`grey-spot-*` and `seasons-*`), taken from the Pinterest boards "Grey Spot" and "Seasons". Grey Spot is black and white; Seasons is shown in its original colour.
- To add a photo, drop the file in `assets/photos/` and add a `<figure class="grid-photo">` in `index.html` with `data-collection` (`grey-spot` or `seasons`), `data-title`, and optionally `data-note` (caption shown in the lightbox).
- The circles above the grid filter by collection; click the active one again to show everything.
- The enquiry form is front-end only and does not send messages anywhere yet.
