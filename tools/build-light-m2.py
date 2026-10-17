"""Builds public/light-m2/index.html: Light Explorer · Mission 2 as web pages.

Drawings, CSS and text come from the worksheet generator (build_m2.py), student
version only (no answers, no teacher notes). The page chrome (pen, eraser, paging,
palm rejection) follows public/demo/. Run: python3 tools/build-light-m2.py
"""
import json, math, pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "light-m2" / "index.html"
TOTAL = 14

# ---------- drawings ----------
def glow(size=170):
    # .gl = glow halo, .bd = body, .wings: animated when Glow is tapped
    return f'''<svg class="glow tap" data-act="glow" viewBox="0 0 200 190" width="{size}" height="{int(size*0.95)}" aria-label="Glow the firefly">
  <g class="gl"><circle cx="66" cy="132" r="46" fill="#FFE68A" opacity=".45"/>
  <circle cx="66" cy="132" r="32" fill="#FFE68A" opacity=".6"/></g>
  <path d="M96 128 l-10 26 M108 126 l2 28 M118 120 l12 22" stroke="#2A9D8F" stroke-width="3" stroke-linecap="round" fill="none"/>
  <ellipse class="bd" cx="68" cy="128" rx="30" ry="24" fill="#FFD23F" stroke="#D99A00" stroke-width="3"/>
  <path d="M56 108 q-6 20 2 42 M72 105 q-6 23 2 46" stroke="#D99A00" stroke-width="2.5" fill="none"/>
  <g class="wings"><ellipse cx="96" cy="74" rx="30" ry="13" transform="rotate(-32 96 74)" fill="#DDEEFF" stroke="#2F80C9" stroke-width="2.5" opacity=".95"/>
  <ellipse cx="116" cy="70" rx="28" ry="12" transform="rotate(-62 116 70)" fill="#DDEEFF" stroke="#2F80C9" stroke-width="2.5" opacity=".95"/></g>
  <ellipse cx="106" cy="110" rx="22" ry="20" fill="#E8F6F3" stroke="#2A9D8F" stroke-width="3"/>
  <path d="M136 56 q-8 -22 -20 -30 M150 56 q8 -22 20 -28" stroke="#2A9D8F" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="115" cy="25" r="5" fill="#FFD23F" stroke="#D99A00" stroke-width="2"/>
  <circle cx="171" cy="27" r="5" fill="#FFD23F" stroke="#D99A00" stroke-width="2"/>
  <circle cx="142" cy="86" r="24" fill="#E8F6F3" stroke="#2A9D8F" stroke-width="3"/>
  <circle cx="134" cy="84" r="3.6" fill="#1F2A44"/><circle cx="150" cy="84" r="3.6" fill="#1F2A44"/>
  <path d="M135 94 q7 7 14 0" stroke="#1F2A44" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M124 64 q2 -16 18 -17 q16 1 18 17 z" fill="#FFF4E0" stroke="#E8962E" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="142" cy="65" rx="26" ry="6" fill="#FFF4E0" stroke="#E8962E" stroke-width="3"/>
  <path d="M125 58 h34" stroke="#E8962E" stroke-width="2"/>
</svg>'''

def star(on):
    c = "#E8962E"
    fill = c if on else "none"
    return f'<svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8 6.2 20l1.4-6.4L2.7 9.2l6.5-.7z" fill="{fill}" stroke="{c}" stroke-width="1.6" stroke-linejoin="round"/></svg>'

def stars(n):
    return '<span class="stars">' + "".join(star(i < n) for i in range(3)) + "</span>"

def badge(color, size=104, act="badge"):
    return f'''<svg class="badge tap" data-act="{act}" style="--c:{color}" viewBox="0 0 100 100" width="{size}" height="{size}">
  <circle class="bo" cx="50" cy="50" r="46" fill="#fff" stroke="{color}" stroke-width="3.5"/>
  <circle class="bi" cx="50" cy="50" r="37" fill="none" stroke="{color}" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path class="bs" d="M50 22l7.6 16.2 17.6 1.9-13.2 12 3.7 17.4L50 60.6l-15.7 8.9 3.7-17.4-13.2-12 17.6-1.9z" fill="none" stroke="{color}" stroke-width="2.6" stroke-linejoin="round"/>
</svg>'''

def blank(w=150):
    return f'<span class="blank" style="min-width:{w}px"></span>'

def lines(n):
    return '<div class="lines">' + '<div class="line"></div>' * n + "</div>"

def task(n, text, body=""):
    return f'<div class="task"><div class="tq">{stars(n)}<span>{text}</span></div>{body}</div>'

def pills(items):
    return '<div class="pills">' + "".join(f'<span class="pill tap" data-act="pill">{t}</span>' for t in items) + "</div>"

def choose(a, b):
    """inline circle-the-word without brackets"""
    return f'<span class="mini">{a}</span><span class="mini">{b}</span>'

def bubble(html):
    return f'<div class="say"><div class="me">{glow(78)}</div><div class="bub">{html}</div></div>'

def badge_row(color, name, line1, line2):
    return f'''<div class="earn"><div class="eb">{badge(color, 100, "win")}<div class="bn" style="color:{color}">{name}</div></div>
<div><div class="e1">{line1}</div><div class="e2">{line2}</div></div></div>'''

def page(n, title, inner, unit=False):
    left = "Unit 4 · Light Energy" if unit else "Light Explorer · Mission 2"
    return f'''<section class="page" data-n="{n}"><div class="top"><span>{left}</span><span>{n} / {TOTAL}</span></div>
{f'<h2>{title}</h2>' if title else ''}{inner}</section>'''


# ---------- mission 2 drawings ----------
def sun_svg(cx, cy, r=13, act=""):
    rays = "".join(
        f'<path d="M{cx + (r+5)*c:.1f} {cy + (r+5)*s:.1f} L{cx + (r+12)*c:.1f} {cy + (r+12)*s:.1f}"/>'
        for c, s in [(1,0),(-1,0),(0,1),(0,-1),(.707,.707),(-.707,.707),(.707,-.707),(-.707,-.707)])
    body = (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#FFD23F" stroke="#E8962E" stroke-width="2.5"/>'
            f'<g stroke="#E8962E" stroke-width="2.5" stroke-linecap="round">{rays}</g>')
    if not act:
        return body
    return (f'<g class="src tap" data-act="{act}"><circle class="halo" cx="{cx}" cy="{cy}" r="{r+16}" fill="#FFE68A"/>'
            f'{body}</g>')

def kid(x, g, h=58, col="#2F80C9"):
    hy = g - h + 9
    return (f'<g stroke="{col}" stroke-width="3" stroke-linecap="round" fill="none">'
            f'<circle cx="{x}" cy="{hy}" r="8" fill="#FFF4E0"/>'
            f'<path d="M{x} {hy+8} V{g-20} M{x} {g-20} L{x-9} {g} M{x} {g-20} L{x+9} {g} M{x-12} {hy+20} L{x+12} {hy+20}"/></g>')

def tree(x, g):
    return (f'<rect x="{x-5}" y="{g-34}" width="10" height="34" fill="#C9A27A" stroke="#8A5A2B" stroke-width="2"/>'
            f'<circle cx="{x}" cy="{g-48}" r="20" fill="#CDEBD8" stroke="#2E8B57" stroke-width="2.5"/>')

def bottle(x, g):
    return (f'<path d="M{x-10} {g} V{g-36} q0 -8 6 -12 V{g-58} h8 V{g-48} q6 4 6 12 V{g}z" '
            f'fill="#E6F2FB" stroke="#2F80C9" stroke-width="2.5" stroke-linejoin="round"/>')

def lamp_svg(x, y, act="", cls=""):
    body = (f'<circle class="bulb" cx="{x}" cy="{y}" r="12" fill="#FFE68A" stroke="#E8962E" stroke-width="2.5"/>'
            f'<rect x="{x-6}" y="{y+11}" width="12" height="9" rx="2" fill="#E6EEF8" stroke="#6B7785" stroke-width="2"/>')
    if not act:
        return body
    return (f'<g class="src tap {cls}" data-act="{act}"><circle class="halo" cx="{x}" cy="{y}" r="26" fill="#FFE68A"/>'
            f'{body}</g>')

def ground(w, g):
    return f'<path d="M6 {g} H{w-6}" stroke="#8A5A2B" stroke-width="2.5" stroke-linecap="round"/>'

def shade(x, g, length, d):
    cx = x + d * length / 2
    return f'<ellipse cx="{cx}" cy="{g+2}" rx="{length/2}" ry="5" fill="#4A5560" opacity=".55"/>'

def arrow_line(x1, y1, x2, y2, col="#E8962E", w=3):
    a = math.atan2(y2 - y1, x2 - x1)
    p1 = (x2 - 11*math.cos(a - .45), y2 - 11*math.sin(a - .45))
    p2 = (x2 - 11*math.cos(a + .45), y2 - 11*math.sin(a + .45))
    return (f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>'
            f'<path d="M{p1[0]:.1f} {p1[1]:.1f} L{x2} {y2} L{p2[0]:.1f} {p2[1]:.1f}" stroke="{col}" stroke-width="{w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')

def svg(w, h, inner, width=None, cls="", attrs=""):
    c = f' class="{cls}"' if cls else ""
    return f'<svg{c}{attrs} viewBox="0 0 {w} {h}" width="{width or w}" style="max-width:100%">{inner}</svg>'

# ---------- shining light (tap a light source: light spreads, the object blocks it, its shadow forms) ----------
# Each blocking object is given as its outline points; JS (cast() in the shell) finds the two edge rays
# that just touch the object, leaves the area between them dark, and draws the shadow where they meet
# the ground (g) or the wall (wall).
def circle_pts(cx, cy, r, n=24):
    return [(cx + r*math.cos(2*math.pi*i/n), cy + r*math.sin(2*math.pi*i/n)) for i in range(n)]

def tree_pts(x, g):
    return [(x-5, g), (x+5, g), (x-5, g-34), (x+5, g-34)] + circle_pts(x, g-48, 21)

def kid_pts(x, g, h=58):
    hy = g - h + 9
    return circle_pts(x, hy, 9, 12) + [(x-12, hy+20), (x+12, hy+20), (x-9, g), (x+9, g)]

def bottle_pts(x, g):
    return [(x-10, g), (x-10, g-36), (x-4, g-48), (x-4, g-58), (x+4, g-58), (x+4, g-48), (x+10, g-36), (x+10, g)]

def cast_svg(w, h, inner, width, src, obs, g=None, wall=None):
    """svg whose light source (data-act="cast" or "switch") shines on the objects in obs"""
    geo = {"s": list(src)}
    if g is not None: geo["g"] = g
    if wall is not None: geo["wall"] = wall
    pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in obs)
    attrs = f" data-cast='{json.dumps(geo)}' data-obs=\"{pts}\""
    return svg(w, h, '<g class="cast"></g>' + inner, width, attrs=attrs)

K = lambda t: f'<b class="k">{t}</b>'
pages = []

# 1 cover
pages.append(page(1, "", f'''
<div class="cover">
  <div class="mtag">MISSION 2</div>
  <h1>Light Explorer</h1>
  <div class="tag">How does light travel? How is a shadow made?</div>
  <div class="hero">{glow(200)}</div>
  <div class="welcome">Welcome back, Explorer! Today we follow the light<br>and hunt for {K("shadows")}. Are you ready?</div>
  <div class="name">Explorer's name: <span class="nline"></span></div>
  <div class="how"><div class="hh">How to play</div>
    <div>1. Read what Glow says on each page.</div>
    <div>2. Do the mission under it.</div>
    <div>3. Win 3 badges. Colour each badge when you win it!</div></div>
  <div class="badges">
    <div>{badge("#2E8B57")}<div class="bn" style="color:#2E8B57">Shadow Hunter</div></div>
    <div>{badge("#2F80C9")}<div class="bn" style="color:#2F80C9">Shadow Detective</div></div>
    <div>{badge("#E8962E")}<div class="bn" style="color:#E8962E">Light Scientist</div></div>
  </div>
</div>''', unit=True))

# 2 quick-fire review
pages.append(page(2, "Remember Mission 1?", bubble(f"Quick-fire time! Show me what you remember about {K('sources of light')}.") +
task(1, "Fill in the blank.", f'<p class="fill">A source of light gives out light of its {blank(120)}.</p>') +
task(1, "Circle the three sources of light.", pills(["the Moon","lightning","a mirror","fireworks","a torch that is on","glitter"])) +
task(2, "Which group? Write Fire, Electricity or Nature.", f'''<table class="tf who">
<tr><td>1.</td><td class="yt">stage lights</td><td class="wa">{blank(170)}</td></tr>
<tr><td>2.</td><td class="yt">krill</td><td class="wa">{blank(170)}</td></tr>
<tr><td>3.</td><td class="yt">a camp fire</td><td class="wa">{blank(170)}</td></tr></table>''') +
task(2, "Why is the Sun the most important source of light?", lines(2))))

# 3 straight line
# .beam lines sit under the trees and draw when the sun is tapped
forest = (
    '<rect x="0" y="0" width="420" height="170" rx="12" fill="#EEF7F1"/>' + sun_svg(34, 30, 14, "beams") +
    "".join(f'<path d="M44 40 L{bx} 158 L{bx+26} 158 Z" fill="#FFE68A" opacity=".55"/>' for bx in (118, 214, 312)) +
    "".join(f'<path class="beam" pathLength="1" d="M44 40 L{bx+13} 158"/>' for bx in (118, 214, 312)) +
    "".join(tree(x, 158) for x in (90, 180, 275, 370)) + ground(420, 158))
pages.append(page(3, "Straight or wiggly?", bubble(f"Last time you made a guess. Here is the answer! Light travels in a {K('straight line')} away from its source.") +
f'<div class="center">{svg(420, 170, forest, 520)}</div>' +
task(1, "Look at the sunlight between the trees. Circle the correct word.", f'''<ol class="ol">
<li>The light makes {choose("straight","wiggly")} lines.</li>
<li>Light travels {choose("towards","away from")} its source.</li></ol>''') +
task(2, "What do you notice about the sunlight in the picture?", lines(2))))

# 4 rays and arrows
def raybox(kind, label):
    b = lamp_svg(26, 45)
    if kind == "wiggly":
        b += '<path d="M42 45 q10 -14 20 0 t20 0 t20 0" stroke="#E8962E" stroke-width="3" fill="none" stroke-linecap="round"/>' + arrow_line(101, 45, 118, 45)
    elif kind == "back":
        b += arrow_line(118, 45, 42, 45)
    elif kind == "good":
        b += arrow_line(42, 45, 118, 45)
    else:
        b += '<path d="M42 40 Q80 0 116 38" stroke="#E8962E" stroke-width="3" fill="none" stroke-linecap="round"/>' + arrow_line(108, 30, 116, 38)
    return f'<div class="rcell"><div class="rl">{label}</div>{svg(130, 80, b, 150)}</div>'

pages.append(page(4, "Rays and arrows", bubble(f"Scientists draw light as a straight line called a {K('ray')}. The {K('arrow')} shows the {K('direction')} the light travels.") +
task(2, "Which picture shows light the right way? Circle it.",
     '<div class="rgrid">' + raybox("wiggly", "A") + raybox("back", "B") + raybox("good", "C") + raybox("curve", "D") + '</div>') +
task(2, '<b class="go">Ray drawing.</b> Use a ruler. Draw four rays coming out of the lamp. Add arrows.',
     f'<div class="drawbox">{svg(320, 140, lamp_svg(160, 70, "flash"), 360)}</div>') +
task(1, "Fill in the blank.", f'<p class="fill">The arrow on a ray shows the {blank(150)} of the light.</p>')))

# 5 light can't turn corners
# .lightA runs through the straight straw and out; .lightB stops at the bend
straws = (lamp_svg(24, 40, "strawA") + lamp_svg(24, 118, "strawB") +
    '<path class="light lightA" pathLength="1" d="M38 40 H248"/>' +
    '<path class="light lightB" pathLength="1" d="M38 118 H136"/>' +
    '<path d="M44 34 H236 M44 46 H236" stroke="#2F80C9" stroke-width="3"/>' +
    '<path d="M44 112 H130 Q150 112 150 92 M44 124 H130 Q162 124 162 92" stroke="#2F80C9" stroke-width="3" fill="none"/>' +
    '<path d="M150 92 V82 M162 92 V82" stroke="#2F80C9" stroke-width="3"/>' +
    '<text x="250" y="46" font-family="Fredoka" font-weight="600" font-size="18" fill="#3C3A8F">A</text>' +
    '<text x="176" y="94" font-family="Fredoka" font-weight="600" font-size="18" fill="#3C3A8F">B</text>')
wall = (lamp_svg(30, 85) + '<rect x="150" y="66" width="22" height="46" rx="3" fill="#C9A27A" stroke="#8A5A2B" stroke-width="2.5"/>' +
    '<path d="M300 14 l7 14 15 2 -11 10 3 15 -14 -8 -14 8 3 -15 -11 -10 15 -2z" fill="#FFF3C4" stroke="#E8962E" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<circle cx="306" cy="89" r="15" fill="#E6F2FB" stroke="#2F80C9" stroke-width="2.5"/>' +
    '<path d="M306 140 l17 28 h-34z" fill="#E8F6F3" stroke="#2A9D8F" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<text x="332" y="40" font-family="Fredoka" font-weight="600" font-size="17" fill="#3C3A8F">A</text>'
    '<text x="332" y="95" font-family="Fredoka" font-weight="600" font-size="17" fill="#3C3A8F">B</text>'
    '<text x="332" y="164" font-family="Fredoka" font-weight="600" font-size="17" fill="#3C3A8F">C</text>')
pages.append(page(5, "Light can't turn corners", bubble(f"Light cannot {K('bend')} around things. If something is in the way, the light is {K('blocked')}.") +
task(1, "Glow looks through two straws at a lamp. Through which straw can Glow see the light?",
     f'<div class="center">{svg(270, 140, straws, 300)}</div><p class="fill">Glow can see the light through straw {choose("A","B")}.</p>') +
task(2, "The lamp shines at three shapes. Use a ruler. Which shape does NOT get any light?",
     f'<div class="center">{svg(350, 175, wall, 360)}</div><p class="fill">Shape {blank(70)} does not get any light.</p>') +
task(3, "Why can't the light reach that shape?", lines(1))))

# 6 what is a shadow
# tapping the lamp toggles .off on this svg: bulb grey, rays and shadow hidden
sh = (lamp_svg(40, 80, "switch") + '<circle cx="170" cy="80" r="24" fill="#FDECEF" stroke="#C2557A" stroke-width="2.5"/>' +
    '<path d="M300 10 V160" stroke="#6B7785" stroke-width="4"/>' +
    '<ellipse class="shadow" cx="294" cy="80" rx="7" ry="44" fill="#4A5560" opacity=".7"/>' +
    '<path class="rays" d="M54 74 L294 36 M54 86 L294 124" stroke="#E8962E" stroke-width="1.8" stroke-dasharray="5 4"/>' +
    '<rect x="16" y="120" width="34" height="26" rx="6" fill="#fff" stroke="#E8962E" stroke-width="2"/><text x="28" y="139" font-family="Fredoka" font-weight="600" font-size="16" fill="#E8962E">1</text>' +
    '<rect x="153" y="120" width="34" height="26" rx="6" fill="#fff" stroke="#E8962E" stroke-width="2"/><text x="165" y="139" font-family="Fredoka" font-weight="600" font-size="16" fill="#E8962E">2</text>' +
    '<rect x="248" y="134" width="34" height="26" rx="6" fill="#fff" stroke="#E8962E" stroke-width="2"/><text x="260" y="153" font-family="Fredoka" font-weight="600" font-size="16" fill="#E8962E">3</text>')
pages.append(page(6, "What is a shadow?", bubble(f"Light cannot pass through an {K('opaque')} object. When an opaque object {K('blocks')} light, a dark area forms behind it. This dark area is a {K('shadow')}.") +
f'<div class="center">{cast_svg(320, 165, sh, 400, (40, 80), circle_pts(170, 80, 25), wall=298)}</div>' +
task(1, "Label the picture. Use the words in the box.", '<div class="wbox">shadow · light source · opaque object</div>' +
     f'<p class="fill">1 {blank(160)} &nbsp; 2 {blank(170)} &nbsp; 3 {blank(140)}</p>') +
task(2, "Fill in the blanks.", f'<p class="fill">A shadow is formed when light is {blank(130)} by an {blank(130)} object.</p>') +
task(2, "Where does the shadow form? Circle the correct word.", f'<p class="fill">The shadow forms {choose("in front of","behind")} the object, on the side away from the light.</p>')))

# 7 shadow shapes
OBJ = {
 "mug": ('<rect x="14" y="14" width="34" height="42" rx="4" fill="{f}" stroke="{s}" stroke-width="2.5"/><path d="M48 24 q14 0 14 12 q0 12 -14 12" fill="none" stroke="{s}" stroke-width="5"/>'),
 "star": ('<path d="M36 6l8.5 18 19.5 2-14.6 13.3 4.1 19.4L36 49l-17.5 9.7 4.1-19.4L8 26l19.5-2z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/>'),
 "house": ('<path d="M10 32 L36 8 L62 32 V60 H10z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/>'),
 "heart": ('<path d="M36 58 C10 40 8 22 20 14 C28 9 34 14 36 20 C38 14 44 9 52 14 C64 22 62 40 36 58z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/>'),
}
def obj(k, dark):
    f, s = ("#3A4148", "#3A4148") if dark else ({"mug":"#FDECEF","star":"#FFF3C4","house":"#E8F6F3","heart":"#FDECEF"}[k], {"mug":"#C2557A","star":"#E8962E","house":"#2A9D8F","heart":"#C2557A"}[k])
    inner = OBJ[k].format(f=f, s=s)
    if not dark:
        inner = f'<g class="tap" data-act="wiggle">{inner}</g>'
    return svg(72, 66, inner, 66)
left7 = ["mug", "star", "house", "heart"]
right7 = ["house","mug","heart","star"]
rows7 = "".join(f'<tr><td class="ml">{i+1}. {obj(k, False)}</td><td class="mb"></td><td class="mr">{"abcd"[i]}. {obj(right7[i], True)}</td></tr>' for i, k in enumerate(left7))
pages.append(page(7, "Shadow shapes", bubble(f"A shadow has the same {K('shape')} as the outline of the object. When the object {K('moves')}, its shadow moves too!") +
task(1, "Match each object to its shadow. Write the letter.", f'<table class="match shapes">{rows7}</table>') +
task(3, "In a shadow puppet show, the puppet is between a lamp and a screen. What do people see on the screen? Why?", lines(2))))

# 8 opposite side
def scene(src, thing):
    g = 112
    b = ground(200, g)
    s = {"sunL": (30, 30), "sunR": (170, 30), "lamp": (170, 70)}[src]
    b += lamp_svg(*s, "cast") if src == "lamp" else sun_svg(*s, act="cast")
    b += {"tree": tree(100, g), "kid": kid(100, g), "bottle": bottle(100, g)}[thing]
    obs = {"tree": tree_pts, "kid": kid_pts, "bottle": bottle_pts}[thing](100, g)
    return f'<div class="dcell">{cast_svg(200, 125, b, 200, s, obs, g=g)}</div>'
pages.append(page(8, "Which side?", bubble(f"A shadow is always on the {K('opposite side')} from the light. Light comes from one side, so the shadow falls on the other side.") +
task(2, '<b class="go">Shadow drawing.</b> Draw the shadow in each picture.',
     '<div class="dgrid">' + scene("sunL", "tree") + scene("lamp", "bottle") + scene("sunR", "kid") + '</div>') +
task(1, "Circle the correct word.", f'<p class="fill">A shadow is on the {choose("same","opposite")} side from the light.</p>') +
task(3, "Mali stands with the Sun behind her. Where is her shadow?", lines(1)) +
task(2, "If you walk towards the Sun, can you see your shadow? Why?", lines(2))))

# 9 sun moves
def sunpanel(sx, sy, label):
    g = 112
    b = (ground(200, g) + sun_svg(sx, sy, 12, act="cast") + kid(100, g) +
         f'<text x="10" y="22" font-family="Fredoka" font-weight="600" font-size="15" fill="#3C3A8F">{label}</text>')
    return f'<div class="dcell">{cast_svg(200, 125, b, 200, (sx, sy), kid_pts(100, g), g=g)}<div class="tl">{blank(130)}</div></div>'
# demo box: JS moves .dsun along an arc and resizes .dshade (see sunDay in the script)
sunday = (ground(360, 100) + '<ellipse class="dshade" cx="180" cy="102" rx="0" ry="5" fill="#4A5560" opacity=".55"/>' +
    kid(180, 100) + f'<g class="dsun">{sun_svg(0, 0, 11)}</g>')
pages.append(page(9, "The Sun moves, the shadow changes", bubble(f"The Sun moves across the sky during the day. In the {K('morning')} and {K('afternoon')}, the Sun is {K('low')} and shadows are {K('long')}. At {K('midday')}, the Sun is {K('high')} and shadows are {K('short')}.") +
f'<div class="sunbox"><button class="run tap" data-act="sunday" aria-label="play">▶</button>{svg(360, 108, sunday, 360)}</div>' +
task(2, "In these pictures, the Sun rises on the left. Draw the shadow. Then write morning, midday or afternoon.",
     '<div class="dgrid">' + sunpanel(100, 22, "A") + sunpanel(176, 74, "B") + sunpanel(24, 74, "C") + '</div>') +
task(1, "Circle the correct words.", f'''<ol class="ol">
<li>In the morning, the Sun is {choose("high","low")} and my shadow is {choose("long","short")}.</li>
<li>At midday, the Sun is {choose("low","high")} and my shadow is {choose("short","long")}.</li></ol>''') +
task(3, "Why does your shadow point one way in the morning and the other way in the afternoon?", lines(2))))

# 10 near or far
def nf(lx, label, drag=False):
    lamp = lamp_svg(lx, 75, "" if drag else "cast")
    if drag:
        # the lamp slides left/right; JS sizes .wshade from the lamp, ball (x 190, r 16) and wall (x 300)
        lamp = (f'<ellipse class="wshade" cx="296" cy="75" rx="5" ry="{16*(300-lx)/(190-lx):.1f}" fill="#4A5560" opacity=".6"/>'
                f'<g class="drag" data-lx="{lx}"><rect x="{lx-22}" y="50" width="44" height="54" fill="transparent"/>{lamp}</g>')
    b = ('<path d="M300 8 V142" stroke="#6B7785" stroke-width="4"/>' + lamp +
         '<circle cx="190" cy="75" r="16" fill="#FDECEF" stroke="#C2557A" stroke-width="2.5"/>' +
         f'<text x="8" y="22" font-family="Fredoka" font-weight="600" font-size="16" fill="#3C3A8F">{label}</text>')
    return b
pages.append(page(10, "Big shadow, small shadow", bubble(f"The size of a shadow depends on where the light is. Move the light {K('closer')} to the object, and the shadow gets {K('bigger')}. Move the light {K('farther')} away, and the shadow gets {K('smaller')}.") +
task(2, "In which picture will the shadow on the wall be bigger? Circle it.",
     f'<div class="nfgrid"><div class="rcell">{cast_svg(310, 150, nf(40, "A"), 260, (40, 75), circle_pts(190, 75, 17), wall=298)}</div><div class="rcell">{svg(310, 150, nf(140, "B", True), 260)}</div></div>') +
task(1, "Fill in the blanks.", f'<p class="fill">When the light moves closer to the object, the shadow gets {blank(130)}.</p><p class="fill">When the light moves farther away, the shadow gets {blank(130)}.</p>') +
task(3, "Glow wants to make a giant shadow of himself on the wall. What should he do with the torch?", lines(2))))

# 11 true/false -> badge 1
tf11 = ["Light travels in a straight line.", "Light can bend around a wall.", "A shadow is on the same side as the light.",
        "A shadow forms when light is blocked.", "At midday, your shadow is very long.", "A shadow has the same shape as the outline of the object.",
        "When you move, your shadow moves too.", "A red ball makes a red shadow."]
rows11 = "".join(f'<tr><td>{i+1}.</td><td class="yt">{t}</td><td class="yn">True</td><td class="yn">False</td></tr>' for i, t in enumerate(tf11))
pages.append(page(11, "Shadow Hunter", bubble(f"Careful, Explorer! Some of these are {K('tricks')}. Get {K('7 or more')} right to win your first badge!") +
task(2, "Circle True or False.", f'<table class="tf tfw">{rows11}</table>') +
badge_row("#2E8B57", "Shadow Hunter", 'My score: <span class="sline"></span> / 8', "7 or more? Colour your badge on page 1!")))

# 12 detective -> badge 2
def findsun(thing, d, L):
    g = 112
    b = ground(200, g) + shade(100, g, L, d) + {"tree": tree(100, g), "kid": kid(100, g)}[thing]
    return f'<div class="dcell">{svg(200, 125, b, 220)}</div>'
clues12 = ["I am dark. I appear when light is blocked.",
           "Light cannot pass through me.",
           "I am a straight line that shows the path of light.",
           "I move across the sky, so shadows change during the day."]
rows12 = "".join(f'<tr><td>{i+1}.</td><td class="yt">“{c}”</td><td class="wa">{blank(170)}</td></tr>' for i, c in enumerate(clues12))
pages.append(page(12, "Shadow Detective", bubble(f"Detective time! Look at each shadow. Where is the light? Then read the clues and solve the {K('mystery words')}.") +
task(2, "Look at the shadow. Draw the Sun where it should be.",
     '<div class="dgrid two2">' + findsun("tree", -1, 76) + findsun("kid", 1, 30) + '</div>') +
task(2, "Who am I?", f'<table class="tf who">{rows12}</table>') +
badge_row("#2F80C9", "Shadow Detective", "All correct?", "Colour your badge on page 1!")))

# 13 book challenge -> badge 3
pages.append(page(13, "Book Challenge", bubble(f"These are the {K('big questions')} you will meet at school. Answer in {K('full sentences')} to win your third badge!") +
task(2, "Question 1", '<p class="fill">How does light travel?</p>' + lines(1)) +
task(2, "Question 2", '<p class="fill">How are shadows formed?</p>' + lines(3)) +
task(3, "Question 3", '<p class="fill">Why does your shadow change during the day?</p>' + lines(3)) +
badge_row("#E8962E", "Light Scientist", "", "Finished? Colour your last badge on page 1!")))

# 14 mixed + boss + next mission
moon = ('<svg class="moon tap" data-act="moon" viewBox="0 0 80 80" width="110" height="110"><g class="mb"><circle cx="40" cy="40" r="28" fill="#F3F5F7" stroke="#6B7785" stroke-width="3"/><circle cx="30" cy="32" r="5" fill="#DDE2E7"/><circle cx="50" cy="48" r="7" fill="#DDE2E7"/><circle cx="48" cy="26" r="3.5" fill="#DDE2E7"/></g>'
        '<text class="mq" x="40" y="50" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="30" fill="#3C3A8F">?</text></svg>')
pages.append(page(14, "Mixed challenge", bubble("Last page! Here is the boss question. Then get ready for your next mission.") +
task(1, "Fill in the blank.", f'<p class="fill">Light cannot pass through an {blank(140)} object.</p>') +
task(2, "Ploy's shadow is very short. What time of day is it?", lines(1)) +
task(3, "<b class=\"go\">Boss question!</b> If light could bend around objects, would there still be shadows? Explain.", lines(2)) +
f'''<div class="next"><div class="nimg">{moon}</div>
<div><b class="nm">Next mission:</b> The Moon is not a source of light. But we can see it at night. How can we see it?<br>My guess: {blank(150)}</div></div>'''))

CSS_M2 = """
.rgrid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin: 10px 0 0 32px }
.rcell { border: 1.6px solid #C8CDD2; border-radius: 12px; padding: 4px 6px; text-align: center }
.rl { font-family: 'Fredoka'; font-weight: 600; color: #3C3A8F; text-align: left; padding-left: 4px }
.drawbox { border: 1.6px dashed #2F80C9; border-radius: 12px; margin: 10px 0 0 32px; text-align: center; padding: 4px }
.dgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin: 10px 0 0 32px }
.dgrid.two2 { grid-template-columns: repeat(2,1fr) }
.dcell { border: 1.4px solid #C8CDD2; border-radius: 12px; padding: 4px; text-align: center }
.tl { margin: 2px 0 6px }
.nfgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 10px 0 0 32px }
.shapes td { height: 74px; padding: 4px 8px }
.shapes svg { vertical-align: middle }
.tfw .yn { width: 76px }
"""

# worksheet CSS (student parts), with the fixed A4 height relaxed to a minimum for the web
CSS = """
* { box-sizing: border-box }
.page { width: 210mm; min-height: 297mm; padding: 15mm 16mm 12mm; position: relative; overflow: hidden; font-family: 'Andika', sans-serif; color: #22262B; font-size: 15.5pt; line-height: 1.45; background: #fff }
.top { display: flex; justify-content: space-between; font-family: 'Fredoka'; font-weight: 500; font-size: 10.5pt; color: #2E8B57; border-bottom: 1.2px solid #2E8B57; padding-bottom: 7px; margin-bottom: 14px }
h2 { font-family: 'Fredoka'; font-weight: 600; color: #3C3A8F; font-size: 25pt; margin: 4px 0 10px; letter-spacing: -.2px }
.k { color: #C46A10; font-weight: 700 }
.say { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 16px }
.me { flex: 0 0 78px; margin-top: -4px }
.bub { flex: 1; border: 2px solid #2F80C9; background: #F2F8FD; border-radius: 14px; padding: 10px 18px; position: relative }
.bub:before { content: ""; position: absolute; left: -10px; top: 22px; border: 9px solid transparent; border-right-color: #2F80C9; border-left: 0 }
.task { margin: 14px 0 6px }
.tq { display: flex; gap: 10px; align-items: baseline }
.stars { flex: 0 0 auto; display: inline-flex; gap: 1px; position: relative; top: 2px }
.go { color: #2F80C9 }
.fill { margin: 8px 0 4px 32px }
.ol { margin: 6px 0 0 32px; padding-left: 22px } .ol li { margin: 6px 0 }
.mini { display: inline-block; border: 1.6px solid #9DBFE0; border-radius: 999px; padding: 0 12px; margin: 0 4px; line-height: 1.5 }
.blank { display: inline-block; border-bottom: 1.4px solid #22262B; text-align: center; height: 1.35em; vertical-align: baseline }
.lines { margin: 2px 0 0 32px }
.line { height: 44px; border-bottom: 1.2px solid #8A929B; display: flex; align-items: flex-end; padding-bottom: 3px }
.sline { display: inline-block; width: 70px; border-bottom: 1.4px solid #22262B }
.center { text-align: center; margin: -4px 0 -6px }
.wbox { border: 1.5px dashed #2E8B57; border-radius: 10px; text-align: center; padding: 6px 14px; margin: 10px 0 12px 32px; color: #2D3338 }
.pills { display: flex; gap: 10px; margin: 8px 0 4px 32px; flex-wrap: wrap }
.pill { border: 1.6px solid #2F80C9; border-radius: 999px; padding: 2px 16px }
table { border-collapse: collapse }
.match { margin: 10px 0 0 32px; width: calc(100% - 32px) }
.match td { border-bottom: 1.2px solid #B8BEC4; padding: 9px 8px; height: 52px }
.match .mb { width: 50px; border: 2px solid #E8962E; text-align: center; font-size: 17pt }
.match .ml { width: 42% }
.tf { margin: 8px 0 0 32px; width: calc(100% - 32px) }
.tf td { border-bottom: 1.2px solid #B8BEC4; padding: 7px 6px }
.tf .yt { width: 70% }
.tf .yn { text-align: center; color: #2F80C9; font-family: 'Fredoka'; font-weight: 600; width: 60px }
.who .yt { width: 62% } .who td { padding: 9px 6px }
.wa { text-align: right }
.earn { position: absolute; left: 16mm; bottom: 12mm; display: flex; gap: 18px; align-items: center }
.eb { text-align: center; position: relative }
.bn { font-family: 'Fredoka'; font-weight: 600; font-size: 12pt; margin-top: 2px }
.e1 { font-family: 'Fredoka'; font-weight: 600; color: #2E8B57; font-size: 14pt }
.e2 { font-family: 'Fredoka'; font-weight: 500; color: #2E8B57; font-size: 11pt }
.cover { text-align: center; display: flex; flex-direction: column; align-items: center }
.mtag { border: 2px solid #E8962E; color: #E8962E; border-radius: 999px; padding: 3px 26px; font-family: 'Fredoka'; font-weight: 600; letter-spacing: 6px; font-size: 14pt; margin-top: 18px }
h1 { font-family: 'Fredoka'; font-weight: 600; color: #3C3A8F; font-size: 54pt; margin: 4px 0 0; line-height: 1.1 }
.tag { font-family: 'Fredoka'; font-weight: 500; font-size: 15pt }
.hero { margin: 14px 0 8px }
.welcome { border: 2px solid #2F80C9; background: #F2F8FD; border-radius: 14px; padding: 12px 26px; width: 88% }
.name { margin: 18px 0 14px; text-align: left; width: 82% }
.nline { display: inline-block; width: 300px; border-bottom: 1.4px solid #22262B }
.how { border: 1.4px dashed #2E8B57; border-radius: 10px; text-align: left; padding: 10px 22px; width: 82%; font-size: 14.5pt }
.hh { color: #2E8B57; font-family: 'Fredoka'; font-weight: 600 }
.badges { display: flex; gap: 46px; margin-top: 22px }
.next { display: flex; gap: 22px; align-items: center; margin-top: 26px; border: 1.4px solid #E8962E; border-radius: 14px; padding: 14px 18px; background: #FFFBF2 }
.nm { color: #E8962E; font-family: 'Fredoka' }
"""

# tap animations: each plays once when JS adds .play (removed again after it ends)
CSS_ANIM = """
.tap { cursor: pointer }
svg .tap, svg.tap * { transform-box: view-box }
.glow .gl { transform-origin: 66px 132px }
.glow.play .gl { animation: glowHalo .9s ease-out }
.glow.play .bd { animation: glowBody .9s ease-out }
.glow .wings { transform-origin: 108px 96px }
.glow.play .wings { animation: flutter .8s ease-in-out }
@keyframes glowHalo { 40% { transform: scale(1.45); opacity: 1 } }
@keyframes glowBody { 40% { fill: #FFF6A8 } }
@keyframes flutter { 12%, 62% { transform: rotate(-14deg) } 37%, 87% { transform: rotate(10deg) } }

.badge .bo, .badge .bi, .badge .bs { transition: fill .3s, stroke .3s }
.badge.on .bo { fill: var(--c) }
.badge.on .bi, .badge.on .bs { stroke: #fff }
.badge.on .bs { fill: #FFD23F }
.badge.play { animation: bounce .6s ease-out }
@keyframes bounce { 30% { transform: scale(1.12) translateY(-6px) } 60% { transform: scale(.96) } }

.pill { transition: box-shadow .2s }
.pill.ring { box-shadow: 0 0 0 3px #fff, 0 0 0 6px #2F80C9 }

.halo { opacity: 0; transform-origin: center; transform-box: fill-box }
.src.play .halo { animation: halo .8s ease-out }
@keyframes halo { 30% { opacity: .9; transform: scale(1.15) } 100% { opacity: 0; transform: scale(1.3) } }

.beam, .light { fill: none; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0 }
.beam { stroke: #F5B700; stroke-width: 4 }
.light { stroke: #FFC400; stroke-width: 7 }
.play .beam, .light.play { animation: draw 2.2s ease-out }
@keyframes draw { 0% { opacity: 1; stroke-dashoffset: 1 } 55% { opacity: 1; stroke-dashoffset: 0 } 80% { opacity: 1; stroke-dashoffset: 0 } 100% { opacity: 0; stroke-dashoffset: 0 } }

.bulb, .shadow, .rays { transition: fill .25s, opacity .25s }
svg.off .bulb { fill: #E3E6EA }
svg.off .shadow, svg.off .rays { opacity: 0 }

[data-act=wiggle] { transform-origin: 36px 36px }
[data-act=wiggle].play { animation: wiggle .6s ease-in-out }
@keyframes wiggle { 20% { transform: rotate(-10deg) } 45% { transform: rotate(9deg) } 70% { transform: rotate(-5deg) } }

.sunbox { display: flex; align-items: center; gap: 10px; margin: 0 0 4px 32px; border: 1.6px solid #E8962E; border-radius: 12px; padding: 4px 10px; background: #FFFBF2 }
.sunbox svg { flex: 1; height: auto }
.sunbox .run { flex: none; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #E8962E; background: #fff; color: #E8962E; font-size: 18px; padding: 0 0 0 3px; font-family: inherit }
.drag { cursor: ew-resize }

.confetti { position: absolute; left: 50%; top: 50px; width: 8px; height: 8px; border-radius: 2px; pointer-events: none; animation: pop .9s ease-out forwards }
@keyframes pop { from { transform: translate(-50%,-50%) } to { transform: translate(var(--dx), var(--dy)) rotate(260deg); opacity: 0 } }

.cast .lit { fill: #FFE68A; opacity: .55 }
.cast .edge { stroke: #E8962E; stroke-width: 1.6; stroke-dasharray: 5 4; fill: none }
.cast .shade { fill: #4A5560; opacity: 0; transition: opacity .5s }
.cast .shade.on { opacity: .7 }
svg.casting .shadow, svg.casting .rays { opacity: 0 }

.moon .mb { transform-origin: 40px 40px }
.moon .mq { opacity: 0 }
.moon.play .mb { animation: turn 2.4s ease-in-out }
.moon.asked .mq { animation: ask 2.4s ease-in forwards }
@keyframes turn { to { transform: rotate(360deg) } }
@keyframes ask { 75% { opacity: 0 } to { opacity: 1 } }
"""

SHELL = (pathlib.Path(__file__).resolve().parent / "light-m2-shell.html").read_text(encoding="utf-8")
html = (SHELL.replace("/*SHEET_CSS*/", CSS + CSS_M2 + CSS_ANIM)
             .replace("<!--PAGES-->", "\n".join(f'<div class="sheet">{p}<canvas class="ink"></canvas></div>' for p in pages)))
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print("wrote", OUT, len(pages), "pages")
