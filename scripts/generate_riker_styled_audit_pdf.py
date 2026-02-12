from pathlib import Path


def esc(s: str) -> str:
    return s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def build_stream() -> bytes:
    lines = []

    # Background
    lines.append("0.06 0.10 0.18 rg")
    lines.append("0 0 595 842 re f")

    # Top band
    lines.append("0.16 0.26 0.46 rg")
    lines.append("0 760 595 82 re f")

    # Accent bar
    lines.append("0.86 0.74 0.28 rg")
    lines.append("0 748 595 8 re f")

    # Card panels
    lines.append("0.95 0.96 0.98 rg")
    lines.append("36 470 523 250 re f")
    lines.append("36 170 523 270 re f")

    # KPI tiles
    lines.append("0.88 0.91 0.96 rg")
    lines.append("54 365 152 64 re f")
    lines.append("221 365 152 64 re f")
    lines.append("388 365 152 64 re f")

    # Text
    t = []
    t.append("BT")
    t.append("/F2 30 Tf")
    t.append("1 0 0 1 46 790 Tm")
    t.append(f"({esc('AIP SEO AUDIT')}) Tj")

    t.append("/F3 12 Tf")
    t.append("1 0 0 1 48 770 Tm")
    t.append(f"({esc('Riker Persona: confident, decisive, command-level clarity')}) Tj")

    t.append("/F2 16 Tf")
    t.append("1 0 0 1 50 695 Tm")
    t.append(f"({esc('Executive Brief')}) Tj")

    body = [
        "Site direction is solid, but authority flow and intent mapping are under-leveraged.",
        "Priority is to tighten structure and commercial relevance before scaling content.",
        "",
        "Mission Priorities (14 days):",
        "1) Fix indexation + canonical conflicts on key templates.",
        "2) Rework title/meta copy for high-intent terms.",
        "3) Build internal-link command hubs to money pages.",
        "4) Deploy FAQ/schema blocks on core service URLs.",
    ]

    t.append("/F1 11 Tf")
    y = 672
    for line in body:
        t.append(f"1 0 0 1 52 {y} Tm")
        t.append(f"({esc(line)}) Tj")
        y -= 20

    t.append("/F2 14 Tf")
    t.append("1 0 0 1 50 415 Tm")
    t.append(f"({esc('KPI Signals')}) Tj")

    # KPI labels/values
    t.append("/F3 10 Tf")
    t.append("1 0 0 1 66 408 Tm")
    t.append(f"({esc('Index Health')}) Tj")
    t.append("/F2 18 Tf")
    t.append("1 0 0 1 66 383 Tm")
    t.append(f"({esc('78/100')}) Tj")

    t.append("/F3 10 Tf")
    t.append("1 0 0 1 233 408 Tm")
    t.append(f"({esc('Top-10 Terms')}) Tj")
    t.append("/F2 18 Tf")
    t.append("1 0 0 1 233 383 Tm")
    t.append(f"({esc('+12 MoM')}) Tj")

    t.append("/F3 10 Tf")
    t.append("1 0 0 1 400 408 Tm")
    t.append(f"({esc('Lead Velocity')}) Tj")
    t.append("/F2 18 Tf")
    t.append("1 0 0 1 400 383 Tm")
    t.append(f"({esc('+5.1%')}) Tj")

    t.append("/F2 16 Tf")
    t.append("1 0 0 1 50 410 Tm")
    t.append(f"({esc('')}) Tj")

    t.append("/F2 16 Tf")
    t.append("1 0 0 1 50 410 Tm")
    t.append(f"({esc('')}) Tj")

    t.append("/F2 16 Tf")
    t.append("1 0 0 1 50 338 Tm")
    t.append(f"({esc('Command Actions')}) Tj")

    actions = [
        "• Ship IA fixes first, then publish expansion pages.",
        "• Focus internal links from authority pages to conversion routes.",
        "• Track weekly deltas: indexed URLs, rankings, qualified leads.",
        "• Escalate blockers inside 24h with owner + ETA.",
    ]
    t.append("/F1 11 Tf")
    y = 312
    for line in actions:
        t.append(f"1 0 0 1 52 {y} Tm")
        t.append(f"({esc(line)}) Tj")
        y -= 22

    t.append("/F3 9 Tf")
    t.append("1 0 0 1 50 28 Tm")
    t.append(f"({esc('Demo styled template • AIP x Riker • 2026-02-12')}) Tj")

    t.append("ET")

    lines.extend(t)
    return "\n".join(lines).encode("latin-1", errors="replace")


def generate(path: Path):
    header = b"%PDF-1.4\n"
    objs = []

    objs.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    objs.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    objs.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>\nendobj\n")
    objs.append("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    objs.append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")
    objs.append("6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj\n")

    stream = build_stream()
    objs.append(f"7 0 obj\n<< /Length {len(stream)} >>\nstream\n" + stream.decode("latin-1") + "\nendstream\nendobj\n")

    body = ""
    offsets = [0]
    cur = len(header)
    for o in objs:
        offsets.append(cur)
        b = o.encode("latin-1")
        body += o
        cur += len(b)

    xref_start = cur
    xref = [f"xref\n0 {len(objs)+1}\n", "0000000000 65535 f \n"]
    for off in offsets[1:]:
        xref.append(f"{off:010d} 00000 n \n")

    trailer = f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n"

    path.parent.mkdir(parents=True, exist_ok=True)
    pdf = header + body.encode("latin-1") + "".join(xref).encode("latin-1") + trailer.encode("latin-1")
    path.write_bytes(pdf)


if __name__ == "__main__":
    generate(Path("reports/test/riker-audit-styled.pdf"))
