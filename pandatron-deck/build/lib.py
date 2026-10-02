"""Shared design tokens and drawing helpers for the Pandatron decks (python-pptx)."""
import copy
from lxml import etree
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR, MSO_AUTO_SIZE
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.oxml.ns import qn
from pptx.opc.constants import RELATIONSHIP_TYPE as RT
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "assets")

# ---------------------------------------------------------------- tokens
SW, SH = 13.333, 7.5            # 16:9 widescreen, inches
M, G = 0.667, 0.25              # outer margin, gutter
CW = (SW - 2 * M - 11 * G) / 12  # 12-column grid


def cx(i):
    """x of grid column i (0-11)."""
    return M + i * (CW + G)


def span(n):
    """width of n grid columns."""
    return n * CW + (n - 1) * G


# Type scale: max 3 content sizes per slide, caption reserved for metadata
DISPLAY, HEAD, SUB, BODY, CAP = 54, 30, 20, 16, 11

# Color: brand green is the single accent, everything else neutral
GREEN = "28A019"    # brand accent (logo). Fills, icons, text >= 20pt bold only (3.4:1)
GREEN7 = "1E7A13"   # text-safe green for small text (5.5:1 on white)
TINT = "EAF7E6"     # accent tint for highlighted surfaces
INK = "1A1A1A"      # primary text (17.4:1)
INK2 = "434343"     # secondary text (9.7:1)
MUTED = "6B6B6B"    # captions, metadata (5.3:1)
LINE = "E0E0E0"     # hairlines, borders
SURF = "F4F4F4"     # card surface
WHITE = "FFFFFF"
GRAYMARK = "8A8A8A"  # de-emphasised chart marks (3.5:1)

# Semantic readiness scale (lightness-ordered, CVD-validated, always direct-labelled)
CHAMP, READY, HESIT, RESIST = "1E7A13", "7CBB6E", "D4D4D4", "4A4A4A"
SCALE = [("Champion", CHAMP, WHITE), ("Ready", READY, INK),
         ("Hesitant", HESIT, INK), ("Resistant", RESIST, WHITE)]

FONT = "Arial"
In = Inches


def rgb(h):
    return RGBColor.from_string(h)


# ---------------------------------------------------------------- presentation
THEME_COLORS = dict(dk1=INK, lt1=WHITE, dk2=INK2, lt2=SURF, accent1=GREEN, accent2=GREEN7,
                    accent3=READY, accent4=RESIST, accent5=HESIT, accent6=MUTED,
                    hlink=GREEN7, folHlink=GREEN7)


def new_presentation(title, subject):
    prs = Presentation()
    prs.slide_width = In(SW)
    prs.slide_height = In(SH)
    _apply_theme(prs)
    cp = prs.core_properties
    cp.title = title
    cp.subject = subject
    cp.author = "Pandatron"
    cp.last_modified_by = "Pandatron"
    cp.keywords = "Pandatron, change readiness, transformation"
    return prs


def _apply_theme(prs):
    part = prs.slide_master.part.part_related_by(RT.THEME)
    root = etree.fromstring(part.blob)
    a = "http://schemas.openxmlformats.org/drawingml/2006/main"
    cs = root.find(f".//{{{a}}}clrScheme")
    cs.set("name", "Pandatron")
    for k, v in THEME_COLORS.items():
        el = cs.find(f"{{{a}}}{k}")
        for c in list(el):
            el.remove(c)
        etree.SubElement(el, f"{{{a}}}srgbClr").set("val", v)
    fs = root.find(f".//{{{a}}}fontScheme")
    fs.set("name", "Pandatron")
    for tag in ("majorFont", "minorFont"):
        fs.find(f"{{{a}}}{tag}/{{{a}}}latin").set("typeface", FONT)
    root.find(f".//{{{a}}}themeElements/..").set("name", "Pandatron")
    part._blob = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)


def blank(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg = s.background.fill
    bg.solid()
    bg.fore_color.rgb = rgb(WHITE)
    return s


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text.strip()


# ---------------------------------------------------------------- text
def _fill_tf(tf, content, size, color, bold, italic, align, anchor, spacing, line, after):
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    paras = content if isinstance(content, list) else [content]
    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = align
        para.line_spacing = line
        para.space_after = Pt(after)
        runs = p if isinstance(p, list) else [p]
        for r in runs:
            txt, o = (r if isinstance(r, tuple) else (r, {}))
            run = para.add_run()
            run.text = txt
            f = run.font
            f.name = FONT
            f.size = Pt(o.get("size", size))
            f.bold = o.get("bold", bold)
            f.italic = o.get("italic", italic)
            f.color.rgb = rgb(o.get("color", color))
            sp = o.get("spacing", spacing)
            if sp:
                run._r.get_or_add_rPr().set("spc", str(int(sp * 100)))
            if o.get("link"):
                run.hyperlink.address = o["link"]
                f.color.rgb = rgb(o.get("color", color))
                f.underline = True


def T(slide, x, y, w, h, content, size=BODY, color=INK, bold=False, italic=False,
      align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=None, line=1.1, after=0, name="Text"):
    tb = slide.shapes.add_textbox(In(x), In(y), In(w), In(h))
    tb.name = name
    _fill_tf(tb.text_frame, content, size, color, bold, italic, align, anchor, spacing, line, after)
    return tb


def caps(slide, x, y, w, text, color=MUTED, bold=False, align=PP_ALIGN.LEFT, h=0.22, name="Label"):
    """Caption-size, letter-spaced uppercase label (metadata)."""
    return T(slide, x, y, w, h, text.upper(), size=CAP, color=color, bold=bold, align=align,
             spacing=1.2, line=1.0, name=name)


# ---------------------------------------------------------------- shapes
def _nostyle(shape):
    st = shape._element.find(qn("p:style"))
    if st is not None:
        shape._element.remove(st)


def R(slide, x, y, w, h, fill=None, line=None, lw=1.0, shape=MSO_SHAPE.RECTANGLE, radius=None,
      rot=0, name="Shape"):
    s = slide.shapes.add_shape(shape, In(x), In(y), In(w), In(h))
    s.name = name
    if fill:
        s.fill.solid()
        s.fill.fore_color.rgb = rgb(fill)
    else:
        s.fill.background()
    if line:
        s.line.color.rgb = rgb(line)
        s.line.width = Pt(lw)
    else:
        s.line.fill.background()
    s.shadow.inherit = False
    _nostyle(s)
    if radius is not None and shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        s.adjustments[0] = min(0.5, radius / min(w, h))
    if rot:
        s.rotation = rot
    return s


def shape_text(s, content, size=BODY, color=INK, bold=False, italic=False, align=PP_ALIGN.CENTER,
               anchor=MSO_ANCHOR.MIDDLE, spacing=None, line=1.0, pad=0.0):
    tf = s.text_frame
    _fill_tf(tf, content, size, color, bold, italic, align, anchor, spacing, line, 0)
    tf.margin_left = tf.margin_right = In(pad)
    return s


def card(slide, x, y, w, h, fill=SURF, line=None, radius=0.12, name="Card"):
    return R(slide, x, y, w, h, fill=fill, line=line, shape=MSO_SHAPE.ROUNDED_RECTANGLE,
             radius=radius, name=name)


def pill(slide, x, y, w, h, text, fill=None, line=LINE, color=INK2, size=CAP, bold=False,
         spacing=None, name="Pill"):
    s = R(slide, x, y, w, h, fill=fill, line=line, shape=MSO_SHAPE.ROUNDED_RECTANGLE,
          radius=h / 2, name=name)
    shape_text(s, text, size=size, color=color, bold=bold, spacing=spacing)
    return s


def oval(slide, x, y, d, fill=None, line=None, lw=1.5, name="Dot"):
    return R(slide, x, y, d, d, fill=fill, line=line, lw=lw, shape=MSO_SHAPE.OVAL, name=name)


def icon(slide, name, color, x, y, size):
    p = os.path.join(ASSETS, "icons", f"{name}-{color}.png")
    pic = slide.shapes.add_picture(p, In(x), In(y), In(size), In(size))
    pic.name = f"Icon {name}"
    return pic


def ring_icon(slide, name, x, y, d, ring=GREEN, fill=WHITE, icolor="green", lw=1.75):
    """Brand motif: icon inside a ring (echoes the logo)."""
    oval(slide, x, y, d, fill=fill, line=ring, lw=lw, name="Ring")
    s = d * 0.5
    icon(slide, name, icolor, x + (d - s) / 2, y + (d - s) / 2, s)


def num_ring(slide, x, y, d, n, ring=GREEN, color=GREEN7, fill=WHITE, size=BODY):
    s = oval(slide, x, y, d, fill=fill, line=ring, lw=1.75, name="Number ring")
    shape_text(s, str(n), size=size, color=color, bold=True)
    return s


def line(slide, x1, y1, x2, y2, color=LINE, w=1.0, head=False, name="Line"):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, In(x1), In(y1), In(x2), In(y2))
    c.name = name
    _nostyle(c)
    c.line.color.rgb = rgb(color)
    c.line.width = Pt(w)
    if head:
        ln = c.line._get_or_add_ln()
        t = etree.SubElement(ln, qn("a:tailEnd"))
        t.set("type", "triangle")
        t.set("w", "med")
        t.set("len", "med")
    return c


def logo_icon(slide, x, y, size):
    return slide.shapes.add_picture(os.path.join(ASSETS, "logo-icon.png"), In(x), In(y), In(size), In(size))


def logo_wordmark(slide, x, y, w):
    h = w * 93 / 506
    return slide.shapes.add_picture(os.path.join(ASSETS, "logo-wordmark.png"), In(x), In(y), In(w), In(h))


def badge(slide, x, y, text="Illustrative data", w=None):
    w = w or (0.2 + 0.085 * len(text))
    return pill(slide, x, y, w, 0.26, text.upper(), fill=WHITE, line=MUTED, color=MUTED,
                size=CAP - 2, bold=True, spacing=1, name="Badge")


# ---------------------------------------------------------------- chrome
def chrome(slide, page, total, eyebrow=None, headline=None, head_w=None):
    if eyebrow:
        caps(slide, M, 0.5, span(9), eyebrow, color=GREEN7, bold=True, name="Eyebrow")
    if headline:
        T(slide, M, 0.8, head_w or span(11), 1.05, headline, size=HEAD, bold=True, color=INK,
          line=1.0, name="Headline")
    logo_icon(slide, M, 6.98, 0.22)
    T(slide, M + 0.32, 6.98, 4, 0.22, "The Diagnose Conversation", size=CAP, color=MUTED,
      anchor=MSO_ANCHOR.MIDDLE, name="Footer")
    T(slide, SW - M - 1.5, 6.98, 1.5, 0.22, f"{page:02d} / {total:02d}", size=CAP, color=MUTED,
      align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE, name="Page number")


# ---------------------------------------------------------------- the Ask card
def ask_card(slide, x, y, w, h, question, size=SUB, follow=None, compact=False, tail=0.16):
    """One visual treatment for every conversation moment: a green speech bubble."""
    s = R(slide, x, y, w, h, fill=GREEN, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.14, name="Ask card")
    t = R(slide, x + 0.55, y + h - 0.01, 0.34, tail + 0.01, fill=GREEN, shape=MSO_SHAPE.RIGHT_TRIANGLE,
          name="Ask card tail")
    t._element.spPr.find(qn("a:xfrm")).set("flipV", "1")
    pw, ph = 0.92, 0.34
    if compact:
        px, py = x + 0.3, y + (h - ph) / 2
        qx, qw = px + pw + 0.3, w - (pw + 0.9)
        qy, qh = y + 0.12, h - 0.24
        anchor = MSO_ANCHOR.MIDDLE
    else:
        px, py = x + 0.35, y + 0.32
        qx, qw = x + 0.35, w - 0.7
        qy, qh = py + ph + 0.22, h - (ph + 0.22) - 0.62
        anchor = MSO_ANCHOR.TOP
    p = R(slide, px, py, pw, ph, fill=WHITE, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=ph / 2,
          name="Ask label")
    icon(slide, "message-circle", "green7", px + 0.13, py + 0.07, 0.2)
    T(slide, px + 0.38, py, pw - 0.42, ph, "ASK", size=CAP, color=GREEN7, bold=True, spacing=2,
      anchor=MSO_ANCHOR.MIDDLE, name="Ask label text")
    paras = [question]
    if follow:
        paras = [question, [(follow, {"size": BODY, "bold": True})]]
    T(slide, qx, qy, qw, qh, paras, size=size, color=WHITE, bold=True, line=1.02, anchor=anchor,
      after=6, name="Ask question")
    return s


# ---------------------------------------------------------------- charts
def chart_clean(chart, inner=None):
    """Transparent chart frame and optional fixed inner plot layout (fractions of the frame)."""
    cs = chart._chartSpace
    c_chart = cs.find(qn("c:chart"))
    sp = cs.find(qn("c:spPr"))
    if sp is None:
        sp = etree.SubElement(cs, qn("c:spPr"))
        c_chart.addnext(sp)
    for ch in list(sp):
        sp.remove(ch)
    etree.SubElement(sp, qn("a:noFill"))
    ln = etree.SubElement(sp, qn("a:ln"))
    etree.SubElement(ln, qn("a:noFill"))
    rc = cs.find(qn("c:roundedCorners"))
    if rc is None:
        rc = etree.Element(qn("c:roundedCorners"))
        cs.insert(0, rc)
    rc.set("val", "0")
    if inner:
        x, y, w, h = inner
        pa = c_chart.find(qn("c:plotArea"))
        old = pa.find(qn("c:layout"))
        if old is not None:
            pa.remove(old)
        lay = etree.Element(qn("c:layout"))
        ml = etree.SubElement(lay, qn("c:manualLayout"))
        for tag, val in (("layoutTarget", "inner"), ("xMode", "edge"), ("yMode", "edge"),
                         ("x", x), ("y", y), ("w", w), ("h", h)):
            etree.SubElement(ml, qn(f"c:{tag}")).set("val", str(val))
        pa.insert(0, lay)
        pspr = pa.find(qn("c:spPr"))
        if pspr is None:
            pspr = etree.SubElement(pa, qn("c:spPr"))
        for ch in list(pspr):
            pspr.remove(ch)
        etree.SubElement(pspr, qn("a:noFill"))
        l2 = etree.SubElement(pspr, qn("a:ln"))
        etree.SubElement(l2, qn("a:noFill"))


def hide_point_label(series, idx):
    """Delete one data label (keeps tiny segments unlabelled instead of colliding)."""
    dls = series._element.find(qn("c:dLbls"))
    d = etree.Element(qn("c:dLbl"))
    etree.SubElement(d, qn("c:idx")).set("val", str(idx))
    etree.SubElement(d, qn("c:delete")).set("val", "1")
    dls.insert(0, d)
