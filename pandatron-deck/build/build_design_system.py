"""One reference slide that documents the deck's design system."""
import os
from lib import *  # noqa: F401,F403

OUT = os.path.join(HERE, "..", "output")


def main():
    prs = new_presentation("Design system: The Diagnose Conversation", "Pandatron deck design system")
    s = blank(prs)
    chrome(s, 1, 1, "Design system · reference",
           "One accent, one type family, one way to ask.")

    # ---- grid
    x, w = cx(0), span(4)
    caps(s, x, 1.95, w, "Grid", color=GREEN7, bold=True)
    th = w * 9 / 16
    card(s, x, 2.25, w, th, fill=WHITE, line=LINE, radius=0.06)
    sc = w / SW
    for i in range(12):
        R(s, x + cx(i) * sc, 2.25 + 0.12, CW * sc, th - 0.24, fill=TINT, name="Grid column")
    T(s, x, 2.25 + th + 0.12, w, 0.5,
      "16:9 · 12 columns · 0.67 in margins · 0.25 in gutters",
      size=CAP, color=INK2, line=1.15)

    # ---- type
    x, w = cx(4), span(4)
    caps(s, x, 1.95, w, "Type · Arial (theme font)", color=GREEN7, bold=True)
    rows = [(DISPLAY, "12%", True, GREEN), (HEAD, "Headline", True, INK),
            (SUB, "Subhead", True, INK), (BODY, "Body text, left aligned", False, INK2),
            (CAP, "Caption · source · year · n".upper(), True, MUTED)]
    y = 2.15
    for size, txt, b, col in rows:
        hgt = size / 72 * 1.18
        T(s, x, y, w - 0.6, hgt, txt, size=size, bold=b, color=col, line=1.0,
          spacing=1.2 if size == CAP else None)
        T(s, x + w - 0.55, y, 0.55, hgt, f"{size}", size=CAP, color=MUTED, align=PP_ALIGN.RIGHT,
          anchor=MSO_ANCHOR.MIDDLE)
        y += hgt + 0.08

    # ---- color
    x, w = cx(8), span(4)
    caps(s, x, 1.95, w, "Color", color=GREEN7, bold=True)
    sw = [("Brand green", GREEN, "Accent, large text"), ("Text green", GREEN7, "Small text 5.5:1"),
          ("Tint", TINT, "Highlight surface"), ("Ink", INK, "Text 17.4:1"),
          ("Ink 2", INK2, "Body text 9.7:1"), ("Muted", MUTED, "Captions 5.3:1"),
          ("Surface", SURF, "Cards"), ("Line", LINE, "Hairlines")]
    cw2 = (w - 0.2) / 2
    for i, (n, hx, use) in enumerate(sw):
        sx, sy = x + (i % 2) * (cw2 + 0.2), 2.25 + (i // 2) * 0.66
        R(s, sx, sy, 0.45, 0.45, fill=hx, line=LINE if hx in (TINT, SURF, LINE) else None,
          shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.06, name=f"Swatch {n}")
        T(s, sx + 0.55, sy - 0.03, cw2 - 0.55, 0.6, [[(n, {"bold": True})], [(f"#{hx}", {"color": MUTED})], use],
          size=CAP, color=INK2, line=1.0)

    # ---- readiness scale
    x, w = cx(0), span(4)
    y = 5.0
    caps(s, x, y, w, "Readiness scale (semantic)", color=GREEN7, bold=True)
    vals = [33, 41, 20, 6]
    bx = x
    for v, (n, col, tc) in zip(vals, SCALE):
        ww = w * v / 100
        seg = R(s, bx, y + 0.32, ww - 0.03, 0.42, fill=col, name=f"Scale {n}")
        if v >= 10:
            shape_text(seg, f"{v}%", size=CAP, bold=True, color=tc)
        bx += ww
    lx = x
    for n, col, _ in SCALE:
        R(s, lx, y + 0.88, 0.16, 0.16, fill=col)
        T(s, lx + 0.2, y + 0.83, 0.9, 0.26, n, size=CAP, color=INK2, anchor=MSO_ANCHOR.MIDDLE)
        lx += 0.2 + 0.072 * len(n) + 0.24
    T(s, x, y + 1.15, w, 0.75,
      "Ordered by lightness, never red vs green. Colorblind-checked: worst pair ΔE 13.6 "
      "(deutan, target 8). Always direct-labelled.", size=CAP, color=INK2, line=1.15)

    # ---- components
    x, w = cx(4), span(4)
    caps(s, x, y, w, "Components", color=GREEN7, bold=True)
    ask_card(s, x, y + 0.3, w, 0.62, "Ask moments", size=BODY, compact=True, tail=0.12)
    ring_icon(s, "hourglass", x, y + 1.17, 0.5)
    ring_icon(s, "users", x + 0.62, y + 1.17, 0.5)
    num_ring(s, x + 1.24, y + 1.17, 0.5, "01")
    badge(s, x + 1.95, y + 1.29, "Illustrative", w=1.4)
    T(s, x, y + 1.75, w, 0.3, "Ask card · ring motif from the logo · data badge", size=CAP, color=INK2)

    # ---- rules
    x, w = cx(8), span(4)
    caps(s, x, y, w, "Rules", color=GREEN7, bold=True)
    rules = ["Assertion headlines, one idea per slide",
             "Green is the only accent",
             "Max 3 type sizes per slide, plus caption",
             "Every number shows source, year and n",
             "Illustrative data is always badged",
             "Prompts in notes. No em dashes or semicolons"]
    for i, r_ in enumerate(rules):
        ry = y + 0.3 + i * 0.26
        icon(s, "check", "green7", x, ry + 0.03, 0.18)
        T(s, x + 0.28, ry, w - 0.28, 0.26, r_, size=CAP + 1, color=INK)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, "Pandatron_Design_System.pptx")
    prs.save(path)
    print("wrote", path)


if __name__ == "__main__":
    main()
