"""Build the Pandatron 'Diagnose Conversation' decks.

    python3 build_deck.py            -> output/Pandatron_Diagnose_Conversation_Live.pptx
                                        output/Pandatron_Diagnose_Conversation_LeaveBehind.pptx

Live = facilitated discovery deck with Ask cards and talk tracks in speaker notes.
Leave-behind = no questions, answers implied, readable without a presenter.
"""
import os
import random
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION, XL_TICK_LABEL_POSITION, XL_TICK_MARK
from pptx.enum.chart import XL_MARKER_STYLE
from lib import *  # noqa: F401,F403

OUT = os.path.join(HERE, "..", "output")
EMAIL = "robert.newland@pandatron.ai"
MAILTO = "mailto:robert.newland@pandatron.ai?subject=Diagnose%20pilot"
WEB = "https://www.pandatron.ai"


# =============================================================== 01 cover
def s_cover(prs, mode, page, total):
    s = blank(prs)
    logo_wordmark(s, M, 0.62, 2.2)
    eyebrow = "A discovery conversation" if mode == "live" else "A briefing for transformation leaders"
    caps(s, M, 2.62, span(6), eyebrow, color=GREEN7, bold=True)
    T(s, M, 2.95, span(6), 1.7, "The Diagnose Conversation", size=DISPLAY, bold=True, line=0.92,
      name="Title")
    sub = ("Where transformations stall, and how to see it early." if mode == "live" else
           "Most transformations don't fail on strategy. They stall in adoption. "
           "Here is how to see it early.")
    T(s, M, 4.75, 6.7, 1.0, sub, size=SUB, color=INK2, line=1.15, name="Subtitle")
    T(s, M, 6.95, 3, 0.25, "pandatron.ai", size=CAP, color=MUTED, name="Web")
    # Abstract brand graphic: a population of people (dots), each a conversation.
    # Green rings = signals surfaced. Echoes the ring in the logo.
    rnd = random.Random(7)
    cols, rows, step = 11, 14, 0.44
    gx0, gy0 = SW - M - (cols - 1) * step - 0.15, 0.55
    hot = [(3, 4), (7, 9), (5, 6)]
    for r in range(rows):
        for c in range(cols):
            x, y = gx0 + c * step, gy0 + r * step
            dist = min(((c - hc) ** 2 + (r - hr) ** 2) ** 0.5 for hc, hr in hot)
            p_ring = max(0.0, 0.62 - dist * 0.2)
            v = rnd.random()
            if v < p_ring * 0.55:
                oval(s, x - 0.13, y - 0.13, 0.26, fill=None, line=GREEN, lw=2.25, name="Signal ring")
            elif v < p_ring:
                oval(s, x - 0.07, y - 0.07, 0.14, fill=GREEN, name="Signal dot")
            else:
                oval(s, x - 0.05, y - 0.05, 0.10, fill=HESIT, name="Person dot")
    notes(s, NOTES["cover"][mode])
    return s


# =============================================================== 02 ask: biggest risk (live only)
def s_ask_risk(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, eyebrow="Opening")
    ask_card(s, M, 1.05, span(12), 1.95, "Where is the biggest risk in your transformation?", size=HEAD)
    opts = ["The strategy itself", "The technology and process",
            "Getting the organization to work differently"]
    for i, o in enumerate(opts):
        x = cx(i * 4)
        card(s, x, 3.6, span(4), 2.05, fill=WHITE, line=LINE)
        oval(s, x + 0.35, 3.9, 0.42, fill=WHITE, line=GREEN, lw=2.25, name="Option ring")
        T(s, x + 0.35, 4.5, span(4) - 0.7, 1.0, o, size=SUB, bold=True, color=INK, line=1.05)
    T(s, M, 6.0, span(12), 0.3, "Pick one. There is no wrong answer.", size=SUB, color=INK2)
    notes(s, NOTES["risk"]["live"])
    return s


# =============================================================== 03 evidence
def s_evidence(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "The pattern",
           "Strategy gets approved. Adoption is where transformations stall.")
    tiles = [
        ("12%", "of business transformations achieve their original ambitions. 88% fall short.",
         "Bain & Company · 2024 · 400+ executives"),
        ("#1", "implementation barrier is resistance to change, ahead of budget, timelines and technology.",
         "Kearney Transformation Study · 2026 · 102 leaders"),
        ("22%", "of employees say they got enough training, coaching or tools to adapt after a reorganization.",
         "Bain & Company · 2026 · ~1,000 executives and employees"),
    ]
    for i, (n, d, src) in enumerate(tiles):
        x, y, w, h = cx(i * 4), 2.2, span(4), 3.95
        card(s, x, y, w, h)
        T(s, x + 0.35, y + 0.3, w - 0.7, 0.95, n, size=DISPLAY, bold=True, color=GREEN, line=1.0)
        T(s, x + 0.35, y + 1.45, w - 0.7, 1.6, d, size=BODY, color=INK, line=1.2)
        T(s, x + 0.35, y + h - 0.72, w - 0.7, 0.45, src.upper(), size=CAP, color=MUTED, spacing=1,
          line=1.1, anchor=MSO_ANCHOR.BOTTOM)
    T(s, M, 6.4, span(12), 0.3,
      "Three studies, one pattern: the plan survives approval, then stalls where people meet it.",
      size=BODY, color=INK2)
    notes(s, NOTES["evidence"][mode])
    return s


# =============================================================== 04 adoption theater
def s_theater(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "The blind spot",
           "Dashboards report adoption. They cannot see the workarounds.")
    top, ph = 2.15, 2.75
    # Left: what the dashboard shows (clean mock)
    x, w = cx(0), span(6)
    caps(s, x, top, 4, "What the dashboard shows", color=MUTED, bold=True)
    badge(s, x + w - 1.55, top - 0.03, "Illustrative", w=1.55)
    card(s, x, top + 0.35, w, ph - 0.35, fill=WHITE, line=LINE)
    mets = [("80%", "Adoption"), ("94%", "Trained"), ("+32%", "Logins")]
    mw = (w - 0.5) / 3
    for i, (v, l) in enumerate(mets):
        mx = x + 0.25 + i * mw
        icon(s, "circle-check", "green", mx + 0.05, top + 0.75, 0.32)
        T(s, mx + 0.05, top + 1.2, mw - 0.1, 0.55, v, size=HEAD, bold=True, color=INK)
        T(s, mx + 0.05, top + 1.8, mw - 0.1, 0.5, l, size=BODY, color=INK2)
    caps(s, x + 0.3, top + ph - 0.4, w - 0.6, "Status: on track", color=GREEN7, bold=True)
    # Right: what is actually happening
    x2 = cx(6)
    caps(s, x2, top, 4.5, "What is actually happening", color=INK, bold=True)
    card(s, x2, top + 0.35, w, ph - 0.35, fill=SURF)
    rows = [("shuffle", "Workarounds keep the old process alive"),
            ("repeat", "New tool for reporting, old habits for the work"),
            ("eye-off", "Compliance on record, not in practice")]
    for i, (ic, t) in enumerate(rows):
        ry = top + 0.62 + i * 0.68
        icon(s, ic, "ink2", x2 + 0.35, ry + 0.02, 0.32)
        T(s, x2 + 0.85, ry, w - 1.1, 0.4, t, size=BODY, color=INK, anchor=MSO_ANCHOR.MIDDLE)
    # Evidence strip: Bain 2026 perception gap (native chart)
    ey = 5.25
    caps(s, M, ey, span(8), "Same reorganization, two views: share who believe it will deliver",
         color=MUTED, bold=True)
    lx, lw = M, span(2) + 0.2
    cxx, cww = M + lw + 0.15, span(7)
    T(s, lx, ey + 0.32, lw, 0.42, "Leaders", size=BODY, bold=True, color=INK, anchor=MSO_ANCHOR.MIDDLE)
    T(s, lx, ey + 0.78, lw, 0.42, "Employees", size=BODY, bold=True, color=INK, anchor=MSO_ANCHOR.MIDDLE)
    cd = CategoryChartData()
    cd.categories = ["Leaders", "Employees"]
    cd.add_series("Believe it will deliver", (88, 36))
    gf = s.shapes.add_chart(XL_CHART_TYPE.BAR_CLUSTERED, In(cxx), In(ey + 0.3), In(cww), In(0.92), cd)
    gf.name = "Chart perception gap"
    ch = gf.chart
    ch.has_legend = False
    ch.has_title = False
    ch.font.name, ch.font.size = FONT, Pt(BODY)
    pl = ch.plots[0]
    pl.gap_width = 45
    ca, va = ch.category_axis, ch.value_axis
    ca.reverse_order = True
    ca.visible = False
    va.visible = False
    va.has_major_gridlines = False
    va.minimum_scale, va.maximum_scale = 0, 100
    ser = pl.series[0]
    for i, col in enumerate((INK2, GRAYMARK)):
        pt = ser.points[i]
        pt.format.fill.solid()
        pt.format.fill.fore_color.rgb = rgb(col)
    chart_clean(ch, inner=(0, 0, 0.9, 1))
    for i, v in enumerate((88, 36)):  # value labels drawn as text (renderer-safe, no wrapping)
        vx = cxx + cww * 0.9 * v / 100 + 0.1
        T(s, vx, ey + 0.3 + 0.92 * (i + 0.5) / 2 - 0.17, 0.9, 0.34, f"{v}%", size=BODY, bold=True,
          color=INK, anchor=MSO_ANCHOR.MIDDLE)
    # gap annotation
    gx = cxx + cww * 0.9 * 0.36
    gx2 = cxx + cww * 0.9 * 0.88
    line(s, gx, ey + 1.3, gx2, ey + 1.3, color=GREEN, w=2)
    line(s, gx, ey + 1.22, gx, ey + 1.38, color=GREEN, w=2)
    line(s, gx2, ey + 1.22, gx2, ey + 1.38, color=GREEN, w=2)
    T(s, cx(10) - 0.1, ey + 0.32, span(2) + 0.1, 0.55, "52 pts", size=HEAD, bold=True, color=GREEN,
      align=PP_ALIGN.RIGHT)
    T(s, cx(10) - 0.1, ey + 0.86, span(2) + 0.1, 0.3, "perception gap", size=BODY, color=INK2,
      align=PP_ALIGN.RIGHT)
    T(s, M, ey + 1.42, span(12), 0.22,
      "BAIN & COMPANY · JAN 2026 · ~1,000 EXECUTIVES AND EMPLOYEES WHO WENT THROUGH A REORGANIZATION",
      size=CAP, color=MUTED, spacing=1)
    notes(s, NOTES["theater"][mode])
    return s


# =============================================================== 05 readiness ruler / what tools miss
def s_ruler(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "Your view" if mode == "live" else "Current visibility",
           "Snapshot tools show that friction exists. They rarely show its kind, location or fix.")
    caps(s, M, 2.12, 5, "Today's snapshot tools", color=MUTED, bold=True)
    tools = ["Surveys", "Focus groups", "Manager feedback", "Readiness assessments"]
    x = M
    for t in tools:
        w = 0.5 + 0.118 * len(t)
        pill(s, x, 2.42, w, 0.46, t, fill=WHITE, line=LINE, color=INK, size=BODY)
        x += w + 0.18
    if mode == "live":
        y, h = 3.3, 3.1
        ask_card(s, M, y, span(12), h,
                 "On a scale of 1 to 10, how ready is the organization to diagnose what is "
                 "helping or blocking adoption?", size=SUB)
        d, n = 0.62, 10
        gap = (span(12) - 0.7 - n * d) / (n - 1)
        for i in range(n):
            rx = M + 0.35 + i * (d + gap)
            r = oval(s, rx, y + 1.8, d, fill=None, line=WHITE, lw=2.25, name="Scale point")
            shape_text(r, str(i + 1), size=SUB, color=WHITE, bold=True)
        T(s, M + 0.35, y + 2.52, 3, 0.3, "Not ready", size=BODY, bold=True, color=WHITE)
        T(s, M + span(12) - 3.35, y + 2.52, 3, 0.3, "Fully ready", size=BODY, bold=True, color=WHITE,
          align=PP_ALIGN.RIGHT)
    else:
        y, h = 3.3, 2.65
        x1, w1 = cx(0), span(4)
        caps(s, x1, y, w1, "What they show", color=GREEN7, bold=True)
        card(s, x1, y + 0.35, w1, h - 0.35, fill=TINT)
        icon(s, "circle-check", "green7", x1 + 0.35, y + 0.75, 0.42)
        T(s, x1 + 0.35, y + 1.35, w1 - 0.7, 0.9, "That friction exists", size=SUB, bold=True, color=INK)
        x2, w2 = cx(4), span(8)
        caps(s, x2, y, w2, "What they miss", color=INK, bold=True)
        card(s, x2, y + 0.35, w2, h - 0.35, fill=SURF)
        miss = [("What kind of friction it is", "Knowledge, bandwidth, identity or loss"),
                ("Where it concentrates", "By unit, function, geography and role"),
                ("Which intervention it needs", "Training, provisioning, role design or acknowledgement")]
        for i, (a, b) in enumerate(miss):
            ry = y + 0.55 + i * 0.68
            icon(s, "circle-help", "muted", x2 + 0.35, ry + 0.1, 0.34)
            T(s, x2 + 0.85, ry, 3.2, 0.55, a, size=BODY, bold=True, color=INK, anchor=MSO_ANCHOR.MIDDLE)
            T(s, x2 + 4.1, ry, w2 - 4.35, 0.55, b, size=BODY, color=INK2, anchor=MSO_ANCHOR.MIDDLE, line=1.0)
        T(s, M, 6.25, span(12), 0.35, "The gap is rarely commitment. It is resolution.",
          size=SUB, bold=True, color=INK)
    notes(s, NOTES["ruler"][mode])
    return s


# =============================================================== 06 four costs
COSTS = [
    ("book-open", "Knowledge", "“I don't know it yet, or nobody has decided.”",
     "Something new, unknown or undecided.",
     "Supply the answer: a decision, specific information, or training."),
    ("hourglass", "Bandwidth", "“I can't reach it or fit it.”",
     "No time, tools or access. The environment blocks it.",
     "Provision and simplify: devices, access, time, fewer demands."),
    ("user-round", "Identity", "“Who am I here now?”",
     "The change reads as a threat to standing, not a training gap.",
     "A concrete, respected role in the new model, built with peers."),
    ("heart-crack", "Loss", "“Nothing replaces it.”",
     "Something valued is ending. Arguing only confirms the loss.",
     "Acknowledge the loss and restore what it carried. Never argue with it."),
]


def s_costs(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "The four costs of change",
           "Most friction gets filed as a skills gap. The expensive costs are the other three.")
    live = mode == "live"
    y = 2.42
    h = 3.18 if live else 4.0
    # bracket over the expensive three
    bx1, bx2 = cx(3), cx(9) + span(3)
    caps(s, cx(0), 1.98, span(3), "Usually filed here", color=MUTED, bold=True)
    caps(s, bx1, 1.98, span(9), "The expensive three", color=GREEN7, bold=True)
    line(s, bx1, 2.26, bx2, 2.26, color=GREEN, w=1.75)
    line(s, bx1, 2.26, bx1, 2.34, color=GREEN, w=1.75)
    line(s, bx2, 2.26, bx2, 2.34, color=GREEN, w=1.75)
    for i, (ic, name, quote, desc, fix) in enumerate(COSTS):
        x, w = cx(i * 3), span(3)
        k = i == 0
        card(s, x, y, w, h, fill=WHITE if k else TINT, line=LINE if k else None)
        ring_icon(s, ic, x + 0.25, y + 0.25, 0.52, ring=MUTED if k else GREEN,
                  icolor="muted" if k else "green7")
        T(s, x + 0.9, y + 0.25, w - 1.1, 0.52, name, size=SUB, bold=True, color=INK2 if k else INK,
          anchor=MSO_ANCHOR.MIDDLE)
        T(s, x + 0.25, y + 0.92, w - 0.45, 0.6, quote, size=BODY, italic=True,
          color=MUTED if k else GREEN7, line=1.05)
        fy = y + 1.62
        if not live:
            T(s, x + 0.25, y + 1.6, w - 0.45, 0.85, desc, size=BODY, color=INK2, line=1.05)
            fy = y + 2.55
        caps(s, x + 0.25, fy, w - 0.5, "What works", color=MUTED if k else GREEN7, bold=True)
        T(s, x + 0.25, fy + 0.27, w - 0.45, 1.1, fix, size=BODY, color=INK2 if k else INK, line=1.05)
    if live:
        ask_card(s, M, 5.78, span(12), 0.84,
                 "Of bandwidth, identity and loss, which is costing your transformation most right now?",
                 size=SUB, compact=True, tail=0.14)
    else:
        T(s, M, 6.55, span(12), 0.32,
          "Training fixes knowledge. The other three need changes to the environment, the role or the story.",
          size=BODY, bold=True, color=INK)
    notes(s, NOTES["costs"][mode])
    return s


# =============================================================== 07 decisions
DECISIONS = [("megaphone", "Communication strategy", "Which message lands where"),
             ("users", "Manager support", "Which managers need help first"),
             ("route", "Rollout scope", "What to simplify or sequence"),
             ("clock", "Intervention timing", "Where to step in early"),
             ("wallet", "Change resources", "Where to put people and budget")]


def s_decisions(prs, mode, page, total):
    s = blank(prs)
    live = mode == "live"
    if live:
        chrome(s, page, total, "From diagnosis to decisions")
        ask_card(s, M, 1.0, span(12), 2.6,
                 "If you could see exactly where friction concentrates, by unit, function, geography "
                 "and role, what would you decide differently?", size=HEAD)
        cy = 4.0
    else:
        chrome(s, page, total, "From diagnosis to decisions",
               "Seeing where friction concentrates changes five decisions.")
        cy = 2.2
    caps(s, M, cy, span(8), "Decisions this could inform", color=MUTED, bold=True)
    w = (span(12) - 4 * G) / 5
    ch = 1.55 if live else 2.25
    for i, (ic, t, d) in enumerate(DECISIONS):
        x = M + i * (w + G)
        card(s, x, cy + 0.33, w, ch)
        ring_icon(s, ic, x + 0.22, cy + 0.53, 0.5)
        T(s, x + 0.22, cy + 1.13, w - 0.4, 0.5, t, size=BODY, bold=True, color=INK, line=1.0)
        if not live:
            T(s, x + 0.22, cy + 1.7, w - 0.4, 0.75, d, size=BODY, color=INK2, line=1.05)
    vy = 6.1 if live else 5.35
    T(s, M, vy, span(12), 0.75,
      [[("The value is not another survey. ", {"bold": True}),
        ("It is seeing execution risk early enough to avoid the delay, the productivity loss "
         "and the failed adoption.", {})]],
      size=BODY if live else SUB, color=INK, line=1.15)
    notes(s, NOTES["decisions"][mode])
    return s


# =============================================================== 08 the loop
def s_loop(prs, mode, page, total):
    import math
    s = blank(prs)
    chrome(s, page, total, "The system",
           "Diagnosis is one layer of three. The same conversations run the whole loop.")
    ccx, ccy, r, d = M + 2.95, 4.42, 1.72, 1.45
    oval(s, ccx - r, ccy - r, 2 * r, fill=None, line=HESIT, lw=2.5, name="Loop ring")
    nodes = [(-90, "Diagnose"), (30, "Activate"), (150, "Measure")]
    for ang in (-30, 90, 210):
        a = math.radians(ang)
        tx, ty = ccx + r * math.cos(a), ccy + r * math.sin(a)
        R(s, tx - 0.12, ty - 0.17, 0.24, 0.34, fill=GREEN, shape=MSO_SHAPE.ISOSCELES_TRIANGLE,
          rot=(ang + 180) % 360, name="Loop arrow")
    for ang, name in nodes:
        a = math.radians(ang)
        nx, ny = ccx + r * math.cos(a) - d / 2, ccy + r * math.sin(a) - d / 2
        first = name == "Diagnose"
        oval(s, nx, ny, d, fill=GREEN if first else WHITE, line=GREEN, lw=2.5, name=f"Node {name}")
        T(s, nx - 0.3, ny, d + 0.6, d, name, size=SUB, bold=True, color=WHITE if first else INK,
          align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, name=f"Node label {name}")
    icon(s, "messages-square", "green", ccx - 0.25, ccy - 0.72, 0.5)
    T(s, ccx - 0.9, ccy - 0.15, 1.8, 0.6, ["1:1 AI", "conversations"], size=BODY, bold=True, color=INK,
      align=PP_ALIGN.CENTER, line=1.0)
    rows = [("Diagnose", "Mapping and diagnosing",
             "Maps readiness and friction by cohort, so every intervention is targeted, not broadcast."),
            ("Activate", "Change activation",
             "Weekly 1:1 AI conversations move each person from confusion to committed action."),
            ("Measure", "Execution intelligence",
             "A weekly signal on adoption, friction and emerging risk, while there is still time to act.")]
    x, w = cx(6) + 0.2, span(6) - 0.2
    for i, (n, tag, desc) in enumerate(rows):
        y = 2.25 + i * 1.5
        num_ring(s, x, y, 0.5, f"0{i + 1}")
        T(s, x + 0.7, y - 0.02, w - 0.7, 0.4, n, size=SUB, bold=True, color=INK)
        caps(s, x + 0.7, y + 0.38, w - 0.7, tag, color=GREEN7, bold=True)
        T(s, x + 0.7, y + 0.66, w - 0.7, 0.8, desc, size=BODY, color=INK2, line=1.1)
    notes(s, NOTES["loop"][mode])
    return s


# =============================================================== 09 deliverables
def _thumb_map(s, x, y, w, h):
    rnd = random.Random(3)
    cols, rows = 7, 4
    cw, chh = (w - 0.5) / cols, (h - 0.5) / rows
    ramp = [HESIT, "BFE9B2", READY, GREEN, GREEN7]
    for r in range(rows):
        for c in range(cols):
            v = min(4, max(0, int(rnd.gauss(2.4 - r * 0.45 + c * 0.12, 1.0))))
            R(s, x + 0.25 + c * cw, y + 0.25 + r * chh, cw - 0.04, chh - 0.04, fill=ramp[v], name="Heat cell")


def _thumb_tornado(s, x, y, w, h):
    mid = x + w / 2
    vals = [(0.95, 0.35), (0.75, 0.55), (0.6, 0.7), (0.45, 0.9), (0.3, 1.0)]
    bh = (h - 0.5) / len(vals)
    for i, (l, r_) in enumerate(vals):
        by = y + 0.25 + i * bh
        R(s, mid - l * (w / 2 - 0.3), by, l * (w / 2 - 0.3), bh - 0.08, fill=GRAYMARK, name="Friction bar")
        R(s, mid, by, r_ * (w / 2 - 0.3), bh - 0.08, fill=GREEN, name="Flow bar")
    line(s, mid, y + 0.18, mid, y + h - 0.18, color=INK2, w=1)


def _thumb_align(s, x, y, w, h):
    pairs = [(0.3, 0.38), (0.45, 0.52), (0.2, 0.82), (0.55, 0.6)]
    rh = (h - 0.5) / len(pairs)
    for i, (a, b) in enumerate(pairs):
        ly = y + 0.25 + i * rh + rh / 2
        x0, x1 = x + 0.3, x + w - 0.3
        line(s, x0, ly, x1, ly, color=LINE, w=1)
        pa, pb = x0 + a * (x1 - x0), x0 + b * (x1 - x0)
        line(s, pa, ly, pb, ly, color=GREEN if i == 2 else GRAYMARK, w=2.5 if i == 2 else 1.5)
        oval(s, pa - 0.07, ly - 0.07, 0.14, fill=INK2)
        oval(s, pb - 0.07, ly - 0.07, 0.14, fill=GREEN)


def _thumb_profile(s, x, y, w, h):
    rows = [(61, 30, 7, 2), (33, 41, 20, 6), (27, 30, 29, 14), (14, 31, 36, 19)]
    rh = (h - 0.5) / len(rows)
    bw = w - 0.5
    for i, vals in enumerate(rows):
        bx = x + 0.25
        for v, (_, col, _) in zip(vals, SCALE):
            ww = bw * v / 100
            R(s, bx, y + 0.25 + i * rh, max(ww - 0.02, 0.01), rh - 0.1, fill=col, name="Profile seg")
            bx += ww


def s_deliverables(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "Layer 01 · Diagnose",
           "Diagnose gives leaders four views of where execution will stall.")
    items = [("Readiness Map", "Readiness by cohort and component, so interventions land in the right place.",
              _thumb_map),
             ("Risk and Reward Profiles", "Friction and flow factors, ranked by likely impact on timelines.",
              _thumb_tornado),
             ("Stakeholder Alignment", "Where leadership narratives diverge before the front line feels it.",
              _thumb_align),
             ("Change Readiness Profile", "The share of each cohort ready today, and the constraint holding the rest.",
              _thumb_profile)]
    for i, (n, d, fn) in enumerate(items):
        x, w = cx(i * 3), span(3)
        card(s, x, 2.2, w, 1.75)
        fn(s, x, 2.2, w, 1.75)
        T(s, x, 4.15, w, 0.75, n, size=SUB, bold=True, color=INK, line=1.0)
        T(s, x, 4.9, w, 1.1, d, size=BODY, color=INK2, line=1.12)
        if i == 3:
            caps(s, x, 6.02, w, "Shown next", color=GREEN7, bold=True)
    badge(s, SW - M - 1.55, 1.92, "Illustrative", w=1.55)
    T(s, M, 6.4, span(12), 0.32,
      "One map for leadership: where we will lose execution velocity, why, and what to change.",
      size=BODY, bold=True, color=INK)
    notes(s, NOTES["deliverables"][mode])
    return s


# =============================================================== 10 readiness profile (real data)
COHORTS = [  # name, n, champion, ready, hesitant, resistant, binding constraint
    ("Technology & Data", 88, 61, 30, 7, 2, "None"),
    ("Marketing", 62, 58, 31, 9, 2, "None"),
    ("Sales & Distribution", 110, 33, 41, 20, 6, "Support (mild)"),
    ("Claims", 141, 27, 30, 29, 14, "Incentive"),
    ("Underwriting", 96, 24, 27, 31, 18, "Incentive"),
    ("Legal & Compliance", 61, 22, 26, 32, 20, "Incentive"),
    ("Customer Service", 127, 14, 31, 36, 19, "Value (credibility)"),
]
SUPPRESSED = ("Senior Leaders", 34)  # below the 50-person reporting minimum
MIN_GROUP = 50


def s_profile(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "Layer 01 · Change Readiness Profile",
           "In three cohorts, readiness is already there. Incentives are holding it back.")
    data = sorted(COHORTS, key=lambda r: -r[2])
    n = len(data)
    lx, lw = cx(0), span(3)
    chx, chw = cx(3), span(4)
    tx, tw = cx(7), span(2)
    ox, ow = cx(9), span(3)
    top, rows_h = 2.62, 3.08
    rh = rows_h / n
    # legend + column headers
    caps(s, lx, 2.08, lw, "Cohort  ·  respondents", color=MUTED, bold=True)
    caps(s, tx, 2.08, span(3), "Binding constraint", color=MUTED, bold=True)
    lgx = chx
    for name, col, _ in SCALE:
        R(s, lgx, 2.32, 0.16, 0.16, fill=col, name="Legend swatch")
        T(s, lgx + 0.22, 2.27, 1.0, 0.26, name, size=CAP, color=INK2, anchor=MSO_ANCHOR.MIDDLE)
        lgx += 0.22 + 0.072 * len(name) + 0.24
    # native 100% stacked bar chart
    cd = CategoryChartData()
    cd.categories = [r[0] for r in data]
    for j, (name, col, _) in enumerate(SCALE):
        cd.add_series(name, [r[2 + j] for r in data])
    gf = s.shapes.add_chart(XL_CHART_TYPE.BAR_STACKED_100, In(chx), In(top), In(chw), In(rows_h), cd)
    gf.name = "Chart readiness profile"
    ch = gf.chart
    ch.has_legend = False
    ch.has_title = False
    ch.font.name, ch.font.size = FONT, Pt(CAP)
    pl = ch.plots[0]
    pl.gap_width, pl.overlap = 55, 100
    ca, va = ch.category_axis, ch.value_axis
    ca.reverse_order = True
    ca.visible = False
    va.visible = False
    va.has_major_gridlines = False
    for j, ser in enumerate(pl.series):
        name, col, txt = SCALE[j]
        ser.format.fill.solid()
        ser.format.fill.fore_color.rgb = rgb(col)
        ser.format.line.color.rgb = rgb(WHITE)
        ser.format.line.width = Pt(1.5)
        dl = ser.data_labels
        dl.show_value = True
        dl.number_format, dl.number_format_is_linked = '0"%"', False
        dl.position = XL_LABEL_POSITION.CENTER
        dl.font.size, dl.font.bold, dl.font.color.rgb = Pt(CAP), True, rgb(txt)
        for i, r in enumerate(data):
            if r[2 + j] < 7:
                hide_point_label(ser, i)
    chart_clean(ch, inner=(0, 0, 1, 1))
    for i, (name, cnt, c, rd, h_, rs, con) in enumerate(data):
        y = top + i * rh
        T(s, lx, y, lw, rh, [[(name, {"bold": True}), (f"   n = {cnt}", {"size": CAP, "color": MUTED})]],
          size=BODY, color=INK, anchor=MSO_ANCHOR.MIDDLE)
        inc = con == "Incentive"
        pw = 0.3 + 0.082 * len(con)
        pill(s, tx, y + (rh - 0.3) / 2, pw, 0.3, con, fill=INK if inc else WHITE,
             line=None if inc else LINE, color=WHITE if inc else INK2, size=CAP, bold=inc)
    # insight annotation: bracket around the three Incentive rows
    i0 = [i for i, r in enumerate(data) if r[6] == "Incentive"]
    by0, by1 = top + i0[0] * rh + 0.06, top + (i0[-1] + 1) * rh - 0.06
    bx = ox - 0.1
    line(s, bx, by0, bx, by1, color=GREEN, w=2)
    line(s, bx - 0.1, by0, bx, by0, color=GREEN, w=2)
    line(s, bx - 0.1, by1, bx, by1, color=GREEN, w=2)
    shares = [r[2] + r[3] for r in data if r[6] == "Incentive"]
    lo, hi = min(shares), max(shares)
    T(s, ox + 0.12, by0 - 0.55, ow - 0.1, 2.0,
      [[("Readiness is there.", {"bold": True, "color": GREEN7})],
       f"{lo} to {hi}% of Claims, Underwriting and Legal already score Ready or Champion. "
       "Fix the incentive before adding training."],
      size=BODY, color=INK, line=1.12, after=4, anchor=MSO_ANCHOR.MIDDLE)
    # privacy + suppression
    py = top + rows_h + 0.22
    icon(s, "lock", "ink2", lx, py + 0.02, 0.28)
    T(s, lx + 0.42, py, span(12) - 0.42, 0.32,
      [[("Shares, never names. ", {"bold": True}),
        (f"Groups under {MIN_GROUP} people are never reported, so {SUPPRESSED[0]} is not shown.", {})]],
      size=BODY, color=INK2, anchor=MSO_ANCHOR.MIDDLE)
    shown = sum(r[1] for r in data)
    T(s, lx, py + 0.48, span(12), 0.4,
      f"Real client readout, anonymized. Enterprise AI adoption program. n = {shown} across the "
      f"{n} cohorts shown. Champion = CCI score of 4 or higher. Bands use the five confidence components. "
      "Value and Incentive are scored separately. No cohort mean is reported: an average describes none of them.",
      size=CAP, color=MUTED, line=1.15)
    notes(s, NOTES["profile"][mode])
    return s


# =============================================================== 11 CCI+2 model
COMPONENTS = [("Support", "Does my world give me what I need?"),
              ("Openness", "Am I looking ahead?"),
              ("Proactive", "Am I initiating?"),
              ("Adaptability", "Can I handle what is changing now?"),
              ("Learning", "Am I building the skills?")]


def s_model(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "Layer 01 · How readiness is measured",
           "Confidence sets readiness. Value amplifies it. Incentive decides whether anyone moves.")
    caps(s, M, 2.0, span(5), "Change Confidence Index · five components", color=GREEN7, bold=True)
    px, pw, ph, gap, y0 = M, span(4) + 0.35, 0.62, 0.1, 2.3
    flow_y = y0 + (5 * ph + 4 * gap) / 2
    x0 = px + pw + 0.45                      # start of the flow region
    cxs = [x0 + 0.85 + k * 1.72 for k in range(4)]  # stage centres
    gw = 1.6
    gx = cxs[0] - gw / 2
    for i, (n, q) in enumerate(COMPONENTS):
        y = y0 + i * (ph + gap)
        card(s, px, y, pw, ph, radius=ph / 2)
        oval(s, px + 0.2, y + (ph - 0.18) / 2, 0.18, fill=GREEN, name="Component dot")
        T(s, px + 0.52, y, 1.45, ph, n, size=BODY, bold=True, color=INK, anchor=MSO_ANCHOR.MIDDLE)
        T(s, px + 1.95, y, pw - 2.05, ph, q, size=BODY, color=INK2, anchor=MSO_ANCHOR.MIDDLE, line=1.0)
        line(s, px + pw + 0.02, y + ph / 2, gx - 0.06, flow_y, color=HESIT, w=1.25)
    # stage 1: readiness gauge (block arcs; python-pptx angle adjustments are degrees x 0.6)
    gy = flow_y - gw / 2
    bg = R(s, gx, gy, gw, gw, fill=SURF, line=LINE, lw=0.75, shape=MSO_SHAPE.BLOCK_ARC, name="Gauge track")
    bg.adjustments[0], bg.adjustments[1], bg.adjustments[2] = 180 * 0.6, 0, 0.2
    fg = R(s, gx, gy, gw, gw, fill=GREEN, shape=MSO_SHAPE.BLOCK_ARC, name="Gauge fill")
    fg.adjustments[0], fg.adjustments[1], fg.adjustments[2] = 180 * 0.6, 297 * 0.6, 0.2
    ay = flow_y - 0.05
    # stage 2: value amplifier
    ax = cxs[1] - 0.45
    line(s, gx + gw + 0.06, ay, ax - 0.06, ay, color=INK2, w=1.5, head=True)
    R(s, ax, ay - 0.5, 0.9, 1.0, fill=TINT, line=GREEN, lw=2, shape=MSO_SHAPE.ISOSCELES_TRIANGLE,
      rot=90, name="Value amplifier")
    T(s, ax + 0.05, ay - 0.2, 0.6, 0.4, "\u00d7", size=SUB, bold=True, color=GREEN7, align=PP_ALIGN.CENTER,
      anchor=MSO_ANCHOR.MIDDLE)
    # stage 3: incentive gate (valve)
    vx = cxs[2] - 0.42
    line(s, ax + 0.96, ay, vx - 0.06, ay, color=INK2, w=1.5, head=True)
    R(s, vx, ay - 0.36, 0.42, 0.72, fill=INK, shape=MSO_SHAPE.ISOSCELES_TRIANGLE, rot=90, name="Valve L")
    R(s, vx + 0.42, ay - 0.36, 0.42, 0.72, fill=INK, shape=MSO_SHAPE.ISOSCELES_TRIANGLE, rot=270,
      name="Valve R")
    line(s, vx + 0.42, ay - 0.62, vx + 0.42, ay, color=INK, w=2.5)
    line(s, vx + 0.22, ay - 0.62, vx + 0.62, ay - 0.62, color=INK, w=2.5)
    # stage 4: movement
    ox = cxs[3] - 0.42
    line(s, vx + 0.9, ay, ox - 0.06, ay, color=INK2, w=1.5, head=True)
    oval(s, ox, ay - 0.42, 0.84, fill=GREEN, name="Movement")
    icon(s, "arrow-right", "white", ox + 0.2, ay - 0.22, 0.44)
    ly = flow_y + 0.7
    labs = [("Readiness", "Set by the five confidence components"),
            ("Value amplifies", "Is this worth it, for me?"),
            ("Incentive gates", "Does it pay, and is it safe?"),
            ("People move", "Behavior changes at work")]
    for c, (a_, b_) in zip(cxs, labs):
        T(s, c - 0.8, ly, 1.6, 1.25, [[(a_, {"bold": True, "color": INK})], b_], size=BODY, color=INK2,
          align=PP_ALIGN.CENTER, line=1.08, after=2)
    # gating rule (one sentence)
    card(s, M, 6.08, span(12), 0.62, fill=SURF)
    T(s, M + 0.3, 6.08, span(12) - 0.6, 0.62,
      [[("Gating rule: ", {"bold": True, "color": GREEN7}),
        ("if the change is not worth it or does not pay, readiness is capped, whatever confidence says.", {})]],
      size=BODY, color=INK, anchor=MSO_ANCHOR.MIDDLE)
    notes(s, NOTES["model"][mode])
    return s


# =============================================================== 12 activate
STEPS = [("Clarify priorities", "What the change means for me, specifically."),
         ("Surface blockers", "Name what is in the way, in my own words."),
         ("Reframe resistance", "Build readiness before it is required."),
         ("Connect back to work", "Tie the strategy to this week's tasks.")]


def s_activate(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "Layer 02 · Activate",
           "A short weekly conversation moves each person from ambiguity to agency.")
    cw_, chh = 3.0, 1.45
    gx_, gy_ = 0.85, 1.05
    pos = [(M, 2.2), (M + cw_ + gx_, 2.2), (M + cw_ + gx_, 2.2 + chh + gy_), (M, 2.2 + chh + gy_)]
    for i, ((x, y), (n, d)) in enumerate(zip(pos, STEPS)):
        card(s, x, y, cw_, chh, fill=TINT if i == 0 else SURF)
        caps(s, x + 0.25, y + 0.2, 1, f"0{i + 1}", color=GREEN7, bold=True)
        T(s, x + 0.25, y + 0.42, cw_ - 0.5, 0.3, n, size=BODY, bold=True, color=INK)
        T(s, x + 0.25, y + 0.74, cw_ - 0.45, 0.55, d, size=BODY, color=INK2, line=1.05)
    # cycle arrows
    a = GREEN
    line(s, M + cw_ + 0.08, 2.2 + chh / 2, M + cw_ + gx_ - 0.08, 2.2 + chh / 2, color=a, w=2, head=True)
    rx = M + cw_ + gx_ + cw_ / 2
    line(s, rx, 2.2 + chh + 0.08, rx, 2.2 + chh + gy_ - 0.08, color=a, w=2, head=True)
    by = 2.2 + chh + gy_ + chh / 2
    line(s, M + cw_ + gx_ - 0.08, by, M + cw_ + 0.08, by, color=a, w=2, head=True)
    lx_ = M + cw_ / 2
    line(s, lx_, 2.2 + chh + gy_ - 0.08, lx_, 2.2 + chh + 0.08, color=a, w=2, head=True)
    T(s, lx_ + 0.2, 2.2 + chh + 0.2, rx - lx_ - 0.4, 0.85,
      [[("Every week", {"bold": True})], "One private 1:1 session"],
      size=BODY, color=INK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, line=1.1)
    # right: facts and timeline
    x, w = cx(8), span(4)
    caps(s, x, 2.2, w, "What makes it stick", color=MUTED, bold=True)
    facts = [("clock", "10 to 15 minutes a week"), ("lock", "Private and 1:1"),
             ("messages-square", "Remembers context"),
             ("sliders-horizontal", "A tone each person picks")]
    for i, (ic, t) in enumerate(facts):
        fy = 2.52 + i * 0.47
        icon(s, ic, "green7", x, fy + 0.05, 0.3)
        T(s, x + 0.45, fy, w - 0.45, 0.4, t, size=BODY, bold=True, color=INK, anchor=MSO_ANCHOR.MIDDLE)
    ty = 4.55
    caps(s, x, ty, w, "12 to 24 weeks of reinforcement", color=MUTED, bold=True)
    step = w / 24
    d = 0.12
    for k in range(24):
        dx = x + k * step + (step - d) / 2
        core = k < 12
        oval(s, dx, ty + 0.62, d, fill=GREEN if core else None, line=None if core else GREEN, lw=1.25,
             name="Session")
    caps(s, x, ty + 0.33, w / 2, "Core · 12 weeks", color=GREEN7, bold=True)
    caps(s, x + w / 2, ty + 0.33, w / 2, "Extended · to 24", color=GREEN7, bold=True)
    caps(s, x, ty + 0.85, 0.8, "Wk 1", color=MUTED)
    caps(s, x + 11.5 * step - 0.4, ty + 0.85, 0.8, "Wk 12", color=MUTED, align=PP_ALIGN.CENTER)
    caps(s, x + w - 0.8, ty + 0.85, 0.8, "Wk 24", color=MUTED, align=PP_ALIGN.RIGHT)
    T(s, x, ty + 1.3, w, 0.7, "Small shifts, reinforced weekly, compound into new habits.",
      size=BODY, bold=True, color=INK, line=1.1)
    notes(s, NOTES["activate"][mode])
    return s


# =============================================================== 13 measure dashboard
TREND = {  # illustrative CCI+2 level, weeks 1-12
    "Technology & Data": [3.90, 3.95, 4.00, 4.00, 4.05, 4.10, 4.10, 4.15, 4.20, 4.20, 4.25, 4.30],
    "Sales & Distribution": [3.40, 3.45, 3.50, 3.55, 3.55, 3.60, 3.65, 3.70, 3.75, 3.75, 3.80, 3.85],
    "Claims": [3.05, 3.00, 3.05, 3.00, 3.05, 3.05, 3.20, 3.35, 3.45, 3.55, 3.60, 3.65],
    "Customer Service": [3.00, 2.95, 2.95, 2.90, 2.85, 2.85, 2.80, 2.75, 2.70, 2.70, 2.65, 2.60],
}
TREND_STYLE = {"Technology & Data": (GRAYMARK, 1.75), "Sales & Distribution": (GRAYMARK, 1.75),
               "Claims": (GREEN, 3.0), "Customer Service": (INK, 3.0)}


def s_measure(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "Layer 03 · Measure",
           "Leaders get a weekly execution signal, not a quarterly snapshot.")
    fx, fy, fw, fh = M, 2.05, span(12), 4.7
    card(s, fx, fy, fw, fh, fill=WHITE, line=LINE, radius=0.14)
    # app bar
    icon(s, "gauge", "green7", fx + 0.25, fy + 0.2, 0.3)
    T(s, fx + 0.65, fy + 0.15, 3.2, 0.4, [[("Execution signal", {"bold": True}),
                                           ("   Week 12 · all units", {"size": CAP, "color": MUTED})]],
      size=BODY, color=INK, anchor=MSO_ANCHOR.MIDDLE)
    px = fx + fw - 0.25
    for t in reversed(["Unit", "Function", "Region", "Role"]):
        w = 0.35 + 0.085 * len(t)
        px -= w
        pill(s, px, fy + 0.2, w, 0.3, t, fill=WHITE, line=LINE, color=INK2, size=CAP)
        px -= 0.1
    badge(s, px - 1.9, fy + 0.22, "Illustrative data", w=1.75)
    line(s, fx, fy + 0.68, fx + fw, fy + 0.68, color=LINE, w=1)
    # KPI column
    kx, ky = fx + 0.3, fy + 0.95
    kpis = [("Champion share", "41%", "▲ 6 pts since week 1", GREEN7),
            ("Hotspots", "1", "Customer Service", INK2),
            ("Participation", "78%", "of invited employees", INK2)]
    for i, (a, v, b, bc) in enumerate(kpis):
        yy = ky + i * 1.22
        caps(s, kx, yy, 2.3, a, color=MUTED, bold=True)
        T(s, kx, yy + 0.22, 2.3, 0.55, v, size=HEAD, bold=True, color=INK)
        T(s, kx, yy + 0.78, 2.3, 0.3, b, size=CAP, color=bc, bold=bc == GREEN7)
    # line chart
    chx, chy, chw, chh = fx + 2.75, fy + 0.85, 5.7, 3.6
    caps(s, chx + 0.05, fy + 0.85, 3, "CCI+2 level by cohort", color=MUTED, bold=True)
    cd = CategoryChartData()
    cd.categories = [f"W{i}" for i in range(1, 13)]
    for k, v in TREND.items():
        cd.add_series(k, v)
    gf = s.shapes.add_chart(XL_CHART_TYPE.LINE, In(chx), In(chy + 0.25), In(chw), In(chh - 0.25), cd)
    gf.name = "Chart CCI+2 trend"
    ch = gf.chart
    ch.has_legend = False
    ch.has_title = False
    ch.font.name, ch.font.size, ch.font.color.rgb = FONT, Pt(CAP), rgb(MUTED)
    va, ca = ch.value_axis, ch.category_axis
    va.minimum_scale, va.maximum_scale, va.major_unit = 2.5, 4.5, 0.5
    va.has_major_gridlines = True
    va.major_gridlines.format.line.color.rgb = rgb("EEEEEE")
    va.major_gridlines.format.line.width = Pt(0.75)
    va.format.line.fill.background()
    va.tick_labels.number_format, va.tick_labels.number_format_is_linked = "0.0", False
    va.major_tick_mark = XL_TICK_MARK.NONE
    ca.format.line.color.rgb = rgb(LINE)
    ca.major_tick_mark = XL_TICK_MARK.NONE
    for ser in ch.plots[0].series:
        col, w = TREND_STYLE[ser.name]
        ser.smooth = False
        ser.format.line.color.rgb = rgb(col)
        ser.format.line.width = Pt(w)
        ser.marker.style = XL_MARKER_STYLE.NONE
    ix, iy, iw, ih = 0.09, 0.03, 0.72, 0.86
    chart_clean(ch, inner=(ix, iy, iw, ih))
    # direct labels at line ends + hotspot pins (positions derived from fixed inner layout)
    pxl, pyt = chx + ix * chw, chy + 0.25 + iy * (chh - 0.25)
    pw_, ph_ = iw * chw, ih * (chh - 0.25)
    def pt(k, v):
        return pxl + (k + 0.5) * pw_ / 12, pyt + (4.5 - v) / 2.0 * ph_
    labels = {"Technology & Data": "Tech & Data", "Sales & Distribution": "Sales",
              "Claims": "Claims", "Customer Service": "Customer Svc"}
    for k, v in TREND.items():
        x, y = pt(11, v[-1])
        col, w = TREND_STYLE[k]
        T(s, x + 0.12, y - 0.13, 1.4, 0.26, labels[k], size=CAP, bold=w > 2,
          color=GREEN7 if col == GREEN else (INK if col == INK else MUTED), anchor=MSO_ANCHOR.MIDDLE)
    x, y = pt(5, TREND["Claims"][5])
    oval(s, x - 0.11, y - 0.11, 0.22, fill=WHITE, line=GREEN, lw=2.25, name="Pin claims")
    T(s, x - 2.0, y - 0.36, 1.85, 0.24, "Incentive fixed, wk 6", size=CAP, color=GREEN7, bold=True,
      align=PP_ALIGN.RIGHT)
    x, y = pt(11, TREND["Customer Service"][-1])
    oval(s, x - 0.11, y - 0.11, 0.22, fill=WHITE, line=INK, lw=2.25, name="Pin CS")
    # signals column
    sx, sw = fx + 8.75, fw - 8.75 - 0.3
    caps(s, sx, fy + 0.95, sw, "Signals this week", color=MUTED, bold=True)
    sig = [("triangle-alert", "ink", "Customer Service", "Down six weeks running. Value credibility is the binding constraint.", INK),
           ("trending-up", "green7", "Claims", "Recovering since the incentive fix in week 6.", GREEN7)]
    for i, (ic, icol, t, d, tc) in enumerate(sig):
        yy = fy + 1.3 + i * 1.6
        card(s, sx, yy, sw, 1.42, fill=SURF)
        icon(s, ic, icol, sx + 0.2, yy + 0.2, 0.3)
        T(s, sx + 0.6, yy + 0.18, sw - 0.75, 0.32, t, size=BODY, bold=True, color=tc, anchor=MSO_ANCHOR.MIDDLE)
        T(s, sx + 0.2, yy + 0.58, sw - 0.35, 0.8, d, size=CAP + 1, color=INK2, line=1.12)
    notes(s, NOTES["measure"][mode])
    return s


# =============================================================== proof + next step
CASES = [
    ("Asahi Kasei Pharma", "Clinical Development Center", "M&A integration", "2.7 / 5",
     "perceived support, surfaced as a hidden risk in a multi-continent merger",
     "During integration. Milestones met."),
    ("Skanska", "Leadership development", "Leadership transformation", "3× faster",
     "a 6-month leadership journey delivered in 2 months, scaled to thousands",
     "2 months, versus 6 before"),
    ("Coach A", "TSE: 9339", "AI transformation", "3",
     "AI-powered products launched after embedding AI across its offer",
     "Partner since Aug 2023. Also resells Pandatron in Japan."),
]


def _contact(s, x, y, w, h):
    card(s, x, y, w, h)
    T(s, x + 0.3, y + 0.28, w - 0.6, 0.32, "Robert Newland", size=BODY, bold=True, color=INK)
    caps(s, x + 0.3, y + 0.62, w - 0.6, "Head of Growth", color=MUTED, bold=True)
    T(s, x + 0.3, y + 0.95, w - 0.6, 0.3, [[(EMAIL, {"link": "mailto:" + EMAIL, "color": GREEN7})]],
      size=BODY, color=GREEN7)
    T(s, x + 0.3, y + 1.27, w - 0.6, 0.3, [[("www.pandatron.ai", {"link": WEB, "color": GREEN7})]],
      size=BODY, color=GREEN7)
    q = 1.15
    qr = s.shapes.add_picture(os.path.join(ASSETS, "qr-contact.png"), In(x + 0.3), In(y + h - q - 0.25),
                              In(q), In(q))
    qr.name = "QR email Robert"
    qr.click_action.hyperlink.address = MAILTO
    T(s, x + 0.3 + q + 0.2, y + h - q - 0.25, w - q - 0.85, q,
      [[("Scan to email Robert", {"bold": True})], "Subject line pre-filled: Diagnose pilot"],
      size=CAP + 1, color=INK2, anchor=MSO_ANCHOR.MIDDLE, line=1.15, after=3)


PILOT_SHORT = ["Pick one live transformation where slow adoption costs the business.",
               "We diagnose a meaningful population, in their own words.",
               "You see friction, readiness by cohort and the decisions it supports. Then you decide."]
CASE_SHORT = ["perceived support, a risk leadership had not seen",
              "6-month leadership journey delivered in 2 months",
              "AI products launched. Coach A also resells Pandatron."]
PILOT = ["Pick one live transformation where slow adoption clearly costs the business.",
         "We diagnose a meaningful population of employees, in their own words.",
         "You see friction patterns, readiness by cohort and the decisions the data supports. Then you decide."]


def s_close_live(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "Next step",
           "Start with one live transformation. Decide once you see the data.")
    lw = span(8)
    ask_card(s, M, 2.05, lw, 0.72, "What feels like a sensible next step?", size=SUB, compact=True, tail=0.12)
    caps(s, M, 3.02, lw, "Our suggestion", color=MUTED, bold=True)
    sw = (lw - 2 * 0.3) / 3
    for i, t in enumerate(PILOT_SHORT):
        x = M + i * (sw + 0.3)
        num_ring(s, x, 3.3, 0.44, i + 1)
        T(s, x, 3.85, sw, 1.15, t, size=BODY, color=INK, line=1.08)
    _contact(s, cx(8), 2.05, span(4), 2.95)
    caps(s, M, 5.2, span(8), "Where this has worked", color=MUTED, bold=True)
    for i, (nm, unit, ctx, met, desc, tf) in enumerate(CASES):
        x, w = cx(i * 4), span(4)
        desc = CASE_SHORT[i]
        card(s, x, 5.47, w, 1.35, fill=WHITE, line=LINE)
        T(s, x + 0.25, 5.6, w - 0.5, 0.3, [[(nm, {"bold": True}), (f"  {ctx}", {"size": CAP, "color": MUTED})]],
          size=BODY, color=INK, anchor=MSO_ANCHOR.MIDDLE)
        T(s, x + 0.25, 5.97, w - 0.5, 0.75, [[(met + "  ", {"size": SUB, "bold": True, "color": GREEN7}),
                                             (desc, {})]],
          size=CAP + 1, color=INK2, line=1.05)
    notes(s, NOTES["close"]["live"])
    return s


def s_proof(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "Where this has worked",
           "Clients used it to surface hidden risk, compress a program and launch AI products.")
    for i, (nm, unit, ctx, met, desc, tf) in enumerate(CASES):
        x, w, y, h = cx(i * 4), span(4), 2.2, 4.3
        card(s, x, y, w, h)
        T(s, x + 0.35, y + 0.3, w - 0.7, 0.36, nm, size=BODY, bold=True, color=INK)
        caps(s, x + 0.35, y + 0.68, w - 0.7, unit, color=MUTED, bold=True)
        pill(s, x + 0.35, y + 1.02, 0.4 + 0.1 * len(ctx), 0.3, ctx.upper(), fill=WHITE, line=LINE,
             color=INK2, size=CAP - 1, bold=True, spacing=1)
        T(s, x + 0.35, y + 1.55, w - 0.7, 0.95, met, size=DISPLAY, bold=True, color=GREEN, line=1.0)
        T(s, x + 0.35, y + 2.55, w - 0.7, 1.0, desc[0].upper() + desc[1:] + ".", size=BODY, color=INK, line=1.12)
        icon(s, "calendar", "muted", x + 0.35, y + h - 0.6, 0.24)
        T(s, x + 0.7, y + h - 0.66, w - 1.0, 0.4, tf, size=CAP, color=MUTED, anchor=MSO_ANCHOR.MIDDLE, line=1.1)
    T(s, M, 6.62, span(12), 0.25,
      "Sources: Pandatron client case studies. Coach A is a Pandatron partner. Its share price is not attributed to Pandatron.",
      size=CAP, color=MUTED)
    notes(s, NOTES["proof"]["leave"])
    return s


def s_next_leave(prs, mode, page, total):
    s = blank(prs)
    chrome(s, page, total, "Next step",
           "Start with one live transformation. Decide once you see the data.")
    lw = span(8)
    caps(s, M, 2.1, lw, "How a diagnostic works", color=MUTED, bold=True)
    for i, t in enumerate(PILOT):
        y = 2.5 + i * 1.1
        num_ring(s, M, y, 0.5, i + 1)
        T(s, M + 0.75, y - 0.02, lw - 0.8, 0.9, t, size=SUB, color=INK, line=1.1)
    T(s, M, 6.0, lw, 0.6,
      [[("What you get: ", {"bold": True}),
        ("the Readiness Map, Risk and Reward Profiles, Stakeholder Alignment and the Change Readiness Profile.", {})]],
      size=BODY, color=INK2, line=1.15)
    _contact(s, cx(8), 2.1, span(4), 3.3)
    notes(s, NOTES["next"]["leave"])
    return s


# =============================================================== notes
NOTES = {
    "cover": {
        "live": """PURPOSE: a 45-minute discovery conversation, not a pitch.
OPEN: "I'll share a pattern we keep seeing, but mostly I want to understand your transformation. By the end, let's decide together whether a diagnostic is worth it."
AGREE: time available, who else should hear this, which transformation we will talk about.""",
        "leave": "Leave-behind version. Self-explanatory, no presenter needed. Sources are listed in the notes of each slide."},
    "risk": {
        "live": """ASK, then stop talking. Do not advance until they answer.
PROBE: "What makes you say that?" "Where have you seen it show up?"
Most leaders pick the third option. If they pick strategy or technology, explore it honestly, then ask how adoption fits into it.
LISTEN FOR: named programs, timelines, sponsor, what is at stake if it slips.
DO NOT reveal the pattern yet. The next slide does that."""},
    "evidence": {
        "live": """TALK TRACK: "Whatever you answered, here is what the research says. The plan usually survives approval. It stalls where people meet it."
SOURCES (verify exact wording before external use):
1. Bain & Company press release, 15 Apr 2024: "88% of business transformations fail to achieve their original ambitions". Survey of 400+ executives. Caveat if asked: Bain's main explanation is talent allocation (overloading top talent), not employee resistance.
2. Kearney Transformation Study 2026, "The adoption gap: why most transformations fail after the strategy is approved". 102 transformation leaders at companies with $500M to $10B revenue. Resistance to change is the top-cited implementation barrier. Only 29% of transformations consistently deliver intended value.
3. Bain & Company, 29 Jan 2026. Survey of ~1,000 executives and employees who went through a reorganization. Only 22% of employees received sufficient training, coaching or tools.
FRAMING: "resistance" is usually a signal of an unmet cost, not a character flaw. That is where the four costs come in.""",
        "leave": """Sources: Bain & Company, 15 Apr 2024 (400+ executives). Kearney Transformation Study 2026, "The adoption gap" (102 transformation leaders). Bain & Company, 29 Jan 2026 (~1,000 executives and employees)."""},
    "theater": {
        "live": """TALK TRACK: "This is adoption theater. The dashboard says adoption is healthy while people quietly work around the new process. The real danger is not slow adoption. It is that leadership loses its feel for what is actually happening."
EVIDENCE: Bain 2026. 88% of leaders believe their reorganization will deliver. 36% of employees agree.
The dashboard numbers on the left are illustrative, not client data.
OPTIONAL PROBE: "Why might a clearer picture of employee friction be useful to you right now?"
LENS (if the buyer likes theory): institutional theory calls this "decoupling" (Meyer and Rowan, 1977). Argyris called it espoused theory versus theory-in-use.""",
        "leave": "Dashboard figures are illustrative. Perception gap: Bain & Company, Jan 2026, ~1,000 executives and employees who went through a reorganization."},
    "ruler": {
        "live": """ASK the 1 to 10 question. Let them pick a number.
FOLLOW-UP: "Why isn't that number lower?" (Not "why isn't it higher".) This is the readiness ruler from motivational interviewing. Asking why it is not lower makes them list what already works.
EXPECT: leadership support, a transformation office, change champions, good communications. Acknowledge it: "The pieces are there."
THEN: "The gap usually isn't commitment. It's resolution. You can see that friction exists, but not what kind, where it concentrates, or what intervention it needs." """,
        "leave": "Snapshot tools are useful for detecting friction. They rarely resolve its type, location or the intervention it needs."},
    "costs": {
        "live": """TALK TRACK: "Most friction gets filed as a skills problem, so the default fix is training. Training only fixes the first one."
Knowledge: something new, unknown or undecided.
Bandwidth: no room. Time, tools, access. The environment does not permit the behavior yet.
Identity: work is changing shape and the change reads as a threat to standing.
Loss: something valued is ending. Explaining why the new model is better only confirms the loss.
ASK the card question. Probe for examples. Note which cost they name: it shapes the diagnostic.
SUPPORTING DATA: WEF Future of Jobs Report 2025. Employers name skills gaps as the #1 barrier (63%), culture and resistance to change as #2 (46%). That is the "filed as a skills problem" pattern.
LINEAGE (for HR and OD buyers): Heifetz and Linsky, technical versus adaptive challenges ("people resist loss, not change"). William Bridges, Managing Transitions. Kegan and Lahey, Immunity to Change.""",
        "leave": "Supporting data: WEF Future of Jobs Report 2025, 1,000+ employers. Skills gaps are the most cited barrier (63%), culture and resistance to change second (46%)."},
    "decisions": {
        "live": """ASK the card question. Let them pick one decision and go deep.
FOLLOW-UP: "And why would that matter to the business?" Listen for the cost of delay: revenue, productivity, attrition, regulatory dates.
QUANTIFY if possible: "What does a month of delay cost?" Write the number down. It anchors the pilot later.""",
        "leave": "Seeing friction by unit, function, geography and role informs where to communicate, support, simplify, intervene and invest."},
    "loop": {
        "live": """TALK TRACK: "Diagnosis is one layer of three. The same conversations that map friction then activate change at the individual level, and give leaders a weekly read on whether execution is happening."
Diagnose: maps readiness and friction by cohort.
Activate: weekly 10 to 15 minute 1:1 AI conversations.
Measure: the same conversations become the execution signal.
KEY POINT: one engine, not three tools. The loop closes because Measure feeds the next Diagnose.""",
        "leave": "Diagnose, Activate and Measure run on the same 1:1 AI conversations, so the signal and the intervention come from one source."},
    "deliverables": {
        "live": """TALK TRACK: "Not whether employees like the change. Not another generic readiness score. Conversations that reveal where friction sits, what kind it is, and how it differs across populations."
Readiness Map: WHERE. Readiness by cohort and component.
Change Readiness Profile: HOW MANY. Share of each cohort at each readiness level, plus the binding constraint.
Thumbnails are illustrative. The next slide shows a real Profile.""",
        "leave": "Thumbnails are illustrative. A real Change Readiness Profile follows."},
    "profile": {
        "live": """HOW TO READ: each bar is one cohort, 100% of its respondents. Dark green = Champion (CCI score 4+), light green = Ready, light gray = Hesitant, dark gray = Resistant. Sorted by Champion share.
INSIGHT: Claims, Underwriting and Legal look unready, but 48 to 57% of them already score Ready or Champion. The binding constraint is Incentive. Fix the incentive before adding training hours.
CAUTION: do not claim these cohorts will "activate without training". 43 to 52% of them are still Hesitant or Resistant.
PRIVACY: shares, never names. Groups under 50 people are never reported. Senior Leaders (n below 50) is suppressed for that reason.
DATA: real client readout, anonymized. n = 685 across 7 cohorts shown. The original slide footnote said n = 792. Confirm the reconciliation before quoting a total.""",
        "leave": "Real client readout, anonymized. Groups under 50 people are never reported. n = 685 across the 7 cohorts shown."},
    "model": {
        "live": """TALK TRACK: "We measure with the Change Confidence Index, plus two. Five confidence components say how ready people feel. Value and Incentive say whether they will move."
Support: the organization and team provide resources and psychological safety.
Openness: willingness to prepare for future shifts.
Proactive: tendency to initiate improvements and experiments.
Adaptability: confidence to handle current changes.
Learning: motivation to acquire new skills.
Value: whether the change is worth it, for the organization and on the person's own ledger.
Incentive: what the organization actually rewards, and whether moving feels safe.
GATING RULE: read the scarcest component, not the average (Liebig's law of the minimum).
BE READY FOR: reliability and validity questions from I/O psychologists. Offer the technical note rather than improvising.""",
        "leave": "CCI+2: five confidence components (Support, Openness, Proactive, Adaptability, Learning) plus Value and Incentive, scored separately."},
    "activate": {
        "live": """TALK TRACK: "Not a training room. Not a scheduled workshop. A short, private conversation, personalized to each person's role, inside real work."
THE SESSION LOOP: clarify priorities, surface blockers, reframe resistance, connect back to work.
WHAT MAKES IT STICK: conversational memory across sessions, a tone each person chooses (analytical, supportive or challenging), and behavioral-science sequencing.
DO NOT say "rated the #1 differentiator by users" until we have the source and sample size.""",
        "leave": "Sessions are 10 to 15 minutes a week, private and 1:1, over 12 to 24 weeks."},
    "measure": {
        "live": """TALK TRACK: "The same conversations that activate change become a live signal. Leaders see adoption patterns, friction hotspots and emerging risks by unit, function and role, weekly, while there is still time to act."
THE METRIC: CCI+2, the same seven components scored in Diagnose, tracked per cohort with level, spread and direction.
This dashboard is illustrative. Trend values are simulated, using cohorts from the Profile slide.""",
        "leave": "Dashboard is illustrative. Trend values are simulated."},
    "close": {
        "live": """ASK: "Given what we've discussed, what feels like a sensible next step?" Let them answer first.
THEN SUGGEST: pick one live transformation where slow adoption clearly costs the business. We diagnose a meaningful population, show the friction patterns, readiness by cohort and the decisions the data supports. Then they decide.
CASES (honest attribution):
Asahi Kasei Pharma, Clinical Development Center: multi-continent merger. Perceived support scored 2.7 out of 5, a risk leadership had not seen.
Skanska: a 6-month leadership journey delivered in 2 months, scaled to thousands. Confirm the internal source before quoting.
Coach A (TSE: 9339): embedded AI across its offer and launched 3 AI products. Coach A is also our reseller in Japan. Say so. Never attribute its share price to us.
QR CODE: opens an email to Robert with the subject "Diagnose pilot". Swap for a booking link when one exists."""},
    "proof": {"leave": "Case details come from Pandatron case studies. Coach A is a Pandatron reseller in Japan since Aug 2023."},
    "next": {"leave": "Contact Robert Newland, Head of Growth, robert.newland@pandatron.ai."},
}


# =============================================================== assemble
LIVE = [s_cover, s_ask_risk, s_evidence, s_theater, s_ruler, s_costs, s_decisions, s_loop,
        s_deliverables, s_profile, s_model, s_activate, s_measure, s_close_live]
LEAVE = [s_cover, s_evidence, s_theater, s_ruler, s_costs, s_decisions, s_loop, s_deliverables,
         s_profile, s_model, s_activate, s_measure, s_proof, s_next_leave]


def build(mode, fns, fname, title):
    prs = new_presentation(title, "Pandatron: diagnose change friction, activate behavior change, measure execution")
    for i, fn in enumerate(fns, start=1):
        fn(prs, mode, i, len(fns))
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, fname)
    prs.save(path)
    print("wrote", path)
    return path


if __name__ == "__main__":
    import sys
    which = sys.argv[1:] or ["live", "leave"]
    if "live" in which:
        build("live", LIVE, "Pandatron_Diagnose_Conversation_Live.pptx",
              "The Diagnose Conversation")
    if "leave" in which:
        build("leave", LEAVE, "Pandatron_Diagnose_Conversation_LeaveBehind.pptx",
              "The Diagnose Conversation: leave-behind")
