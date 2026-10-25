"""Builds public/light-p5-m3/index.html: Light Explorer · Mission 3 as web pages.

Text and drawings come from the worksheet generator (build_m3.py), student version
only (no answers, no teacher notes). Helpers, CSS and the page chrome are shared with
Mission 2: this script runs tools/build-light-p5.py's helper part, then adds the
Mission 3 pages. Run: python3 tools/build-light-p5-m3.py
"""
import pathlib

HERE = pathlib.Path(__file__).resolve().parent

# helpers + CSS from Mission 2 (everything except its page-writing step)
_src = (HERE / "build-light-p5.py").read_text(encoding="utf-8").split("\nSHELL = (")[0]
exec(compile(_src, str(HERE / "build-light-p5.py"), "exec"), globals())
OUT = HERE.parent / "public" / "light-p5-m3" / "index.html"
pages = []

def page(n, title, inner, unit=False):
    left = "Unit 4 · Light Energy" if unit else "Light Explorer · Mission 3"
    return f'''<section class="page" data-n="{n}"><div class="top"><span>{left}</span><span>{n} / {TOTAL}</span></div>
{f'<h2>{title}</h2>' if title else ''}{inner}</section>'''


# ---------- mission 3 drawings ----------
def eye(x, y, s=1.0, look=-1):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            '<path d="M-20 0 Q0 -15 20 0 Q0 15 -20 0z" fill="#fff" stroke="#1F2A44" stroke-width="2.5" stroke-linejoin="round"/>'
            f'<circle cx="{4*look}" cy="0" r="7" fill="#2F80C9"/><circle cx="{4*look}" cy="0" r="3" fill="#1F2A44"/>'
            '<path d="M-14 -12 l-4 -6 M0 -15 v-7 M14 -12 l4 -6" stroke="#1F2A44" stroke-width="2" stroke-linecap="round"/></g>')

def moon_svg(cx, cy, r=18):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F3F5F7" stroke="#6B7785" stroke-width="2.5"/>'
            f'<circle cx="{cx-6}" cy="{cy-5}" r="{r*.18:.1f}" fill="#DDE2E7"/><circle cx="{cx+6}" cy="{cy+6}" r="{r*.24:.1f}" fill="#DDE2E7"/>')

def book_svg(x, y):
    return (f'<path d="M{x-28} {y-14} q14 -6 28 2 v32 q-14 -8 -28 -2z M{x+28} {y-14} q-14 -6 -28 2 v32 q14 -8 28 -2z" '
            'fill="#FFF7EC" stroke="#8A5A2B" stroke-width="2.5" stroke-linejoin="round"/>')

def parrot(x, y):
    return (f'<path d="M{x-40} {y+30} H{x+40}" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/>'
            f'<path d="M{x-6} {y+20} l-16 26 l12 -4z" fill="#2F80C9" stroke="#1F5C93" stroke-width="2" stroke-linejoin="round"/>'
            f'<ellipse cx="{x}" cy="{y+8}" rx="16" ry="22" fill="#CDEBD8" stroke="#2E8B57" stroke-width="2.5"/>'
            f'<circle cx="{x+4}" cy="{y-18}" r="13" fill="#F28C28" stroke="#C0561A" stroke-width="2.5"/>'
            f'<path d="M{x+15} {y-20} q10 2 6 12 q-4 -4 -8 -4z" fill="#FFD23F" stroke="#E8962E" stroke-width="2" stroke-linejoin="round"/>'
            f'<circle cx="{x+7}" cy="{y-21}" r="2.4" fill="#1F2A44"/>')

def candle_svg(x, g, flip=False):
    if flip:  # upside-down image on the screen
        return (f'<rect x="{x-6}" y="{g}" width="12" height="20" rx="2" fill="#FDECEF" stroke="#C2557A" stroke-width="2"/>'
                f'<path d="M{x} {g+38} q7 -9 0 -16 q-7 7 0 16z" fill="#FFD23F" stroke="#E8962E" stroke-width="2"/>')
    return (f'<path d="M{x} {g-38} q7 9 0 16 q-7 -7 0 -16z" fill="#FFD23F" stroke="#E8962E" stroke-width="2"/>'
            f'<rect x="{x-6}" y="{g-20}" width="12" height="20" rx="2" fill="#FDECEF" stroke="#C2557A" stroke-width="2"/>')

def label(x, y, t, size=15):
    return f'<text x="{x}" y="{y}" font-family="Fredoka" font-weight="600" font-size="{size}" fill="#3C3A8F">{t}</text>'

def beam(x1, y1, x2, y2, op=".75", w=14):
    return f'<path d="M{x1} {y1} L{x2} {y2}" stroke="#FFE68A" stroke-width="{w}" opacity="{op}" stroke-linecap="round"/>'

def choose3(opts):
    return "".join(f'<span class="mini">{t}</span>' for t in opts)

def card(html):
    return f'<div class="card">{html}</div>'


# 1 cover
pages.append(page(1, "", f'''
<div class="cover">
  <div class="mtag">MISSION 3</div>
  <h1>Light Explorer</h1>
  <div class="tag">How do we see? Can light pass through?</div>
  <div class="hero">{glow(200)}</div>
  <div class="welcome">Welcome back, Explorer! Today we find out how light helps us {K("see")},<br>and which {K("materials")} let light pass through.</div>
  <div class="name">Explorer's name: <span class="nline"></span></div>
  <div class="how"><div class="hh">How to play</div>
    <div>1. Read what Glow says on each page.</div>
    <div>2. Do the mission under it.</div>
    <div>3. Win 3 badges. Colour each badge when you win it!</div></div>
  <div class="badges">
    <div>{badge("#2E8B57")}<div class="bn" style="color:#2E8B57">Eye Expert</div></div>
    <div>{badge("#2F80C9")}<div class="bn" style="color:#2F80C9">Material Detective</div></div>
    <div>{badge("#E8962E")}<div class="bn" style="color:#E8962E">Light Professor</div></div>
  </div>
</div>''', unit=True))

# 2 warm-up
pages.append(page(2, "Remember Mission 2?", bubble(f"Warm-up time! Show me what you remember about {K('light')} and {K('shadows')}.") +
task(1, "Fill in the blank.", f'<p class="fill">Light travels in a {blank(130)} line away from its source.</p>') +
task(1, "Circle the correct words.", f'''<ol class="ol">
<li>A shadow forms when light {choose("passes through","is blocked")}.</li>
<li>At midday, my shadow is {choose("short","long")}.</li></ol>''') +
task(2, "Ploy holds a ball between a lamp and a wall. She moves the lamp closer to the ball. What happens to the shadow?", lines(1)) +
task(2, "Why is the shadow of a red ball dark, not red?", lines(2))))

# 3 the Moon mystery
moon3 = (sun_svg(40, 42, 18, act="flash") + moon_svg(230, 36, 20) + ground(420, 140) + kid(370, 140) + eye(392, 70, .7, -1) +
         label(18, 100, "Sun") + label(212, 76, "Moon") + label(338, 158, "Glow's friend", 13))
pages.append(page(3, "The Moon mystery", bubble(f"Remember your guess about the {K('Moon')}? The Moon has no light of its own. Sunlight hits the Moon and bounces off it. This bouncing is called {K('reflection')}.") +
f'<div class="center">{svg(420, 165, moon3, 470)}</div>' +
task(1, "Was your guess right? Circle the correct words.", f'''<ol class="ol">
<li>The Moon {choose("reflects","gives out")} light.</li>
<li>Moonlight really comes from the {choose("Moon","Sun")}.</li></ol>''') +
task(2, '<b class="go">Ray drawing.</b> Use a ruler. Draw rays with arrows to show how light helps Glow\'s friend see the Moon.', "") +
task(3, "At night, we cannot see the Sun. So why can we still see the Moon?", lines(2))))

# 4 seeing a source
def seecell(kind, letter):
    b = lamp_svg(24, 45, act="flash") + eye(112, 45, .75, -1)
    if kind == "in":
        b += arrow_line(40, 45, 92, 45)
    elif kind == "out":
        b += arrow_line(92, 45, 40, 45)
    elif kind == "curve":
        b += '<path d="M38 38 Q66 0 94 34" stroke="#E8962E" stroke-width="3" fill="none" stroke-linecap="round"/>' + arrow_line(86, 27, 94, 34)
    else:
        b += arrow_line(32, 34, 58, 10) + arrow_line(32, 58, 58, 80)
    return f'<div class="rcell"><div class="rl">{letter}</div>{svg(130, 90, b, 150)}</div>'
pages.append(page(4, "How do we see a source of light?", bubble(f"A {K('source of light')} gives out its own light. Its light travels in straight lines. When some of that light reaches us, we can see the source.") +
task(2, "Ben looks at a lamp, which is a source of light. Which picture shows how Ben sees the lamp? Circle it.",
     '<div class="rgrid">' + seecell("in", "A") + seecell("out", "B") + seecell("curve", "C") + seecell("away", "D") + '</div>') +
task(1, "Fill in the blank.", f'<p class="fill">We see a lamp because its light goes into our {blank(110)}.</p>') +
task(3, "Mali closes her eyes and faces a bright lamp. Can she see the lamp? Explain.", lines(2)) +
task(2, "Glow says, \"My eyes send out light so I can see.\" Is Glow right? Why?", lines(2))))

# 5 seeing non-sources
bookscene = (lamp_svg(36, 30, act="flash") + '<path d="M10 120 H330" stroke="#8A5A2B" stroke-width="2.5"/>' + book_svg(160, 100) + eye(300, 52, .8, -1) +
             arrow_line(50, 38, 140, 86) + arrow_line(178, 84, 278, 58))
parrotscene = sun_svg(34, 32, 14, act="flash") + parrot(170, 70) + ground(360, 128) + kid(320, 128) + eye(338, 60, .6, -1)
steps5 = ["The light reflects off the book.", "The reflected light goes into Glow's eyes.", "The lamp gives out light."]
rows5 = "".join(f'<tr><td class="yt">{t}</td><td class="wa">{blank(70)}</td></tr>' for t in steps5)
pages.append(page(5, "Seeing things that are not sources", bubble(f"Most things are {K('not sources')} of light. We see them because light from a source hits them and {K('reflects')} off them. Some of that light comes to us.") +
f'<div class="center">{svg(340, 128, bookscene, 270)}</div>' +
task(2, "How does Glow see the book? Write 1, 2 or 3 to put the steps in order.", f'<table class="tf who">{rows5}</table>') +
task(2, '<b class="go">Ray drawing.</b> Draw rays with arrows to show how the girl sees the parrot.', f'<div class="center">{svg(360, 135, parrotscene, 270)}</div>') +
task(1, "Fill in the blank.", f'<p class="fill">Light bounces off the parrot. We say the parrot {blank(130)} light.</p>')))

# 6 source or reflector
rows6 = '<tr><td></td><td></td></tr>' * 4
pages.append(page(6, "Source or not?", bubble(f"Some things give out their own light. Other things only {K('reflect')} light. Careful! Shiny things can look bright, but that does not make them sources.") +
task(2, "Sort them. Write each thing in the correct column.", '<div class="wbox">a mirror · the Sun · the Moon · a firefly · a white wall · a candle flame · a disco ball · a TV that is on</div>' +
     f'<table class="sort sort2"><tr><th>Gives out its own light</th><th>Only reflects light</th></tr>{rows6}</table>') +
task(3, "At a party, a disco ball sparkles. Ploy says it is a source of light. Is she right? Explain.", lines(2)) +
task(1, "Write one thing in your home that reflects light but is not a source.", lines(1))))

# 7 in the dark + Ibn al-Haytham
pages.append(page(7, "Can we see in the dark?", bubble(f"To see an object, we need {K('light')} and our {K('eyes')}. Light has to travel from the object to us. No light, no seeing!") +
card(f"<b class=\"go\">Science story.</b> Long ago, many people believed that our eyes sent out light to see things. About 1,000 years ago, a scientist called {K('Ibn al-Haytham')} showed that light travels into our eyes.") +
task(1, "Circle the correct word.", f'<p class="fill">In a room with no light at all, we {choose("can","cannot")} see a red ball.</p>') +
task(2, "Glow switches off every light in a room with no windows. Why can't he see his book?", lines(2)) +
task(3, "How does a dark room show that Ibn al-Haytham was right?", lines(2))))

# 8 mirror or board
def bounce(name, surf):
    b = (lamp_svg(26, 98, act="flash") + '<path d="M8 12 H192" stroke="#6B7785" stroke-width="4"/>' + label(80, 30, "wall", 13) +
         beam(40, 92, 128, 62, ".7", 10) + label(10, 135, name, 14))
    if surf == "mirror":
        b += '<rect x="132" y="40" width="12" height="52" rx="2" transform="rotate(-24 138 66)" fill="#EEF6FC" stroke="#2F80C9" stroke-width="2.5"/>'
    else:
        b += '<rect x="132" y="40" width="14" height="52" rx="2" transform="rotate(-24 138 66)" fill="#C9A27A" stroke="#8A5A2B" stroke-width="2.5"/>'
    return f'<div class="dcell">{svg(200, 145, b, 210)}</div>'
pages.append(page(8, "Mirror or board?", bubble(f"Every object reflects some light. {K('Smooth')}, {K('shiny')} surfaces like mirrors send the light off neatly in one direction. Rough, dull surfaces spread the light out in many directions.") +
'<div class="dgrid two2">' + bounce("Sharif: mirror", "mirror") + bounce("Majid: wooden board", "board") + '</div>' +
task(2, "Sharif shines a torch at a mirror. Majid shines a torch at a wooden board. Who sees a bright spot of light on the wall?",
     f'<p class="fill">{choose("Sharif","Majid")} sees a bright spot.</p>') +
task(1, "Circle the three things that reflect light best.", pills(["a wooden board", "a mirror", "kitchen foil", "a towel", "a carpet", "a shiny spoon"])) +
task(3, "Why can you see yourself in a mirror but not in a wooden door?", lines(2))))

# 9 transparent / translucent / opaque
def sheet(kind, num):
    b = lamp_svg(24, 60, act="flash") + beam(40, 60, 96, 60, ".8")
    if kind == "glass":
        b += '<rect x="98" y="18" width="10" height="84" fill="#DDEEFF" stroke="#2F80C9" stroke-width="2" opacity=".9"/>' + beam(110, 60, 176, 60, ".8")
    elif kind == "paper":
        b += '<rect x="98" y="18" width="10" height="84" fill="#F7F4EA" stroke="#B8BEC4" stroke-width="2"/>' + beam(110, 60, 176, 60, ".28")
    else:
        b += '<rect x="98" y="18" width="12" height="84" fill="#C9A27A" stroke="#8A5A2B" stroke-width="2"/>'
    b += label(8, 18, num)
    names = {"glass": "clear glass", "paper": "tracing paper", "wood": "wood"}
    return f'<div class="dcell">{svg(190, 112, b, 170)}<div class="cap">{names[kind]}</div></div>'
left9 = ["transparent", "translucent", "opaque", "reflects light"]
right9 = ["Some light passes through. Things look blurry.", "Light bounces off it.", "We can see clearly through it.", "No light passes through it."]
rows9 = "".join(f'<tr><td>{i+1}.</td><td class="yt9">{l}</td><td class="mb"></td><td class="r9">{"abcd"[i]}. {right9[i]}</td></tr>' for i, l in enumerate(left9))
pages.append(page(9, "Can light pass through?", bubble(f"{K('Transparent')} materials let almost all light through. {K('Translucent')} materials let only some light through. {K('Opaque')} materials let no light through.") +
'<div class="dgrid">' + sheet("paper", "1") + sheet("wood", "2") + sheet("glass", "3") + '</div>' +
task(1, "Label each material. Use the words in the box.", '<div class="wbox">opaque · transparent · translucent</div>' +
     f'<p class="fill">1 {blank(150)} &nbsp; 2 {blank(130)} &nbsp; 3 {blank(150)}</p>') +
task(2, "Match each word to what it means. Write the letter.", f'<table class="match m9">{rows9}</table>') +
task(2, "Glow shines a torch at tracing paper. What will he see on the other side?", lines(1))))

# 10 sort the materials + shadow strength
rows10 = '<tr><td></td><td></td><td></td></tr>' * 3
rows10b = "".join(f'<tr><td>{i+1}.</td><td class="yt">{o}</td><td>{choose3(("dark", "pale", "almost none"))}</td></tr>'
                  for i, o in enumerate(["a wooden block", "a clear glass", "tracing paper"]))
pages.append(page(10, "Sort the materials", bubble(f"Every material lets light through in its own way. Sort these like a scientist. Then think about their {K('shadows')}!") +
task(2, "Write each material in the correct column.", '<div class="wbox">frosted glass · cardboard · window glass · wax paper · a metal spoon · clear plastic · a wooden door · clean water · tracing paper</div>' +
     f'<table class="sort"><tr><th>Transparent</th><th>Translucent</th><th>Opaque</th></tr>{rows10}</table>') +
task(2, "A torch shines on each object. What kind of shadow does it make? Circle one answer.", f'<table class="tf circ3">{rows10b}</table>') +
task(3, "Bathroom windows are often made of frosted glass. Why?", lines(2))))

# 11 true/false -> badge 1
tf11 = ["We see the Moon because it gives out its own light.", "A mirror is not a source of light.",
        "Light from a lamp travels into our eyes.", "Our eyes send out light so that we can see.",
        "Tracing paper is transparent.", "Frosted glass makes a paler shadow than wood.",
        "A disco ball is a source of light.", "We see a book because light reflects off it into our eyes."]
rows11 = "".join(f'<tr><td>{i+1}.</td><td class="yt">{t}</td><td class="yn">True</td><td class="yn">False</td></tr>' for i, t in enumerate(tf11))
pages.append(page(11, "Eye Expert", bubble(f"Careful, Explorer! Some of these are {K('tricks')}. Get {K('7 or more')} right to win your first badge!") +
task(2, "Circle True or False.", f'<table class="tf tfw">{rows11}</table>') +
badge_row("#2E8B57", "Eye Expert", 'My score: <span class="sline"></span> / 8', "7 or more? Colour your badge on page 1!")))

# 12 detective -> badge 2
clues12 = ["You can see yourself in me.", "Things look blurry through me.", "I shine at night with the Sun's light.", "I let no light through at all."]
rows12 = "".join(f'<tr><td>{i+1}.</td><td class="yt">“{c}”</td><td class="wa">{blank(150)}</td></tr>' for i, c in enumerate(clues12))
jobs12 = ["a fish tank window", "curtains for a dark bedroom", "a lampshade for soft light"]
rows12b = "".join(f'<tr><td>{i+1}.</td><td class="yt">{j}</td><td class="wa">{blank(130)}</td></tr>' for i, j in enumerate(jobs12))
pages.append(page(12, "Material Detective", bubble(f"Detective time! Solve the {K('mystery words')}. Then choose the best material for each job.") +
task(2, "Who am I? Write the answer.", f'<table class="tf who">{rows12}</table>') +
task(2, "Choose the best material for each job. Use the words in the box.", '<div class="wbox">thin paper · glass · thick cloth</div>' + f'<table class="tf who">{rows12b}</table>') +
badge_row("#2F80C9", "Material Detective", "All correct?", "Colour your badge on page 1!")))

# 13 book challenge -> badge 3
pages.append(page(13, "Book Challenge", bubble(f"These are the {K('big questions')} you will meet at school. Answer in {K('full sentences')} to win your third badge!") +
task(2, "How do we see a source of light?", lines(1)) +
task(3, "How do we see non-sources of light?", lines(3)) +
task(3, "What is the difference between transparent, translucent and opaque materials? Give an example of each.", lines(3)) +
badge_row("#E8962E", "Light Professor", "", "Finished? Colour your last badge on page 1!")))

# 14 mixed + boss + next mission
pin = (candle_svg(40, 80) + '<path d="M150 18 V46 M150 58 V96 M150 18 H330 V96 H150" stroke="#8A5A2B" stroke-width="3" fill="#F4E6D6" fill-opacity=".35"/>' +
       '<path d="M322 22 V92" stroke="#6B7785" stroke-width="3"/>' + candle_svg(310, 30, flip=True) +
       label(160, 112, "pinhole camera", 12) + label(276, 112, "screen", 12))
sun14 = ('<svg viewBox="0 0 80 80" width="96" height="96"><g class="src tap" data-act="flash"><circle class="halo" cx="40" cy="40" r="30" fill="#FFE68A"/>'
         '<circle cx="40" cy="40" r="17" fill="#FFF" stroke="#E8962E" stroke-width="3"/><g stroke="#E8962E" stroke-width="3" stroke-linecap="round">'
         '<path d="M40 8v10M40 62v10M8 40h10M62 40h10M17 17l7 7M56 56l7 7M63 17l-7 7M24 56l-7 7"/></g></g></svg>')
pages.append(page(14, "Mixed challenge", bubble("Last page! Here is the boss question. Then get ready for your next mission.") +
task(2, "Glow wants to hide a present so nobody can see it. Should he use a glass box or a cardboard box? Why?", lines(1)) +
task(3, '<b class="go">Boss question!</b> In this pinhole camera, the picture of the candle on the screen is upside down. Use what you know about light to explain why.',
     f'<div class="center">{svg(340, 118, pin, 330)}</div>' + lines(2)) +
f'''<div class="next"><div class="nimg">{sun14}</div>
<div><b class="nm">Next mission:</b> Sunlight looks white. Is white light really just one colour? What do you think?<br>My guess: {blank(150)}</div></div>'''))

CSS_M3 = """
.sort { width: 100%; margin-top: 4px }
.sort th { font-family: 'Fredoka'; font-weight: 600; color: #3C3A8F; border: 1.4px solid #2E8B57; width: 33.3% }
.sort td { border: 1.4px solid #2E8B57; text-align: center }
.circ3 td { padding: 8px 4px; white-space: nowrap }
.circ3 .yt { width: auto }
.sort2 th { width: 50% }
.sort td { font-size: 14pt; height: 40px; padding: 2px }
.sort th { padding: 5px }
.wbox { margin: 6px 0 8px 32px; padding: 4px 12px }
.card { border: 1.6px dashed #2F80C9; border-radius: 12px; padding: 8px 16px; margin: 0 0 6px 32px; font-size: 14pt; background: #FAFCFF }
.cap { font-size: 12.5pt; color: #2D3338; margin: -2px 0 4px }
.m9 td { font-size: 13.5pt; padding: 6px 6px; height: 40px }
.m9 .yt9 { width: 26% } .m9 .r9 { width: 56% }
.circ3 .mini { padding: 0 10px }
"""

SHELL = (HERE / "light-p5-shell.html").read_text(encoding="utf-8")
html = (SHELL.replace("<!--TITLE-->", "Light Explorer · Mission 3").replace("<!--BUILD-->", "tools/build-light-p5-m3.py")
             .replace("<!--HEAD-->\n", "").replace("/*SHEET_CSS*/", CSS + CSS_M2 + CSS_M3 + CSS_ANIM)
             .replace("<!--PAGES-->", "\n".join(f'<div class="sheet">{p}<canvas class="ink"></canvas></div>' for p in pages)))
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print("wrote", OUT, len(pages), "pages")
