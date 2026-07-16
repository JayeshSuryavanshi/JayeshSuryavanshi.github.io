# jayeshsuryavanshi.com

Source for my personal portfolio site, **[www.jayeshsuryavanshi.com](https://www.jayeshsuryavanshi.com)** — served via GitHub Pages from this repo (custom domain in `CNAME`).

## Stack

Hand-built static site — HTML, CSS, and vanilla JS (with jQuery). No build step: the files here are what's deployed.

## Run locally

Clone and open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Structure

| Path | What it is |
|------|------------|
| `index.html` | The single-page site (intro, portfolio, resume, contact). |
| `css/` | Styles and fonts. |
| `images/` | Portfolio thumbnails, hero media, and Open Graph images. |
| `blog/` | Blog section. |
| `CNAME` | Custom-domain config for GitHub Pages. |

## Deploy

Pushing to the default branch triggers a GitHub Pages rebuild; the site is live at the custom domain within a minute or two.
