#!/usr/bin/env python3
"""Rewrite internal asset and page URLs to root-relative (/css/, /images/, /albums/)."""
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rewrite_root_html(text: str) -> str:
    text = text.replace('href="css/style.css"', 'href="/css/style.css"')
    text = text.replace('href="index.html"', 'href="/"')
    text = text.replace('href="about.html"', 'href="/about.html"')
    text = text.replace('href="locations.html"', 'href="/locations.html"')
    text = text.replace('href="albums/', 'href="/albums/')
    text = text.replace('src="images/', 'src="/images/')
    return text


def rewrite_album_grid_html(text: str) -> str:
    text = text.replace('href="../css/style.css"', 'href="/css/style.css"')
    text = text.replace('href="../index.html"', 'href="/"')
    text = text.replace('href="../about.html"', 'href="/about.html"')
    text = text.replace('src="../images/', 'src="/images/')
    text = re.sub(r'href="([a-z0-9-]+)/view\.html', r'href="/albums/\1/view.html', text)
    return text


def rewrite_view_html(text: str) -> str:
    text = text.replace('href="../../css/style.css"', 'href="/css/style.css"')
    text = text.replace('href="../../js/image-view.js"', 'href="/js/image-view.js"')
    text = text.replace('src="../../js/image-view.js"', 'src="/js/image-view.js"')
    text = text.replace('href="../../index.html"', 'href="/"')
    text = text.replace('href="../../about.html"', 'href="/about.html"')
    # window.IMAGES src: '../../images/...' or "../../images/..."
    text = re.sub(r"src:\s*'\.\./\.\./images/", "src: '/images/", text)
    text = re.sub(r'src:\s*"\.\./\.\./images/', 'src: "/images/', text)
    text = re.sub(
        r'href="\.\./([a-z0-9-]+)\.html"',
        r'href="/albums/\1.html"',
        text,
    )
    return text


def process_file(rel_path: str) -> bool:
    path = os.path.join(BASE, rel_path)
    with open(path, encoding='utf-8') as f:
        original = f.read()
    if rel_path in ('index.html', 'about.html', 'locations.html'):
        updated = rewrite_root_html(original)
    elif rel_path.endswith('/view.html'):
        updated = rewrite_view_html(original)
    elif rel_path.startswith('albums/') and rel_path.endswith('.html'):
        updated = rewrite_album_grid_html(original)
    else:
        return False
    if updated != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(updated)
        return True
    return False


def main():
    changed = []
    for root, _dirs, files in os.walk(BASE):
        for name in files:
            if not name.endswith('.html'):
                continue
            full = os.path.join(root, name)
            rel = os.path.relpath(full, BASE)
            if rel.startswith('.'):
                continue
            if process_file(rel):
                changed.append(rel)
    for c in sorted(changed):
        print('updated', c)
    print('done,', len(changed), 'files')


if __name__ == '__main__':
    main()
