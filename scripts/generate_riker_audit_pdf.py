from pathlib import Path


def esc(s: str) -> str:
    return s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def pdf_lines(out_path: Path, title: str, lines: list[str]):
    header = b"%PDF-1.4\n"
    objs = []
    objs.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    objs.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    objs.append(
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>\nendobj\n"
    )
    objs.append("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    cmds = [
        "BT",
        "/F2 20 Tf",
        "1 0 0 1 50 800 Tm",
        f"({esc(title)}) Tj",
        "/F1 11 Tf",
    ]
    y = 770
    for line in lines:
        cmds += ["1 0 0 1 50 %d Tm" % y, f"({esc(line)}) Tj"]
        y -= 17
        if y < 70:
            break
    cmds.append("ET")
    stream = "\n".join(cmds).encode("latin-1", errors="replace")

    objs.append(f"5 0 obj\n<< /Length {len(stream)} >>\nstream\n" + stream.decode("latin-1") + "\nendstream\nendobj\n")
    objs.append("6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")

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

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(header + body.encode("latin-1") + "".join(xref).encode("latin-1") + trailer.encode("latin-1"))


def main():
    lines = [
        "Character Style: Riker - The Confident XO",
        "Persona cues: decisive, composed, action-forward, leadership under pressure.",
        "",
        "Client: AIP (demo)",
        "Audit Date: 2026-02-12",
        "",
        "Executive Signal:",
        "- Foundation is serviceable, but authority flow is uneven.",
        "- Fast wins exist in information architecture and internal linking.",
        "- Local intent pages need clearer hierarchy and conversion paths.",
        "",
        "Priority Missions (Next 14 Days):",
        "1) Resolve indexation + canonical conflicts on key templates.",
        "2) Improve title/meta positioning for high-intent commercial queries.",
        "3) Ship internal-link hubs from top authority pages to money pages.",
        "4) Add schema + FAQ blocks on service pages to improve SERP real estate.",
        "",
        "Command Notes:",
        "- Track impact weekly: indexed URLs, top-10 terms, qualified leads.",
        "- Escalate anything blocking crawl, render, or conversion routes.",
        "",
        "Outcome Frame:",
        "Tighten structure first, then scale content. Win the map before adding miles.",
        "",
        "(Demo PDF style sample)",
    ]
    pdf_lines(Path("reports/test/riker-audit-example.pdf"), "Riker Audit - Example PDF", lines)


if __name__ == "__main__":
    main()
