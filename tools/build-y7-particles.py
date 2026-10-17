"""Builds public/y7-particles/index.html: Particles in Action (Year 7, 1:1 lesson) as web pages to write on.

Hidden: not linked from the site. Pages, drawings and graphs come from the worksheet builder
(build_particles.py), student edition only (no answers, no teacher tips). Shared parts and the tap
animations are in tools/y7kit.py; the page chrome is tools/light-p5-shell.html.
Run: python3 tools/build-y7-particles.py
"""
from y7kit import *

S = Deck("Particles in Action · Year 7 Science")
add = S.add
F = fill()
FS = fill(short=True)
# data
ICE = [(0, -20), (1, -10), (2, 0), (3, 0), (4, 0), (5, 0), (6, 25), (7, 50), (8, 75), (9, 100), (10, 100), (11, 100)]
DIFF = [(10, 300), (20, 230), (30, 170), (40, 200), (50, 90), (60, 60)]
good = [d for d in DIFF if d[0] != 40]
diff_fn = quad_fit([a for a, _ in good], [b for _, b in good])
PRESS = [(0, 100), (20, 107), (40, 114), (60, 122), (80, 129)]
press_fn = lin_fit([a for a, _ in PRESS], [b for _, b in PRESS])

def table(data, h1, h2):
    return (f'<table class="data"><tr><th style="text-align:left">{h1}</th>' + "".join(f"<td>{a}</td>" for a, _ in data) +
            f'</tr><tr><th style="text-align:left">{h2}</th>' + "".join(f"<td>{str(b).replace('-', '−')}</td>" for _, b in data) + '</tr></table>')

# ---------- PAGE 1 · cover + graph toolkit ----------
add(f'''<div class="hdr"><span>Year 7 Science · 1:1 Lesson</span><span>Name: <span class="fill"></span> &nbsp; Date: <span class="fill s"></span></span></div>
<h1 style="font-size:26px">Particles in Action</h1>
<p style="color:#52525B;margin-bottom:6px">Particles are always moving. Today: how we <b>know</b> they move (Brownian motion), how they <b>spread</b> (diffusion), how they <b>push</b> (gas pressure) — and how to read and draw the graphs that go with them.</p>
<h2><span class="tag">PART 0</span> Graph toolkit</h2>
<div class="learn"><div class="lt">LEARN · Line graph or bar chart?</div>
<div class="row" style="align-items:flex-start;flex-wrap:nowrap">
<div class="center" style="width:48%">{bar_vs_line(kind="line")}<div class="small"><b>Line graph</b> — both things are <b>numbers</b> that change smoothly (time, temperature)</div></div>
<div class="center" style="width:48%">{bar_vs_line(kind="bar")}<div class="small"><b>Bar chart</b> — one thing is a <b>name / group</b> (iron, wax, salt…)</div></div>
</div></div>
<div class="learn"><div class="lt">LEARN · 5 rules for a good graph</div>{rules_example()}</div>
<div class="learn"><div class="lt">LEARN · Describing a pattern</div>
Say what happens <b>and</b> use numbers from the graph:<br>
<i>“As the <b>time</b> increases, the <b>temperature increases</b>. After 2 minutes it is 34 °C and after 10 minutes it is 86 °C.”</i></div>
<div class="tip" style="font-size:12px">Two kinds of exam question: <b>describe</b> = say <b>what</b> happens, with numbers · <b>explain</b> = say <b>why</b> it happens, using particles</div>
''')


# ---------- PAGE 2 · heating curve ----------
add(f'''
<h2><span class="tag">PART 0</span> Reading a heating curve</h2>
<div class="learn"><div class="lt">LEARN</div>
When ice is heated, its temperature goes <b>up</b>, then stays <b>flat</b> while it melts, goes up again, then stays flat while it boils.
On the flat parts the energy is used to <b>break the forces between particles</b>, not to make them move faster — so the temperature does not rise.</div>
<div class="graphbox"><div class="gt">GRAPH A · Heating ice</div>
<div class="row tight" style="align-items:center;flex-wrap:nowrap">
{line_graph(ICE, (0, 11, 1), (-20, 120, 20), "Time (min)", "Temperature (°C)", w=400, h=235, join=True,
            labels=[(1, -2, "A"), (3.5, 12, "B"), (7.4, 48, "C"), (10, 112, "D")])}
<div style="flex:1;font-size:11px"><table class="data"><tr><th>Time (min)</th><th>Temp (°C)</th></tr>{''.join(f'<tr><td>{a}</td><td>{str(t).replace(chr(45), chr(8722))}</td></tr>' for a, t in ICE)}</table></div>
</div></div>
{Q("0.1", "e", "Which section shows the ice <b>melting</b>?")}
{Q("0.2", "m", "What is the temperature while the ice melts? Why does the line stay flat?", marks=2, hint=f"The energy is used to {fill()} the forces between particles, so the temperature {fill()}.")}
''')

# ---------- PAGE 3 · heating curve questions ----------
add(f'''
<h2><span class="tag">PART 0</span> Heating curve — more questions</h2>
{Q("0.3", "m", "What state is the water in section <b>C</b>? What are its particles doing?", marks=2)}
<div class="q"><span class="n">0.4</span>{lvl("c")} <b>Spot the mistakes!</b> A student drew this graph of the same experiment (heating ice). Find <b>4</b> mistakes.
<div class="center" style="margin:8px 0">{bad_graph(w=380, h=240)}</div>
<div style="margin-left:24px">
<div style="display:flex;gap:6px"><b>1.</b><div style="flex:1">{lines(2)}</div></div>
<div style="display:flex;gap:6px"><b>2.</b><div style="flex:1">{lines(2)}</div></div>
<div style="display:flex;gap:6px"><b>3.</b><div style="flex:1">{lines(2)}</div></div>
<div style="display:flex;gap:6px"><b>4.</b><div style="flex:1">{lines(2)}</div></div>
</div></div>
''')

# ---------- PAGE 4 · Brownian learn ----------
add(f'''
<h2><span class="tag">PART 1</span> Brownian motion</h2>
<div class="learn"><div class="lt">LEARN</div>
In 1827 a scientist called <b>Robert Brown</b> looked at pollen grains in water under a microscope. They jiggled about in a <b>random zigzag</b> — but nothing was touching them!<br>
In class we see the same thing with <b>smoke</b> in a smoke cell.</div>
<div class="row" style="align-items:flex-end">{brownian_path()}{brownian_zoom()}</div>
<div class="grid2" style="margin-top:6px">
<div class="card"><h4>Why does it happen?</h4>Tiny <b>air particles</b> (too small to see) hit the smoke speck from <b>all sides</b>. The hits are <b>uneven</b> — more on one side — so the speck is <b>pushed</b> one way, then another.</div>
<div class="card"><h4>Why does it matter?</h4>It is <b>evidence</b> that particles really exist and are <b>always moving</b>. If the air is <b>warmer</b>, the particles move faster and the speck jiggles <b>more</b>.</div>
</div>
<div class="tip" style="font-size:12px">Key words for your answers: <b>hit / collide</b> · <b>uneven</b> · <b>random</b> · <b>evidence</b> &nbsp;·&nbsp; The smoke is not alive — it is being hit.</div>
{Q("1.1", "e", "Describe how the smoke speck moves.")}
{Q("1.2", "m", "Why does the smoke speck move?", marks=2, hint=f"The smoke speck is hit by {fill()} particles. There are more hits on {fill()} …")}
''')

# ---------- PAGE 5 · Brownian questions ----------
add(f'''
<h2><span class="tag">PART 1</span> Brownian motion — questions</h2>
{Q("1.3", "e", "Why can't we see the air particles?")}
{Q("1.4", "m", "What would you see if the air was <b>warmer</b>? Explain why.", marks=2)}
{Q("1.5", "m", "True or false? <i>“The smoke speck moves because it is alive.”</i> If false, write a correct sentence.")}
{Q("1.6", "c", "An air particle is about <b>0.3 nm</b> across. A smoke speck is about <b>3,000 nm</b>. How many times bigger is the smoke speck? Show your working.", k=4)}
''')

# ---------- PAGE 6 · Diffusion learn ----------
add(f'''
<h2><span class="tag">PART 2</span> Diffusion</h2>
<div class="learn"><div class="lt">LEARN</div>
<b>Diffusion</b> = particles spreading out from where there are <b>lots</b> of them (<b>high concentration</b>) to where there are <b>few</b> (<b>low concentration</b>) — all by themselves, with no stirring. It happens because particles move <b>randomly</b> all the time.</div>
<div class="row">
{diffusion_box(0, label="start", sub="perfume sprayed in a corner", act="diffuse")}
{diffusion_box(1, label="after 1 minute", act="diffuse")}
{diffusion_box(2, label="after 5 minutes", sub="spread out evenly", act="diffuse")}
</div>
<table style="font-size:12px">
<tr><th>State</th><th>Speed of diffusion</th><th>Why</th></tr>
<tr><td><b>Gas</b></td><td>fast</td><td>particles far apart and moving quickly — few things in the way</td></tr>
<tr><td><b>Liquid</b></td><td>slower</td><td>particles touching, so they keep bumping into each other</td></tr>
<tr><td><b>Solid</b></td><td>almost none</td><td>particles stuck in fixed positions, only vibrating</td></tr>
</table>
<div class="grid2">
<div class="card"><h4>Hotter = faster</h4>Heat gives particles more energy, so they move faster and spread out sooner.</div>
<div class="card"><h4>Real life</h4>hairspray backstage after a dance show · food smell from the kitchen · a tea bag colouring water</div>
</div>
<div class="warn" style="font-size:12px"><b>Exam trap:</b> when everything is evenly mixed, the particles <b>do not stop</b>. They keep moving — we just can't see any change.</div>
<h3>Try it</h3>
<div class="q"><span class="n">2.1</span>{lvl("e")} Ink is dropped into water. Put the boxes in order (first → last).
<div class="row tight" style="margin-left:24px">
{diffusion_box(2, w=118, h=90, label="P", col="blue", seed=9, n=12)}
{diffusion_box(0, w=118, h=90, label="Q", col="blue", seed=9, n=12)}
{diffusion_box(1, w=118, h=90, label="R", col="blue", seed=9, n=12)}</div>
<div style="margin:10px 0 0 24px;font-weight:700">{fill(True)} → {fill(True)} → {fill(True)}</div></div>
''')

# ---------- PAGE 7 · Diffusion questions ----------
add(f'''
<h2><span class="tag">PART 2</span> Diffusion — questions</h2>
<div class="q"><span class="n">2.2</span>{lvl("e")} Fill in the gaps.<div style="margin:10px 0 0 24px;line-height:2.4">Diffusion is when particles move from a {fill()} concentration to a {fill()} concentration.</div></div>
{Q("2.3", "m", "Why is diffusion faster in a gas than in a liquid?", marks=2)}
{Q("2.4", "m", "One tea bag goes into hot water, another into cold water. Which colours the water faster? Explain using particles.", k=4, marks=2)}
''')

# ---------- PAGE 8 · Diffusion graph ----------
add(f'''
<h2><span class="tag">PART 2</span> Diffusion &amp; temperature — the graph</h2>
<div class="learn"><div class="lt">THE EXPERIMENT</div>
A drop of food colouring was put into beakers of water at different temperatures. The time for the colour to spread evenly was measured.
Same volume of water and same size drop each time.</div>
<div class="graphbox"><div class="gt">GRAPH B · Time for colour to spread</div>
{table(DIFF, "Temperature (°C)", "Time (s)")}
<div class="center">{line_graph(DIFF, (0, 70, 10), (0, 350, 50), "Temperature (°C)", "Time to spread (s)", w=470, h=270, fit="poly", fit_fn=diff_fn)}</div></div>
{Q("2.5", "e", "How long did the colour take to spread at 30 °C?")}
{Q("2.6", "m", "Which result is <b>anomalous</b> (does not fit the pattern)? Suggest one reason it happened.", marks=2)}
''')

# ---------- PAGE 9 · Diffusion graph questions ----------
add(f'''
<h2><span class="tag">PART 2</span> The graph — describe &amp; explain</h2>
{Q("2.7", "m", "<b>Describe</b> the pattern in Graph B. Use numbers from the graph.", k=4, marks=2, hint=f"As the temperature increases, the time {fill()}. At 10 °C it took {fill(True)} s but at 60 °C it took {fill(True)} s.")}
{Q("2.8", "m", "<b>Explain</b> the pattern using particles.", k=4, marks=2)}
{Q("2.9", "c", "Predict the time at 70 °C. How did you work it out?", k=3)}
{Q("2.10", "c", "What did the scientist <b>change</b>? What did they <b>measure</b>? Name one thing they kept the <b>same</b>.", k=0, marks=3)}
<div style="margin-left:24px;line-height:2.6">Changed: {fill()}{F}<br>Measured: {fill()}{F}<br>Kept the same: {fill()}{F}</div>
''')

# ---------- PAGE 10 · Air pressure learn ----------
add(f'''
<h2><span class="tag">PART 3</span> Gas pressure &amp; air pressure</h2>
<div class="learn"><div class="lt">LEARN</div>
Gas particles zoom around and <b>hit the walls</b> of their container. Each hit is a tiny push. All the pushes together make <b>gas pressure</b>.<br>
The air around us is made of particles too — they push on us all the time. This is <b>air pressure</b>.</div>
<div class="row">{pressure_box(9, label="gas in a box", sub="★ = particle hits the wall")}</div>
<h3>3 ways to increase the pressure</h3>
<div class="grid3" style="font-size:11.5px">
<div class="card center"><h4>More particles</h4><div class="row tight" style="justify-content:center">{pressure_box(4, w=72, h=70, seed=3, stars=False, r=5, minsep=16)}{pressure_box(11, w=72, h=70, seed=4, stars=False, r=5, minsep=12)}</div>pump up a tyre → more hits</div>
<div class="card center"><h4>Hotter</h4><div class="row tight" style="justify-content:center">{pressure_box(6, w=72, h=70, seed=5, stars=False, r=5, minsep=16)}{pressure_box(6, w=72, h=70, seed=5, fast=True, stars=False, r=5, minsep=16)}</div>orange = moving faster → hit harder &amp; more often</div>
<div class="card center"><h4>Smaller space</h4><div class="row tight" style="justify-content:center">{pressure_box(6, w=80, h=70, seed=6, stars=False, r=5, minsep=15)}{pressure_box(6, w=46, h=70, seed=7, stars=False, r=5, minsep=12)}</div>squash it → hit walls more often</div>
</div>
<div class="note" style="font-size:12px"><b>Pressure difference:</b> if the pressure inside and outside are not the same, things get <b>crushed</b> or <b>puffed up</b>.</div>
<div class="row" style="align-items:flex-end">
{bottle(False, label="closed, up high", act="crush")}<div style="font-size:26px;align-self:center">→</div>{bottle(True, label="after landing")}
<div style="max-width:300px;font-size:12px;align-self:center">Up high the air pressure outside is <b>low</b>. When the plane lands, the outside air pressure is <b>higher</b> than inside the bottle, so the air outside pushes the bottle in.</div></div>
<h3>Try it</h3>
<div class="q"><span class="n">3.1</span>{lvl("e")} Which box has the <b>highest</b> pressure? Why?
<div class="row tight" style="margin-left:24px">
{pressure_box(5, w=118, h=86, seed=11, label="A", stars=False, r=5, minsep=18, act=None)}{pressure_box(12, w=118, h=86, seed=12, label="B", stars=False, r=5, minsep=16, act=None)}{pressure_box(12, w=74, h=86, seed=13, label="C", stars=False, r=5, minsep=13, act=None)}</div>{lines(2)}</div>
''')

# ---------- PAGE 11 · Air pressure questions ----------
add(f'''
<h2><span class="tag">PART 3</span> Pressure — questions</h2>
{Q("3.2", "m", "A balloon is put in the fridge and gets smaller. Explain why.", k=4, marks=2, hint=f"In the cold, the particles move {fill()}, so they hit the inside of the balloon {fill()} …")}
{Q("3.3", "m", "Why does a closed water bottle get crushed when a plane lands?", k=4, marks=2)}
{Q("3.4", "c", "Spray cans say <b>“Do not heat”</b>. Use particles to explain why.", k=5, marks=3)}
''')

# ---------- PAGE 12 · Pressure graph ----------
add(f'''
<h2><span class="tag">PART 3</span> Pressure — the graph</h2>
<div class="graphbox"><div class="gt">GRAPH C · Heating a sealed bottle of air</div>
<div class="row tight" style="align-items:flex-start">
{line_graph(PRESS, (0, 100, 20), (90, 140, 10), "Temperature (°C)", "Pressure (kPa)", w=400, h=250, fit="line", fit_to=80)}
<div style="flex:1;font-size:11.5px;padding-top:6px">{table(PRESS, "°C", "kPa")}
<div class="small"><b>kPa</b> (kilopascal) is a unit of pressure. Normal air pressure is about 100 kPa.</div></div></div></div>
{Q("3.5", "m", "<b>Describe</b> the pattern. Use numbers.", k=4, marks=2)}
{Q("3.6", "m", "<b>Explain</b> the pattern using particles.", k=4, marks=2)}
{Q("3.7", "c", "Predict the pressure at 100 °C. How did you work it out?", k=3)}
''')

# ---------- PAGE 13 · Homework ----------
add(f'''
<h2><span class="tag">HOME</span> Draw it yourself</h2>
<div class="hw"><b>Homework:</b> plot <b>Graph B</b> (diffusion) on this grid or on graph paper. Then check your graph against the checklist.</div>
{table(DIFF, "Temperature (°C)", "Time to spread (s)")}
<div class="gridpaper" style="height:400px"></div>
<h3>My checklist</h3>
<ul style="font-size:12.5px;padding-left:20px;line-height:1.7">
<li>Temperature on the <b>x-axis</b> (what we changed), time on the <b>y-axis</b> (what we measured)</li>
<li>Both axes have a <b>label and a unit</b> — (°C) and (s)</li>
<li>The scale goes up in <b>equal steps</b> and the graph uses more than half the grid</li>
<li>Points are small <b>×</b> marks in pencil</li>
<li>One <b>smooth curve of best fit</b> — not dot-to-dot</li>
<li>I <b>circled</b> the anomalous point and did not join my line to it</li>
</ul>
''')

# ---------- PAGE 14 · Key words ----------
add(f'''
<h2><span class="tag">REVIEW</span> My key words</h2>
<p>Write what each word means in your own words.</p>
<table style="font-size:12.5px">
<tr><th style="width:28%">Word</th><th>What it means</th></tr>
<tr><td>Brownian motion</td>{cell("height:90px")}</tr>
<tr><td>diffusion</td>{cell("height:90px")}</tr>
<tr><td>concentration</td>{cell("height:90px")}</tr>
<tr><td>gas pressure</td>{cell("height:90px")}</tr>
<tr><td>air pressure</td>{cell("height:90px")}</tr>
<tr><td>anomalous result</td>{cell("height:90px")}</tr>
</table>
''')

S.write("y7-particles", "Particles in Action", "tools/build-y7-particles.py")
