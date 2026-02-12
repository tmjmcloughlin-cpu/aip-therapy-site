from datetime import date, timedelta
from pathlib import Path


def previous_month_range(today: date):
    first_this_month = today.replace(day=1)
    last_prev_month = first_this_month - timedelta(days=1)
    first_prev_month = last_prev_month.replace(day=1)
    return first_prev_month, last_prev_month


def pdf_escape(text: str) -> str:
    return text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def make_simple_pdf(lines, out_path: Path, title: str):
    # Minimal single-page PDF with Helvetica text
    header = "%PDF-1.4\n"

    objects = []

    # 1: Catalog
    objects.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    # 2: Pages
    objects.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    # 3: Page
    objects.append(
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        "/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n"
    )
    # 4: Font
    objects.append("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    text_commands = ["BT", "/F1 12 Tf", "50 790 Td", f"({pdf_escape(title)}) Tj"]
    y = 770
    for line in lines:
        text_commands.append(f"1 0 0 1 50 {y} Tm")
        text_commands.append(f"({pdf_escape(line)}) Tj")
        y -= 18
        if y < 60:
            break
    text_commands.append("ET")
    stream_data = "\n".join(text_commands).encode("latin-1", errors="replace")

    # 5: Contents
    objects.append(
        f"5 0 obj\n<< /Length {len(stream_data)} >>\nstream\n" + stream_data.decode("latin-1") + "\nendstream\nendobj\n"
    )

    # Build xref
    body = ""
    offsets = [0]
    current = len(header.encode("latin-1"))
    for obj in objects:
        offsets.append(current)
        obj_bytes = obj.encode("latin-1")
        body += obj
        current += len(obj_bytes)

    xref_start = current
    xref = [f"xref\n0 {len(objects)+1}\n", "0000000000 65535 f \n"]
    for off in offsets[1:]:
        xref.append(f"{off:010d} 00000 n \n")

    trailer = (
        f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\n"
        f"startxref\n{xref_start}\n%%EOF\n"
    )

    pdf_content = header + body + "".join(xref) + trailer
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(pdf_content.encode("latin-1"))


def main():
    today = date.today()
    start, end = previous_month_range(today)
    month_label = start.strftime('%B %Y')

    out_dir = Path('reports/test')

    audit_lines = [
        "Client: Audi (TEST)",
        f"Generated: {today.isoformat()}",
        "",
        "Executive Summary:",
        "- Site health baseline created",
        "- Technical crawl issues identified (sample)",
        "- Content opportunities mapped to intent clusters",
        "",
        "Priority Actions (Next 30 Days):",
        "1) Fix indexation + canonical consistency",
        "2) Improve Core Web Vitals on key landing pages",
        "3) Expand model + dealership location pages",
        "4) Strengthen internal linking to money pages",
        "",
        "Note: This is a TEST export template.",
    ]

    report_lines = [
        "Client: Audi (TEST)",
        f"Reporting Period: {start.isoformat()} to {end.isoformat()} ({month_label})",
        f"Generated: {today.isoformat()}",
        "",
        "KPI Snapshot (placeholder):",
        "- Organic sessions: +8.4% MoM",
        "- Leads/form fills: +5.1% MoM",
        "- Top-10 keywords: +12",
        "- Technical errors: -18%",
        "",
        "Wins:",
        "- New category page lifted rankings for non-brand terms",
        "- CTR improved on high-impression queries",
        "",
        "Risks & Next Actions:",
        "- Competitor content expansion in EV segment",
        "- Build comparison pages and schema improvements",
        "",
        "Rule: Reports sent on day 1 cover previous calendar month.",
        "Note: This is a TEST export template.",
    ]

    make_simple_pdf(audit_lines, out_dir / 'audi-audit-test.pdf', 'Audi SEO Audit (Test)')
    make_simple_pdf(report_lines, out_dir / 'audi-monthly-report-test.pdf', 'Audi Monthly SEO Report (Test)')


if __name__ == '__main__':
    main()
