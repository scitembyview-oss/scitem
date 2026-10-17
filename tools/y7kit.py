"""Shared parts for the Y7 science decks (build-y7-particles.py, build-y7-elements.py).

Design, drawings and graphs come from the worksheet generator (common.py, sheetkit.py, draw.py,
figs.py), student edition only: no answers, no teacher tips. Drawings get tap hooks
(class="tap" data-act=...); the actions are in ACT in tools/light-p5-shell.html.
"""
import math, pathlib, random

ROOT = pathlib.Path(__file__).resolve().parent.parent
LINE_H = 38

# ---------- page CSS (common.py + sheetkit.py) ----------
CSS = """
* { box-sizing: border-box; }
.page { width: 210mm; min-height: 297mm; padding: 15mm 16mm 14mm; position: relative; overflow: hidden; background: #fff;
  font-family: Inter, Arial, sans-serif; color: #18181B; font-size: 12.5px; line-height: 1.45; }
.foot { position: absolute; bottom: 7mm; left: 16mm; right: 16mm; font-size: 9.5px; color: #A1A1AA; display: flex; justify-content: space-between; border-top: 1px solid #E4E4E7; padding-top: 4px; }
h1 { font-size: 30px; margin: 0 0 6px; letter-spacing: -0.5px; line-height: 1.15; }
h2 { font-size: 20px; margin: 0 0 8px; letter-spacing: -0.3px; display: flex; align-items: center; gap: 10px; }
h2 .tag { background: #1E40AF; color: #fff; font-size: 12px; padding: 3px 9px; border-radius: 20px; letter-spacing: .3px; }
h3 { font-size: 14.5px; margin: 14px 0 6px; color: #1E3A8A; }
p { margin: 4px 0 8px; }
.key { background: #EFF6FF; border-left: 4px solid #2563EB; padding: 9px 12px; border-radius: 6px; margin: 8px 0 10px; }
.warn { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 8px 12px; border-radius: 6px; margin: 8px 0; }
.tip { background: #F0FDF4; border-left: 4px solid #16A34A; padding: 8px 12px; border-radius: 6px; margin: 8px 0; }
.note { background: #FFFBEB; border-left: 4px solid #D97706; padding: 8px 12px; border-radius: 6px; margin: 8px 0; }
.row { display: flex; gap: 12px; justify-content: space-around; align-items: flex-start; flex-wrap: wrap; }
.row.tight { justify-content: flex-start; gap: 8px; }
table { border-collapse: collapse; width: 100%; margin: 6px 0 10px; }
th, td { border: 1px solid #A1A1AA; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: #F4F4F5; font-weight: 700; }
.q { margin: 9px 0; }
.q .n { display: inline-block; min-width: 22px; font-weight: 700; color: #1E40AF; }
.lvl { font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 10px; margin-left: 6px; vertical-align: 1px; }
.easy { background: #DCFCE7; color: #166534; } .med { background: #FEF3C7; color: #92400E; } .chal { background: #FEE2E2; color: #991B1B; }
.line { border-bottom: 1px solid #A1A1AA; height: 38px; margin-left: 24px; }
.marks { float: right; color: #71717A; font-size: 11px; }
.small { font-size: 11px; color: #52525B; }
.center { text-align: center; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.card { border: 1px solid #D4D4D8; border-radius: 8px; padding: 9px 11px; }
.card h4 { margin: 0 0 4px; font-size: 13px; color: #1E3A8A; }
.hdr { display:flex; justify-content: space-between; align-items: center; color:#71717A; font-size: 10.5px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: .8px; }
ul, ol { margin: 4px 0 8px; padding-left: 20px; }
li { margin: 2px 0; }
.learn { background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:10px 13px; margin:8px 0 10px; }
.learn .lt { font-weight:800; color:#1E40AF; font-size:12.5px; letter-spacing:.3px; margin-bottom:3px; }
.graphbox { border:1px solid #D4D4D8; border-radius:10px; padding:8px 12px 6px; margin:8px 0; }
.graphbox .gt { font-weight:800; color:#7C3AED; font-size:12.5px; margin-bottom:2px; }
.frame { background:#F0FDF4; border:1px dashed #16A34A; border-radius:6px; padding:5px 10px; margin:6px 0 2px 24px; font-size:12px; line-height:2; }
.data td, .data th { text-align:center; padding:3px 6px; font-size:11.5px; }
.hw { background:#FFFBEB; border:1px solid #FCD34D; border-radius:10px; padding:9px 13px; margin:8px 0; }
.gridpaper { height: 330px; border:1px solid #A1A1AA; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M0 0.5H16M0.5 0V16' stroke='%23E4E4E7' stroke-width='1'/></svg>"); background-size:16px 16px; border-radius:4px; }
.fill { display:inline-block; min-width:150px; border-bottom:1.5px solid #52525B; height:1.3em; vertical-align:-4px; margin:0 4px; }
.fill.s { min-width:95px; }
td.blank { height: 46px; }
.taphint { font-size: 10.5px; color: #7C3AED; font-weight: 600; }
"""

# tap animations (JS side: ACT in tools/light-p5-shell.html)
CSS_ANIM = """
.tap { cursor: pointer }
svg.tap .pt, svg.tap .btl, svg.tap .cellb { transform-box: fill-box; transform-origin: center }
.running .tl { opacity: 0 }
.hitf { fill: #F59E0B; transform-box: fill-box; transform-origin: center; animation: hitf .45s ease-out forwards }
@keyframes hitf { from { transform: scale(.4); opacity: 1 } to { transform: scale(1.8); opacity: 0 } }

[data-act=vib].play .pt { animation: vibA .11s 18 alternate ease-in-out }
[data-act=vib].play .pt:nth-of-type(3n) { animation-name: vibB; animation-duration: .13s }
[data-act=vib].play .pt:nth-of-type(3n+1) { animation-name: vibC; animation-duration: .09s }
@keyframes vibA { from { transform: translate(-1.6px, 1px) } to { transform: translate(1.6px, -1px) } }
@keyframes vibB { from { transform: translate(1px, 1.8px) } to { transform: translate(-1px, -1.8px) } }
@keyframes vibC { from { transform: translate(1.5px, -1.5px) } to { transform: translate(-1.5px, 1.5px) } }

[data-act=grow].play .bar { transform-box: fill-box; transform-origin: 50% 100%; animation: barUp .7s ease-out backwards }
@keyframes barUp { from { transform: scaleY(0) } }
[data-act=grow].play .sl { animation: slIn .5s ease-out backwards }
@keyframes slIn { from { transform: scale(0) } }

[data-act=hits].play .hit { animation: hitIn .35s ease-in 2 alternate }
@keyframes hitIn { to { transform: translate(var(--dx), var(--dy)) } }
[data-act=hits].play .smk { animation: shove 1.8s ease-in-out }
@keyframes shove { 30%, 60% { transform: translate(16px, 0) } }

[data-act=crush].play .btl { animation: crush 2.2s ease-in-out }
@keyframes crush { 35%, 75% { transform: scale(.8, .97) } }
.arw { opacity: 0 }
[data-act=crush].play .arw { animation: arw 2.2s ease-in-out }
@keyframes arw { 15%, 75% { opacity: 1 } }

.cellb { cursor: pointer }
.cellb.play { animation: cellpop .5s ease-out }
@keyframes cellpop { 40% { transform: scale(1.25) } }

.react .mg, .react .mgo { transition: filter .3s }
.react.play .mg { animation: mgflash 1.6s ease-out }
.react.play .mgo { animation: prod .7s ease-out 1.3s }
@keyframes mgflash { 20%, 55% { filter: brightness(1.9) drop-shadow(0 0 14px #FFF3A0) } }
@keyframes prod { 40% { transform: scale(1.12) } }
"""


# ---------- text helpers (sheetkit.py, student edition) ----------
def lvl(k):
    return {"e": '<span class="lvl easy">EASY</span>', "m": '<span class="lvl med">MEDIUM</span>', "c": '<span class="lvl chal">CHALLENGE</span>'}[k]


def fill(short=False):
    return f'<span class="fill{" s" if short else ""}"></span>'


def lines(k):
    return '<div class="line"></div>' * k


def frame(t):
    return f'<div class="frame">{t}</div>'


def Q(n, level, text, k=None, marks=None, hint=None):
    if k is None:
        k = {"e": 2, "m": 3, "c": 4}[level]
    m = f'<span class="marks">[{marks}]</span>' if marks else ""
    h = frame(hint) if hint else ""
    return f'<div class="q"><span class="n">{n}</span>{lvl(level)} {text}{m}{h}{lines(k)}</div>'


def cell(style=""):
    return f'<td class="blank" style="{style}"></td>'


def taphint(t="tap the picture"):
    return f'<div class="taphint">{t}</div>'


class Deck:
    def __init__(self, foot):
        self.foot = foot
        self.P = []

    def add(self, inner):
        n = len(self.P) + 1
        self.P.append(f'<section class="page">{inner}<div class="foot"><span>{self.foot}</span><span>Page {n}</span></div></section>')

    def write(self, folder, title, script, css=""):
        shell = (ROOT / "tools" / "light-p5-shell.html").read_text(encoding="utf-8")
        fonts = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">\n'
        html = (shell.replace("<!--TITLE-->", title).replace("<!--BUILD-->", script).replace("<!--HEAD-->\n", fonts)
                .replace("/*SHEET_CSS*/", CSS + CSS_ANIM + css)
                .replace("<!--PAGES-->", "\n".join(f'<div class="sheet">{p}<canvas class="ink"></canvas></div>' for p in self.P)))
        out = ROOT / "public" / folder / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")
        print("wrote", out, len(self.P), "pages")


# ---------- particle drawings (draw.py) ----------
FONT = 'font-family="Inter,Arial"'
C = {
    "blue": "#3B82F6", "red": "#E5484D", "white": "#FFFFFF", "black": "#3F3F46",
    "yellow": "#F5C518", "green": "#22A55B", "grey": "#A1A1AA", "purple": "#8B5CF6", "pink": "#EC4899",
}


def atom(x, y, r, col, label=None):
    s = f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{C[col]}" stroke="#27272A" stroke-width="1.3"/>'
    if label:
        tc = "#111" if col in ("white", "yellow") else "#fff"
        s += f'<text x="{x:.1f}" y="{y+r*0.36:.1f}" font-size="{r*0.95:.1f}" text-anchor="middle" fill="{tc}" font-weight="700" {FONT}>{label}</text>'
    return s


def pt(inner, a=None):
    """one moving particle (atom or molecule); a = direction it is moving (radians)"""
    return f'<g class="pt"{f" data-a={a:.2f}" if a is not None else ""}>{inner}</g>'


# particle "species": list of (dx, dy, r, col) relative to centre
SPECIES = {
    "A_blue":  [(0, 0, 9, "blue")],
    "A_red":   [(0, 0, 9, "red")],
    "A_grey":  [(0, 0, 9, "grey")],
    "A_yellow": [(0, 0, 9, "yellow")],
    "A_purple": [(0, 0, 9, "purple")],
    "O2":      [(-6.5, 0, 8, "red"), (6.5, 0, 8, "red")],
    "N2":      [(-6.5, 0, 8, "blue"), (6.5, 0, 8, "blue")],
    "G2":      [(-6.5, 0, 8, "green"), (6.5, 0, 8, "green")],
    "H2O":     [(0, 0, 9, "red"), (-9, 7, 6, "white"), (9, 7, 6, "white")],
    "CO2":     [(0, 0, 8.5, "black"), (-13, 0, 7.5, "red"), (13, 0, 7.5, "red")],
}


def spread(n, w, h, minsep, seed, margin=16):
    rnd = random.Random(seed)
    pts = []
    tries = 0
    while len(pts) < n and tries < 20000:
        tries += 1
        x = rnd.uniform(margin, w - margin); y = rnd.uniform(margin, h - margin)
        if all(math.hypot(x - a, y - b) >= minsep for a, b in pts):
            pts.append((x, y))
    return pts


def draw_species(sp, x, y, rot=0):
    out = ""
    ca, sa = math.cos(rot), math.sin(rot)
    for dx, dy, r, col in SPECIES[sp]:
        out += atom(x + dx * ca - dy * sa, y + dx * sa + dy * ca, r, col)
    return pt(out)


def box(content, w=150, h=130, label=None, sub=None, act=None, attrs=""):
    """a particle box; act = tap action (gas, vib, diffuse); data-w/h = the walls for the JS"""
    lab = ""
    extra_h = 0
    if label:
        lab = f'<text x="{w/2}" y="{h+18}" text-anchor="middle" font-size="14" font-weight="700" {FONT} fill="#18181B">{label}</text>'
        extra_h = 24
    if sub:
        lab += f'<text x="{w/2}" y="{h+36}" text-anchor="middle" font-size="11" {FONT} fill="#52525B">{sub}</text>'
        extra_h = 42
    tap = f' class="tap" data-act="{act}" data-w="{w}" data-h="{h}"' if act else ""
    return (f'<svg viewBox="0 0 {w} {h+extra_h}" width="{w}" height="{h+extra_h}" xmlns="http://www.w3.org/2000/svg"{tap}{attrs}>'
            f'<rect x="1" y="1" width="{w-2}" height="{h-2}" rx="8" fill="#FAFAFA" stroke="#52525B" stroke-width="1.6"/>'
            f'{content}{lab}</svg>')


def gas_box(species_list, seed, w=150, h=130, minsep=34, act="gas", **kw):
    pts = spread(len(species_list), w, h, minsep, seed, margin=20)
    rnd = random.Random(seed + 7)
    body = "".join(draw_species(sp, x, y, rnd.uniform(0, 3.14)) for sp, (x, y) in zip(species_list, pts))
    return box(body, w, h, act=act, **kw)


def solid_box(pattern, w=150, h=130, r=9, act="vib", **kw):
    """pattern(i,j)->colour; regular touching grid"""
    body = ""
    d = 2 * r
    cols = int((w - 16) // d); rows = int((h - 16) // d)
    ox = (w - cols * d) / 2 + r; oy = (h - rows * d) / 2 + r
    for j in range(rows):
        for i in range(cols):
            body += pt(atom(ox + i * d, oy + j * d, r, pattern(i, j)))
    return box(body, w, h, act=act, **kw)


PT = [
    [(1, "H", "Hydrogen"), None, None, None, None, None, None, (2, "He", "Helium")],
    [(3, "Li", "Lithium"), (4, "Be", "Beryllium"), (5, "B", "Boron"), (6, "C", "Carbon"), (7, "N", "Nitrogen"), (8, "O", "Oxygen"), (9, "F", "Fluorine"), (10, "Ne", "Neon")],
    [(11, "Na", "Sodium"), (12, "Mg", "Magnesium"), (13, "Al", "Aluminium"), (14, "Si", "Silicon"), (15, "P", "Phosphorus"), (16, "S", "Sulfur"), (17, "Cl", "Chlorine"), (18, "Ar", "Argon")],
    [(19, "K", "Potassium"), (20, "Ca", "Calcium"), None, None, None, None, None, None],
]
METALS = {"Li", "Be", "Na", "Mg", "Al", "K", "Ca"}


# ---------- graphs and diagrams (figs.py) ----------
def _solve3(m, v):
    a = [row[:] + [v[i]] for i, row in enumerate(m)]
    for i in range(3):
        p = max(range(i, 3), key=lambda r: abs(a[r][i]))
        a[i], a[p] = a[p], a[i]
        for r in range(3):
            if r != i:
                f = a[r][i] / a[i][i]
                a[r] = [x - f * y for x, y in zip(a[r], a[i])]
    return [a[i][3] / a[i][i] for i in range(3)]


def quad_fit(xs, ys):
    s = lambda k: sum(x ** k for x in xs)
    t = lambda k: sum((x ** k) * y for x, y in zip(xs, ys))
    c, b, a = _solve3([[len(xs), s(1), s(2)], [s(1), s(2), s(3)], [s(2), s(3), s(4)]], [t(0), t(1), t(2)])
    return lambda x: a * x * x + b * x + c


def lin_fit(xs, ys):
    n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
    m = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
    return lambda x: my + m * (x - mx)


def cross(x, y, s=4.5, col="#18181B"):
    return (f'<line x1="{x-s}" y1="{y-s}" x2="{x+s}" y2="{y+s}" stroke="{col}" stroke-width="1.8"/>'
            f'<line x1="{x-s}" y1="{y+s}" x2="{x+s}" y2="{y-s}" stroke="{col}" stroke-width="1.8"/>')


def line_graph(data, xr, yr, xlabel, ylabel, w=440, h=270, fit=None, fit_fn=None, fit_to=None,
               join=False, labels=None, points=True, tap=True):
    """xr/yr = (min, max, step). The line (class tr) is traced by a dot when the graph is tapped."""
    L, Rm, T, Bm = 58, 16, 12, 44
    pw, ph = w - L - Rm, h - T - Bm
    X = lambda x: L + (x - xr[0]) / (xr[1] - xr[0]) * pw
    Y = lambda y: T + ph - (y - yr[0]) / (yr[1] - yr[0]) * ph
    act = ' class="tap" data-act="trace"' if tap and (join or fit) else ""
    s = f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg" {FONT}{act}>'
    x = xr[0]
    while x <= xr[1] + 1e-9:
        s += f'<line x1="{X(x):.1f}" y1="{T}" x2="{X(x):.1f}" y2="{T+ph}" stroke="#E4E4E7"/>'
        s += f'<text x="{X(x):.1f}" y="{T+ph+15}" text-anchor="middle" font-size="10.5" fill="#3F3F46">{x:g}</text>'
        x += xr[2]
    y = yr[0]
    while y <= yr[1] + 1e-9:
        s += f'<line x1="{L}" y1="{Y(y):.1f}" x2="{L+pw}" y2="{Y(y):.1f}" stroke="#E4E4E7"/>'
        lab = f"{y:g}".replace("-", "−")
        s += f'<text x="{L-6}" y="{Y(y)+3.5:.1f}" text-anchor="end" font-size="10.5" fill="#3F3F46">{lab}</text>'
        y += yr[2]
    s += f'<line x1="{L}" y1="{T}" x2="{L}" y2="{T+ph}" stroke="#3F3F46" stroke-width="1.6"/>'
    s += f'<line x1="{L}" y1="{T+ph}" x2="{L+pw}" y2="{T+ph}" stroke="#3F3F46" stroke-width="1.6"/>'
    s += f'<text x="{L+pw/2}" y="{h-8}" text-anchor="middle" font-size="12" font-weight="600" fill="#18181B">{xlabel}</text>'
    s += f'<text x="14" y="{T+ph/2}" text-anchor="middle" font-size="12" font-weight="600" fill="#18181B" transform="rotate(-90 14 {T+ph/2})">{ylabel}</text>'
    if join:
        pts = " ".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in data)
        s += f'<polyline class="tr" points="{pts}" fill="none" stroke="#2563EB" stroke-width="2.6"/>'
    if fit == "line":
        f = lin_fit([a for a, _ in data], [b for _, b in data])
        s += f'<line class="tr" x1="{X(xr[0]):.1f}" y1="{Y(f(xr[0])):.1f}" x2="{X(fit_to or xr[1]):.1f}" y2="{Y(f(fit_to or xr[1])):.1f}" stroke="#2563EB" stroke-width="2.2"/>'
    if fit == "line_origin":
        m_ = sum(b for _, b in data) / sum(a for a, _ in data)
        xe = fit_to or xr[1]
        s += f'<line class="tr" x1="{X(0):.1f}" y1="{Y(0):.1f}" x2="{X(xe):.1f}" y2="{Y(m_*xe):.1f}" stroke="#2563EB" stroke-width="2.2"/>'
    if fit == "poly":
        x0, x1 = data[0][0], fit_to or data[-1][0]
        pts = " ".join(f"{X(x0 + (x1-x0)*i/60):.1f},{Y(fit_fn(x0 + (x1-x0)*i/60)):.1f}" for i in range(61))
        s += f'<polyline class="tr" points="{pts}" fill="none" stroke="#2563EB" stroke-width="2.2"/>'
    if points:
        for a, b in data:
            s += cross(X(a), Y(b))
    for (a, b, t) in (labels or []):
        s += f'<text x="{X(a):.1f}" y="{Y(b):.1f}" text-anchor="middle" font-size="14" font-weight="800" fill="#B91C1C">{t}</text>'
    return s + '</svg>'


def bad_graph(w=300, h=190):
    """Deliberately wrong: axes swapped, no units, uneven scale, dot-to-dot."""
    L, T, pw, ph = 50, 12, w - 66, h - 56
    ys = [0, 10, 20, 40, 50]
    s = f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg" {FONT}>'
    for i, lab in enumerate(ys):
        y = T + ph - i * ph / 4
        s += f'<line x1="{L}" y1="{y}" x2="{L+pw}" y2="{y}" stroke="#E4E4E7"/><text x="{L-6}" y="{y+3.5}" text-anchor="end" font-size="10.5" fill="#3F3F46">{lab}</text>'
    for i, lab in enumerate([0, 20, 40, 60, 80, 100]):
        x = L + i * pw / 5
        s += f'<line x1="{x}" y1="{T}" x2="{x}" y2="{T+ph}" stroke="#E4E4E7"/><text x="{x}" y="{T+ph+15}" text-anchor="middle" font-size="10.5" fill="#3F3F46">{lab}</text>'
    s += f'<line x1="{L}" y1="{T}" x2="{L}" y2="{T+ph}" stroke="#3F3F46" stroke-width="1.6"/><line x1="{L}" y1="{T+ph}" x2="{L+pw}" y2="{T+ph}" stroke="#3F3F46" stroke-width="1.6"/>'
    s += f'<text x="{L+pw/2}" y="{h-8}" text-anchor="middle" font-size="12" font-weight="600">Temperature</text>'
    s += f'<text x="14" y="{T+ph/2}" text-anchor="middle" font-size="12" font-weight="600" transform="rotate(-90 14 {T+ph/2})">Time</text>'
    pts = [(L + pw*0.05, T+ph-0.0*ph), (L + pw*0.22, T+ph-0.28*ph), (L + pw*0.30, T+ph-0.40*ph), (L + pw*0.50, T+ph-0.47*ph),
           (L + pw*0.62, T+ph-0.70*ph), (L + pw*0.80, T+ph-0.76*ph), (L + pw*0.93, T+ph-0.95*ph)]
    s += f'<polyline points="{" ".join(f"{a:.1f},{b:.1f}" for a,b in pts)}" fill="none" stroke="#2563EB" stroke-width="2"/>'
    for a, b in pts:
        s += f'<circle cx="{a:.1f}" cy="{b:.1f}" r="4.5" fill="#2563EB"/>'
    return s + '</svg>'


def rules_example():
    """A good graph with numbered badges + a legend for the 5 rules."""
    data = [(0, 20), (2, 34), (4, 47), (6, 61), (8, 73), (10, 86)]
    g = line_graph(data, (0, 10, 2), (0, 100, 20), "Time (min)", "Temperature (°C)", w=340, h=240, fit="line")
    def badge(x, y, n):
        return (f'<circle cx="{x}" cy="{y}" r="9" fill="#D97706"/>'
                f'<text x="{x}" y="{y+4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" {FONT}>{n}</text>')
    over = badge(250, 230, 1) + badge(30, 190, 2) + badge(72, 20, 3) + badge(128, 150, 4) + badge(300, 50, 5)
    g = g.replace('</svg>', over + '</svg>')
    items = ["<b>x-axis</b> = what you change · <b>y-axis</b> = what you measure",
             "a <b>label + unit</b> on both axes, e.g. Time (min)",
             "<b>even scale</b> (equal steps) · graph fills more than half the grid",
             "points are small <b>×</b> marks in pencil",
             "one smooth <b>best-fit line</b> — not dot-to-dot"]
    leg = "".join(f'<div style="display:flex;gap:8px;align-items:flex-start;margin:6px 0"><span style="flex:none;width:18px;height:18px;border-radius:9px;background:#D97706;color:#fff;font-weight:800;font-size:11px;text-align:center;line-height:18px">{i+1}</span><span>{t}</span></div>' for i, t in enumerate(items))
    return f'<div class="row tight" style="align-items:center;flex-wrap:nowrap">{g}<div style="font-size:12px">{leg}</div></div>'


def bar_vs_line(w=220, h=120, kind="line"):
    act = "grow" if kind == "bar" else "trace"
    s = f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg" {FONT} class="tap" data-act="{act}">'
    s += f'<line x1="20" y1="8" x2="20" y2="{h-22}" stroke="#3F3F46" stroke-width="1.5"/><line x1="20" y1="{h-22}" x2="{w-8}" y2="{h-22}" stroke="#3F3F46" stroke-width="1.5"/>'
    if kind == "bar":
        for i, (v, lab) in enumerate([(70, "iron"), (40, "wax"), (55, "salt"), (25, "ice")]):
            x = 34 + i * 46
            s += f'<rect class="bar" style="animation-delay:{i*.12:.2f}s" x="{x}" y="{h-22-v}" width="30" height="{v}" fill="#93C5FD" stroke="#1E40AF"/><text x="{x+15}" y="{h-8}" text-anchor="middle" font-size="10">{lab}</text>'
    else:
        pts = [(30, 85), (70, 68), (110, 52), (150, 40), (190, 32)]
        s += f'<polyline class="tr" points="{" ".join(f"{a},{b}" for a,b in pts)}" fill="none" stroke="#2563EB" stroke-width="2"/>'
        for a, b in pts:
            s += cross(a, b, 3.5)
        s += f'<text x="{w/2+6}" y="{h-6}" text-anchor="middle" font-size="10">time (min)</text>'
    return s + '</svg>'


def brownian_path(w=230, h=200, seed=4):
    """tap: the smoke speck (class spk) jiggles about in a random zigzag"""
    rnd = random.Random(seed)
    x, y = w / 2, h / 2
    pts = [(x, y)]
    for _ in range(22):
        ang = rnd.uniform(0, 2 * math.pi); d = rnd.uniform(22, 42)
        x = min(max(x + d * math.cos(ang), 30), w - 30); y = min(max(y + d * math.sin(ang), 30), h - 30)
        pts.append((x, y))
    s = f'<svg viewBox="0 0 {w} {h+22}" width="{w}" height="{h+22}" xmlns="http://www.w3.org/2000/svg" {FONT} class="tap" data-act="brown" data-r="{h/2-14}">'
    s += f'<circle cx="{w/2}" cy="{h/2}" r="{h/2-4}" fill="#F8FAFC" stroke="#3F3F46" stroke-width="3"/>'
    s += f'<polyline points="{" ".join(f"{a:.1f},{b:.1f}" for a,b in pts)}" fill="none" stroke="#94A3B8" stroke-width="1.6" stroke-dasharray="3 3"/>'
    for a, b in pts[:-1]:
        s += f'<circle cx="{a:.1f}" cy="{b:.1f}" r="2" fill="#94A3B8"/>'
    a, b = pts[-1]
    s += f'<circle class="spk" cx="{a:.1f}" cy="{b:.1f}" r="7" fill="#71717A" stroke="#27272A"/>'
    s += f'<text x="{w/2}" y="{h+16}" text-anchor="middle" font-size="11.5" fill="#52525B">what you see: a smoke speck jiggling</text>'
    return s + '</svg>'


def brownian_zoom(w=250, h=200):
    """tap: the air particles fly in and hit the speck, more from the left, so it is pushed right"""
    cx, cy = w / 2, h / 2 - 6
    s = f'<svg viewBox="0 0 {w} {h+22}" width="{w}" height="{h+22}" xmlns="http://www.w3.org/2000/svg" {FONT} class="tap" data-act="hits">'
    s += '<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2563EB"/></marker>'
    s += '<marker id="ab" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="10" refY="7" orient="auto"><path d="M0,0 L14,7 L0,14 z" fill="#B91C1C"/></marker></defs>'
    s += f'<g class="smk"><circle cx="{cx}" cy="{cy}" r="34" fill="#A1A1AA" stroke="#27272A" stroke-width="1.5"/>'
    s += f'<text x="{cx}" y="{cy+4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">smoke</text></g>'
    hits = [180, 160, 200, 140, 220, 0, 60, 100]
    for k, ang in enumerate(hits):
        r0, r1 = 78, 42
        a = math.radians(ang)
        x0, y0 = cx + r0 * math.cos(a), cy + r0 * math.sin(a)
        x1, y1 = cx + r1 * math.cos(a), cy + r1 * math.sin(a)
        dx, dy = (x1 - x0) * 0.55, (y1 - y0) * 0.55
        s += f'<g class="hit" style="--dx:{dx:.1f}px;--dy:{dy:.1f}px;animation-delay:{k*0.09:.2f}s">'
        s += atom(x0, y0, 5, "blue")
        s += f'<line x1="{x0+ (x1-x0)*0.15:.1f}" y1="{y0+(y1-y0)*0.15:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="#2563EB" stroke-width="1.6" marker-end="url(#ah)"/></g>'
    s += f'<line x1="{cx+40}" y1="{cy-62}" x2="{cx+100}" y2="{cy-62}" stroke="#B91C1C" stroke-width="3" marker-end="url(#ab)"/>'
    s += f'<text x="{cx+70}" y="{cy-70}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#B91C1C">pushed this way</text>'
    s += f'<text x="{w/2}" y="{h+16}" text-anchor="middle" font-size="11.5" fill="#52525B">zoomed in: more hits on the left</text>'
    return s + '</svg>'


def diffusion_box(stage, w=150, h=110, label=None, sub=None, col="pink", seed=5, n=14, act=None):
    """act="diffuse": tap and the particles start bunched in the corner and spread out to where they are drawn"""
    rnd = random.Random(seed + stage)
    body = ""
    for i in range(n):
        if stage == 0:
            x, y = rnd.uniform(16, 52), rnd.uniform(h - 52, h - 16)
        elif stage == 1:
            x, y = rnd.uniform(14, w * 0.8), rnd.uniform(h * 0.15, h - 14)
        else:
            x = y = None
        if x is not None:
            body += pt(atom(x, y, 5, col))
    if stage == 2:
        for x, y in spread(n, w, h, 22, seed, margin=14):
            body += pt(atom(x, y, 5, col))
    return box(body, w, h, label=label, sub=sub, act=act)


def star(x, y, r1=6, r2=2.6):
    pts = []
    for i in range(10):
        r = r1 if i % 2 == 0 else r2
        a = math.pi / 5 * i - math.pi / 2
        pts.append(f"{x + r*math.cos(a):.1f},{y + r*math.sin(a):.1f}")
    return " ".join(pts)


def pressure_box(n, w=150, h=110, seed=2, fast=False, label=None, sub=None, stars=True, r=6, minsep=None, act="gas"):
    """act="gas": tap and the particles fly about, flashing where they hit the walls (fast = orange, quicker)"""
    pts = spread(n, w, h, minsep or (26 if n < 14 else 20), seed, margin=r + 8)
    rnd = random.Random(seed)
    body = ""
    for x, y in pts:
        ang = rnd.uniform(0, 2 * math.pi); L = 20 if fast else 8
        body += pt(f'<line class="tl" x1="{x:.1f}" y1="{y:.1f}" x2="{x - L*math.cos(ang):.1f}" y2="{y - L*math.sin(ang):.1f}" stroke="{"#F97316" if fast else "#93C5FD"}" stroke-width="2.2"/>'
                   + atom(x, y, r, "blue"), ang)
    if stars:
        k = max(2, n // 3) + (2 if fast else 0)
        for i in range(k):
            side = i % 4
            t = rnd.uniform(0.15, 0.85)
            x, y = [(t * w, 4), (w - 4, t * h), (t * w, h - 4), (4, t * h)][side]
            body += f'<polygon points="{star(x, y)}" fill="#F59E0B"/>'
    extra = f' data-v="{2.4 if fast else 1}"' + (' data-hits="1"' if act else "")
    return box(body, w, h, label=label, sub=sub, act=act, attrs=extra if act else "")


def bottle(dented=False, w=130, h=150, label="", act=None):
    """act="crush": the air outside squeezes the bottle in (arrows show the push)"""
    tap = f' class="tap" data-act="{act}"' if act else ""
    s = f'<svg viewBox="0 0 {w} {h+22}" width="{w}" height="{h+22}" xmlns="http://www.w3.org/2000/svg" {FONT}{tap}>'
    if dented:
        body = "M30,18 L60,18 L60,34 Q78,44 76,62 Q60,80 74,98 Q58,112 76,128 L74,142 L16,142 L14,128 Q32,112 16,98 Q30,80 14,62 Q12,44 30,34 Z"
    else:
        body = "M30,18 L60,18 L60,34 Q78,44 78,62 L78,142 L12,142 L12,62 Q12,44 30,34 Z"
    s += f'<g transform="translate(20,0)"><g class="btl"><rect x="30" y="6" width="30" height="13" rx="2" fill="#2563EB"/>'
    s += f'<path d="{body}" fill="#DBEAFE" stroke="#1E40AF" stroke-width="2"/></g>'
    if act:
        arrow = lambda x1, x2, y: (f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="#B91C1C" stroke-width="2.5"/>'
                                   f'<path d="M{x2},{y} l{6 if x1 < x2 else -6},0 m0,0 l{-7 if x1 < x2 else 7},-5 m0,10 l{7 if x1 < x2 else -7},-5" stroke="#B91C1C" stroke-width="2.5" fill="none"/>')
        s += '<g class="arw">' + "".join(arrow(-16, 2, y) + arrow(106, 88, y) for y in (70, 104)) + '</g>'
    s += '</g>'
    s += f'<text x="{w/2}" y="{h+16}" text-anchor="middle" font-size="11.5" fill="#52525B">{label}</text>'
    return s + '</svg>'


def bar_chart(items, ylabel, ymax, ystep, w=460, h=260, xlabel=None, colors=None):
    """items: list of (label, value). Tap: the bars grow up one by one."""
    L, Rm, T, Bm = 58, 12, 14, 52 if xlabel else 34
    pw, ph = w - L - Rm, h - T - Bm
    Y = lambda v: T + ph - v / ymax * ph
    s = f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg" {FONT} class="tap" data-act="grow">'
    v = 0
    while v <= ymax + 1e-9:
        s += f'<line x1="{L}" y1="{Y(v):.1f}" x2="{L+pw}" y2="{Y(v):.1f}" stroke="#E4E4E7"/>'
        s += f'<text x="{L-6}" y="{Y(v)+3.5:.1f}" text-anchor="end" font-size="10.5" fill="#3F3F46">{v:g}</text>'
        v += ystep
    n = len(items); slot = pw / n; bw = slot * 0.62
    for i, (lab, val) in enumerate(items):
        x = L + i * slot + (slot - bw) / 2
        fill_ = colors[i] if colors else "#93C5FD"
        s += f'<rect class="bar" style="animation-delay:{i*.1:.1f}s" x="{x:.1f}" y="{Y(val):.1f}" width="{bw:.1f}" height="{T+ph-Y(val):.1f}" fill="{fill_}" stroke="#1E3A8A" stroke-width="1"/>'
        s += f'<text x="{x+bw/2:.1f}" y="{T+ph+15}" text-anchor="middle" font-size="10.5" fill="#18181B">{lab}</text>'
    s += f'<line x1="{L}" y1="{T}" x2="{L}" y2="{T+ph}" stroke="#3F3F46" stroke-width="1.6"/>'
    s += f'<line x1="{L}" y1="{T+ph}" x2="{L+pw}" y2="{T+ph}" stroke="#3F3F46" stroke-width="1.6"/>'
    s += f'<text x="14" y="{T+ph/2}" text-anchor="middle" font-size="12" font-weight="600" fill="#18181B" transform="rotate(-90 14 {T+ph/2})">{ylabel}</text>'
    if xlabel:
        s += f'<text x="{L+pw/2}" y="{h-8}" text-anchor="middle" font-size="12" font-weight="600" fill="#18181B">{xlabel}</text>'
    return s + '</svg>'


def pie_chart(items, r=105, w=420, h=240, show_values=True):
    """items: list of (label, percent, colour). Legend on the right. Tap: the slices open out one by one."""
    cx, cy = r + 12, h / 2
    s = f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg" {FONT} class="tap" data-act="grow">'
    a0 = -math.pi / 2
    for i, (lab, pct, col) in enumerate(items):
        a1 = a0 + 2 * math.pi * pct / 100
        large = 1 if a1 - a0 > math.pi else 0
        x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
        x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
        s += (f'<path class="sl" style="transform-origin:{cx}px {cy}px;animation-delay:{i*.25:.2f}s" '
              f'd="M{cx},{cy} L{x0:.2f},{y0:.2f} A{r},{r} 0 {large} 1 {x1:.2f},{y1:.2f} Z" fill="{col}" stroke="#fff" stroke-width="1.5"/>')
        a0 = a1
    for i, (lab, pct, col) in enumerate(items):
        y = 40 + i * 26
        s += f'<rect x="{2*r+40}" y="{y-11}" width="14" height="14" rx="3" fill="{col}"/>'
        val = f" — {pct:g}%" if show_values else ""
        s += f'<text x="{2*r+60}" y="{y}" font-size="12" fill="#18181B">{lab}{val}</text>'
    return s + '</svg>'
