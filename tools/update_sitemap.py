#!/usr/bin/env python3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://aiptherapy.uk"

pages = sorted(ROOT.glob("*.html"))

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]

for p in pages:
    if p.name == "index.html":
        loc = BASE_URL + "/"
    else:
        loc = BASE_URL + "/" + p.name
    lastmod = datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc).date().isoformat()
    lines += ["  <url>", f"    <loc>{loc}</loc>", f"    <lastmod>{lastmod}</lastmod>", "  </url>"]

lines.append("</urlset>")
(ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("Generated sitemap.xml")
