---
name: photos-site
description: Working rules for the blessley.co.uk photography site — a static HTML/CSS/JS portfolio of European city albums. Trigger any time the user is editing pages, adding or renaming photos, creating new album pages, regenerating the per-image `view.html` files, running the root-relative URL rewriter, committing to the `tommb/blessley` repo, or deploying to DreamHost over SFTP. Do NOT trigger for unrelated sites or generic static-site questions.
---

# Photos site — operating manual

Static photography portfolio at https://www.blessley.co.uk. Plain HTML + CSS + a single JS file; no build step. Hosted on DreamHost; deployed over SFTP.

## Repo

- Remote: `https://github.com/tommb/blessley.git` (GitHub: `tommb/blessley`)
- Default branch: `main`
- Workflow: commit directly to `main` with **plain-sentence commit messages** (no Conventional Commits prefix). Example: `Rename tallin folder to tallinn and update references`.
- One logical change per commit. Always `git status` and `git diff` before committing so you know exactly what's going in.
- Push after every commit so the working copy on GitHub stays in sync.

## Layout

```
index.html                       — home: thumbnail grid of all albums
about.html                       — bio + contact
locations.html                   — flat list of city/year links
albums/
  {city}.html                    — the album's photo-grid page (thumbnails → view.html#id)
  {city}/view.html               — single-image viewer (driven by window.IMAGES)
  {city}_grid.txt                — regeneration artifact (the grid HTML to paste into {city}.html)
css/style.css
js/image-view.js                 — powers view.html (prev/next, hash routing, context blocks)
images/
  albums/{city}/{city}-NN.jpg    — photos, zero-padded two-digit sequence
  navigation/*.svg
  flags/*.svg                    — (optional)
scripts/
  gen_views.py                   — regenerates view.html + {city}_grid.txt from images/
  root_relative_urls.py          — rewrites internal URLs to root-relative ("/…")
  deploy.sh                      — SFTP push to production (see "Deploying")
```

All internal URLs are **root-relative** (start with `/`), never `../`. If you hand-write a link, double-check, or run `python3 scripts/root_relative_urls.py` after edits.

## What's in git vs. what ships

`.gitignore` deliberately excludes:

- `images/`
- `albums/{city}/` (the per-city image subfolders)
- `*.png`, `*.gif`, `*.ico` (favicons and any raster at the repo root)

**Photos and favicons live only on disk and on the production server.** Pushing to GitHub is not a deploy — it only updates HTML/CSS/JS/scripts. Images reach production via `scripts/deploy.sh` (SFTP).

The working copy lives in iCloud Drive at `~/Library/Mobile Documents/com~apple~CloudDocs/Sites/Photos/Site`, which is the backup for the image files.

## Naming rules (strict)

- City folders and album pages: lowercase, full English name, no spaces. Example: `tallinn`, not `tallin` or `Tallinn`.
- Album HTML: `albums/{city}.html` + `albums/{city}/view.html`.
- Image files: `{city}-NN.jpg` where `NN` is zero-padded starting at `01`, or a descriptive slug in lowercase-kebab-case (e.g. `deflated-rabbits.jpg`, `arched-bridge.jpg`) for hand-curated albums. Numbered is the default; descriptive is allowed for albums not in `scripts/gen_views.py` ALBUMS (currently: `bilbao`, `tallinn`, `amsterdam`).
- `.jpg` extension (lowercase). Not `.jpeg` or `.JPG`.
- Image IDs used in `window.IMAGES` and URL hashes match the filename stem: `helsinki-17`, `deflated-rabbits`.
- Alt text and figcaption: `"{Capitalised City} {NN}"` or a short human description — never just the filename.

### Known drift — fix when you touch it

- `images/albums/tallin/` is spelled with one `n`. The album page (`albums/tallinn.html`), viewer (`albums/tallinn/view.html`), and files inside the folder (`tallinn-NN.jpg`) all already use two `n`'s. When you're next editing anything Tallinn-related, rename the folder `images/albums/tallin` → `images/albums/tallinn` and update any `src="/images/albums/tallin/…"` references (there's at least one in `index.html`). Commit as a standalone change: `Rename tallin folder to tallinn and update references`.

## Adding or changing photos

For a numbered album driven by `gen_views.py` (most albums):

1. Drop the new files into `images/albums/{city}/` named `{city}-NN.jpg` (continue the numbering; don't reuse numbers).
2. `python3 scripts/gen_views.py` — regenerates `albums/{city}/view.html` and `albums/{city}_grid.txt`.
3. Open `albums/{city}.html` and replace the existing `<div class="photo-grid"> … </div>` with the contents of the newly written `albums/{city}_grid.txt`.
4. `python3 scripts/root_relative_urls.py` — defensive sweep; should be a no-op if you stayed consistent.
5. Preview locally (see "Running locally").
6. Commit the HTML changes (images are gitignored; they'll ship via SFTP).
7. Deploy.

For hand-curated albums (`bilbao`, `amsterdam`, and anything else with descriptive filenames):

- `gen_views.py` won't touch them (they're not in its `ALBUMS` list). Edit `albums/{city}.html` and `albums/{city}/view.html` by hand, keeping the same markup shape as a generated one.

## Adding a new city album

1. Create `images/albums/{city}/` and drop in `{city}-01.jpg`, `{city}-02.jpg`, …
2. Add a tuple to the `ALBUMS` list near the top of `scripts/gen_views.py`: `('{city}', '{city}', '{year}')`.
3. `python3 scripts/gen_views.py` — writes `albums/{city}/view.html` and `albums/{city}_grid.txt`.
4. Create `albums/{city}.html` by copying an existing album page (e.g. `albums/helsinki.html`) and swapping the city name, year, and pasting in the new grid from `{city}_grid.txt`.
5. Add a thumbnail entry to `index.html`'s `.album-thumb-grid` (in chronological order — newest first, following the pattern already there).
6. Add an entry to `locations.html`.
7. Add a `<url>` entry for both `/albums/{city}.html` and `/albums/{city}/view.html` to `sitemap.xml`.
8. `python3 scripts/root_relative_urls.py`.
9. Preview, commit, deploy.

## Running locally

```bash
cd "$(git rev-parse --show-toplevel)"
python3 -m http.server 8000
# visit http://localhost:8000
```

The site works from the filesystem too, but root-relative URLs (`/css/style.css`, `/images/…`) need a server to resolve correctly.

## Deploying to production

Host: DreamHost. Protocol: **SFTP**. Credentials are not stored in the repo.

- Host: `vps38575.dreamhostps.com`
- User: `dh_uz8ddr`
- Remote path: `~/blessley.co.uk/` on the server (i.e. `/home/dh_uz8ddr/blessley.co.uk/`). If that ever changes, set `BLESSLEY_SFTP_PATH` for the run.
- Tool for interactive use: **Transmit** (Tom's GUI client).
- Tool for scripted use from Claude Code / CLI: **`lftp`** via `scripts/deploy.sh`.

### Deploy from Claude Code / CLI

```bash
scripts/deploy.sh --dry-run   # preview what would change
scripts/deploy.sh             # actually push
```

The script:

- Uses `lftp` `mirror -R --only-newer` to upload only changed files (install once with `brew install lftp`).
- **Prompts for the SFTP password on every run.** Do not paste the password into chat; type it at the prompt. If the env var `BLESSLEY_SFTP_PASSWORD` is set the script uses it, but that's opt-in.
- Excludes dev-only paths from the upload: `.git/`, `.claude/`, `.cursor/`, `.DS_Store`, `scripts/`, `README.md`, `albums/*_grid.txt`, `.gitignore`, `.deploy.env`.
- Uploads *everything else*, including image folders that are gitignored — that's the whole point of SFTP vs git.

After a deploy, sanity-check:

- https://www.blessley.co.uk/ — home grid renders all thumbnails
- https://www.blessley.co.uk/albums/{city}.html for any album touched
- https://www.blessley.co.uk/albums/{city}/view.html#{city}-01 for the viewer
- `curl -sI https://www.blessley.co.uk/{changed-file}` to confirm the server has the new timestamp

### Deploy from Transmit (manual alternative)

Open the saved favourite, sync local `Site/` → remote `~/blessley.co.uk/` with the same excludes configured in the panel. Only use this when you specifically want the GUI — the CLI path is the default so that Claude Code can do it end-to-end.

## Commit discipline

- Plain-sentence messages, imperative mood, no prefixes. e.g. `Add Porto album thumbnails`, `Fix broken link on locations page`.
- Commit HTML/CSS/JS changes separately from `scripts/` changes when practical.
- Don't commit `albums/{city}_grid.txt` regeneration changes on their own — they're only useful as a step toward updating `albums/{city}.html`.
- Never commit paths under `images/` (gitignored — but double-check `git status` if you're surprised by an addition).
- Never commit SFTP credentials or a populated `.deploy.env`.

## When things look weird

- Grid page shows broken images → check the `src` paths are `/images/albums/{city}/…` (root-relative) and that the image filename matches the folder spelling. `tallin` vs `tallinn` is the usual culprit.
- `view.html` blank / stuck on first image → `window.IMAGES` is empty or malformed. Re-run `python3 scripts/gen_views.py` and replace.
- Production still shows old photo after deploy → check `scripts/deploy.sh` output for that filename; if it wasn't uploaded, confirm the local mtime is newer than the remote (that's what `--only-newer` compares). Touch the file if needed.
- "Image folder isn't in git" surprises after a fresh clone → that's by design; pull the images from the iCloud working copy or from production via `lftp mirror` (reverse).
