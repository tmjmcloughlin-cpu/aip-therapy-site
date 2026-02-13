from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path


def esc(s: str) -> str:
    return s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


@dataclass
class Report:
    title: str
    subtitle: str
    period: str
    highlights: list[str]
    kpis: list[tuple[str, str]]
    risks: list[str]
    next_actions: list[str]
    footer: str


def build_stream(r: Report) -> bytes:
    lines: list[str] = []

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
    lines.append("36 512 523 198 re f")  # exec card
    lines.append("36 286 523 200 re f")  # risks
    lines.append("36 72 523 190 re f")   # actions

    # KPI tiles
    lines.append("0.88 0.91 0.96 rg")
    lines.append("54 432 152 64 re f")
    lines.append("221 432 152 64 re f")
    lines.append("388 432 152 64 re f")

    t: list[str] = []
    t.append("BT")

    # Header
    t.append("/F2 26 Tf")
    t.append("1 0 0 1 46 792 Tm")
    t.append(f"({esc(r.title)}) Tj")

    t.append("/F3 11 Tf")
    t.append("1 0 0 1 48 772 Tm")
    t.append(f"({esc(r.subtitle)}) Tj")

    t.append("/F1 11 Tf")
    t.append("1 0 0 1 48 754 Tm")
    t.append(f"({esc(r.period)}) Tj")

    # Executive summary
    t.append("/F2 15 Tf")
    t.append("1 0 0 1 50 690 Tm")
    t.append(f"({esc('Month-to-date highlights')}) Tj")

    t.append("/F1 11 Tf")
    y = 666
    for line in r.highlights:
        t.append(f"1 0 0 1 52 {y} Tm")
        t.append(f"({esc('• ' + line)}) Tj")
        y -= 18

    # KPI section
    t.append("/F2 14 Tf")
    t.append("1 0 0 1 50 500 Tm")
    t.append(f"({esc('KPI snapshot (MTD)')}) Tj")

    # KPI tiles labels/values (3)
    t.append("/F3 9 Tf")
    for i, (label, value) in enumerate(r.kpis[:3]):
        x = 66 + i * 167
        t.append(f"1 0 0 1 {x} 476 Tm")
        t.append(f"({esc(label)}) Tj")
        t.append("/F2 18 Tf")
        t.append(f"1 0 0 1 {x} 450 Tm")
        t.append(f"({esc(value)}) Tj")
        t.append("/F3 9 Tf")

    # Risks / blockers
    t.append("/F2 15 Tf")
    t.append("1 0 0 1 50 466 Tm")
    t.append(f"({esc('Risks / blockers')}) Tj")

    t.append("/F1 11 Tf")
    y = 442
    for line in r.risks:
        t.append(f"1 0 0 1 52 {y} Tm")
        t.append(f"({esc('• ' + line)}) Tj")
        y -= 18

    # Next actions
    t.append("/F2 15 Tf")
    t.append("1 0 0 1 50 252 Tm")
    t.append(f"({esc('Next actions (next 14 days)')}) Tj")

    t.append("/F1 11 Tf")
    y = 228
    for line in r.next_actions:
        t.append(f"1 0 0 1 52 {y} Tm")
        t.append(f"({esc('• ' + line)}) Tj")
        y -= 18

    # Footer
    t.append("/F3 9 Tf")
    t.append("1 0 0 1 50 28 Tm")
    t.append(f"({esc(r.footer)}) Tj")

    t.append("ET")

    lines.extend(t)
    return "\n".join(lines).encode("latin-1", errors="replace")


def generate_pdf(path: Path, r: Report):
    header = b"%PDF-1.4\n"
    objs: list[str] = []

    objs.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    objs.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    objs.append(
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        "/Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>\nendobj\n"
    )
    objs.append("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    objs.append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")
    objs.append("6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj\n")

    stream = build_stream(r)
    objs.append(
        f"7 0 obj\n<< /Length {len(stream)} >>\nstream\n"
        + stream.decode("latin-1")
        + "\nendstream\nendobj\n"
    )

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

    trailer = (
        f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n"
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    pdf = header + body.encode("latin-1") + "".join(xref).encode("latin-1") + trailer.encode("latin-1")
    path.write_bytes(pdf)


if __name__ == "__main__":
    today = date.today().isoformat()
    r = Report(
        title="AIP — Month-to-date report (Riker)",
        subtitle="Command-level summary (draft until KPIs are confirmed)",
        period=f"Period: 2026-02-01 → {today}",
        highlights=[
            "Core messaging + channel wiring stabilised (DM routing live)",
            "Group comms path identified; remaining work is allowlisting + permissions",
            "Reporting pipeline: PDF template ready for automated monthly cadence",
        ],
        kpis=[
            ("Indexed URLs", "TBD"),
            ("Top-10 terms", "TBD"),
            ("Lead volume", "TBD"),
        ],
        risks=[
            "Telegram bot tokens were posted in chat earlier — ensure they are revoked/rotated",
            "Group responses depend on group permissions + allowlist policy",
        ],
        next_actions=[
            "Confirm AIP KPI sources (GSC/GA4/rank tracker) and lock the metric set",
            "Add Picard + Riker to target groups; capture group chat IDs; enable allowlist entries",
            "Automate MTD report generation + send as PDF on schedule",
        ],
        footer=f"Generated by OpenClaw • Riker persona • {today}",
    )

    generate_pdf(Path(f"reports/aip-mtd-{today}.pdf"), r)
