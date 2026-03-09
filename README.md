# Thomas Blessley • Photography

A static replica of [blessley.co.uk](https://www.blessley.co.uk/), with the same structure and content, ready for you to update and add your images.

## Structure

- **`index.html`** — Home: “blessley photography” + nav (about, locations) + album list
- **`about.html`** — Bio, Bark/tommb.com links, contact (Instagram, email)
- **`locations.html`** — List of all locations (city + year) linking to albums
- **`albums/*.html`** — One page per city (e.g. `amsterdam.html`, `bilbao.html`) with breadcrumb, sidebar album list, and photo grid
- **`css/style.css`** — Shared typography and layout (light background, serif titles, responsive grid)
- **`images/`** — Image assets in subfolders:
  - **`images/albums/{city}/`** — One folder per city (e.g. `amsterdam`, `bilbao`, `tallin`). Put that city’s photos inside; filenames can be `{city}-01.jpg`, `{city}-02.jpg` or descriptive (e.g. `deflated-rabbits.jpg`). Album pages reference `../images/albums/{city}/…`.
  - **`images/flags/`** — Country flag SVGs (e.g. `flag-spain.svg`, `flag-estonia.svg`) for optional use in nav.
  - **`images/navigation/`** — Icons (e.g. `icon-email.svg`, `link-instagram.svg`, `next-arrow.svg`) for optional use in the UI.
  - **Note:** The Tallinn album uses folder name `tallin` (one “n”); files inside are named `tallinn-01.jpg`, etc.

## Updates included

- **Footer year** — Uses JavaScript so the copyright year updates automatically (no more “©2023”).
- **Locations page** — The live site returns 404 for `/locations.html`; this version has a working locations page that lists all cities and links to each album.
- **Responsive layout** — Album pages use a sidebar on larger screens and stack on smaller ones.
- **Semantic HTML** — Clear structure and accessibility (titles, nav, main, footer).

## Adding or changing photos

1. Add image files into the right city folder under `images/albums/{city}/` (e.g. `images/albums/amsterdam/`, `images/albums/bilbao/`). Use either numbered names (`amsterdam-01.jpg`) or descriptive names (`deflated-rabbits.jpg`).
2. In the relevant album page (e.g. `albums/amsterdam.html`), add a new `<figure><img src="../images/albums/{city}/filename.jpg" alt="Caption"><figcaption>Caption</figcaption></figure>` for each new image, or edit existing ones. Captions are derived from the filename (hyphens become spaces, title case) unless you change them in the HTML.

## Running locally

Open `index.html` in a browser, or use a simple static server, e.g.:

```bash
# Python
python3 -m http.server 8000

# or npx
npx serve .
```

Then visit `http://localhost:8000`.
