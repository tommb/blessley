#!/usr/bin/env python3
"""Generate view.html and album grid links for city-NN albums."""
import os
import re
import glob

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALBUMS = [
    ('porto', 'porto', '2018'),
    ('helsinki', 'helsinki', '2017'),
    ('dubrovnik', 'dubrovnik', '2016'),
    ('athens', 'athens', '2015'),
    ('oslo', 'oslo', '2014'),
    ('reykjavic', 'reykjavic', '2013'),
    ('lisbon', 'lisbon', '2012'),
    ('vienna', 'vienna', '2011'),
    ('budapest', 'budapest', '2009'),
    ('madrid', 'madrid', '2008'),
    ('berlin', 'berlin', '2007'),
    ('prague', 'prague', '2006'),
]

def natural_sort_key(s):
    parts = re.split(r'(\d+)', s.lower())
    return [int(p) if p.isdigit() else p for p in parts if p]

def get_images(folder):
    path = os.path.join(BASE, 'images', 'albums', folder)
    files = [f for f in os.listdir(path) if f.endswith('.jpg')]
    files.sort(key=natural_sort_key)
    return [f[:-4] for f in files]  # id without .jpg

def title_case(s):
    return s.replace('-', ' ').title()

def gen_images_js(city, folder, ids):
    cap = title_case(city)
    lines = []
    for i, id in enumerate(ids):
        align = 'left' if i % 2 == 0 else 'right'
        num = id.split('-')[-1] if '-' in id else id
        title = f'{cap} — {num}'
        wiki = ''
        if i == 0:
            wiki = f", wiki: 'https://en.wikipedia.org/wiki/{cap}'"
        lines.append(f"      {{ id: '{id}', title: '{title}', src: '../../images/albums/{folder}/{id}.jpg', align: '{align}'{wiki} }}")
    return ',\n'.join(lines)

def view_html(city, folder, year, ids):
    cap = title_case(city)
    images_js = gen_images_js(city, folder, ids)
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Thomas Blessley • Photography — {cap}</title>
  <link rel="stylesheet" href="../../css/style.css">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-TBD046KHTX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-TBD046KHTX');
  </script>
</head>
<body class="album-page image-page">
  <header class="site-header">
    <h1 class="site-title breadcrumb-title">
      <a href="../../index.html">blessley</a><span>/</span>
      <a href="../../index.html">photography</a><span>/</span>
      <a href="../{city}.html">{year} — {city}</a><span>/</span>
      <span id="current-title">—</span>
    </h1>
    <nav class="header-nav">
      <a href="../../about.html">about</a>
      <a href="../../index.html">locations</a>
    </nav>
  </header>
  <main class="album-main">
    <div id="image-container"></div>
    <nav class="image-nav" id="image-nav" aria-label="Image navigation">
      <a href="../{city}.html" class="image-nav-back">← back to album</a>
      <span id="image-nav-prev"></span>
      <span id="image-nav-next"></span>
    </nav>
  </main>
  <footer class="site-footer">
    ©<span id="year">2025</span> tom blessley
    <span class="sep">•</span>
    <a href="https://www.instagram.com/tomblessley/" target="_blank" rel="noopener">instagram</a>
  </footer>
  <script>
    document.getElementById('year').textContent = new Date().getFullYear();
    window.ALBUM_TITLE = '{cap}';
    window.IMAGES = [
{images_js}
    ];
  </script>
  <script src="../../js/image-view.js"></script>
</body>
</html>
'''

def grid_line(city, folder, id, cap_display):
    """One grid item: <a><figure><img><figcaption></figure></a>"""
    num = id.split('-')[-1] if '-' in id else id
    label = f'{cap_display} {num}'
    return f'        <a href="{city}/view.html#{id}"><figure><img src="../images/albums/{folder}/{id}.jpg" alt="{label}"><figcaption>{label}</figcaption></figure></a>'

def main():
    for city, folder, year in ALBUMS:
        ids = get_images(folder)
        if not ids:
            print(f'No images for {city}', file=__import__('sys').stderr)
            continue
        out_dir = os.path.join(BASE, 'albums', city)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, 'view.html')
        with open(out_path, 'w') as f:
            f.write(view_html(city, folder, year, ids))
        print(f'Wrote {out_path} ({len(ids)} images)')
        # Write grid snippet to albums/{city}_grid.txt for search_replace
        cap = title_case(city)
        grid_lines = [grid_line(city, folder, id, cap) for id in ids]
        grid_path = os.path.join(BASE, 'albums', f'{city}_grid.txt')
        with open(grid_path, 'w') as f:
            f.write('    <div class="photo-grid">\n')
            f.write('\n'.join(grid_lines))
            f.write('\n    </div>\n')
        print(f'Wrote {grid_path}')

if __name__ == '__main__':
    main()
