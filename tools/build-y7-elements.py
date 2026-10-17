"""Builds public/y7-elements/index.html: Elements in Our World (Year 7, 1:1 lesson) as web pages to write on.

Hidden: not linked from the site. Pages, drawings and graphs come from the worksheet builder
(build_elements.py), student edition only (no answers, no teacher tips). Shared parts and the tap
animations are in tools/y7kit.py; the page chrome is tools/light-p5-shell.html.
Run: python3 tools/build-y7-elements.py
"""
from y7kit import *

S = Deck("Elements in Our World · Year 7 Science")
add = S.add
F = fill()
FS = fill(short=True)

MET, NON = "#93C5FD", "#FCD34D"
CRUST = [("O", 46), ("Si", 28), ("Al", 8), ("Fe", 5), ("Ca", 4), ("Na", 3), ("K", 3), ("Mg", 2)]
CRUST_COL = [NON, NON, MET, MET, MET, MET, MET, MET]
AIR = [("nitrogen", 78, "#3B82F6"), ("oxygen", 21, "#E5484D"), ("argon", 0.9, "#A1A1AA"), ("carbon dioxide &amp; others", 0.1, "#3F3F46")]
MP = [("Fe", 1538), ("Cu", 1085), ("Al", 660), ("Mg", 650), ("Na", 98), ("S", 115), ("I", 114), ("P", 44)]
MP_COL = [MET] * 5 + [NON] * 3
MG = [(0.12, 0.20), (0.24, 0.40), (0.36, 0.60), (0.48, 0.70), (0.60, 1.00)]
BODY = [("O", 65), ("C", 18), ("H", 10), ("N", 3), ("Ca", 1.5), ("P", 1)]
BODY_COL = [NON, NON, NON, NON, MET, NON]


def legend_mn():
    return (f'<div class="small" style="margin-top:2px"><span style="display:inline-block;width:12px;height:12px;background:{MET};border:1px solid #1E3A8A;vertical-align:-2px"></span> metal &nbsp;&nbsp;'
            f'<span style="display:inline-block;width:12px;height:12px;background:{NON};border:1px solid #1E3A8A;vertical-align:-2px"></span> non-metal</div>')


def legend_pt():
    sw = lambda c: f'<span style="display:inline-block;width:12px;height:12px;background:{c};border:1px solid #71717A;vertical-align:-2px"></span>'
    return f'<div class="small" style="margin-top:2px">{sw("#DBEAFE")} metal &nbsp;&nbsp;{sw("#FEF3C7")} non-metal</div>'


def two_row(data, h1, h2):
    return (f'<table class="data"><tr><th style="text-align:left">{h1}</th>' + "".join(f"<td>{a}</td>" for a, _ in data) +
            f'</tr><tr><th style="text-align:left">{h2}</th>' + "".join(f"<td>{b:g}</td>" for _, b in data) + '</tr></table>')


def pt20(cw=72, ch=58):
    """First 20 elements with group and period labels and the metal / non-metal staircase."""
    L, Tp = 64, 24
    w = L + cw * 8 + 6; h = Tp + ch * 4 + 6
    s = f'<svg viewBox="0 0 {w} {h}" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="Inter,Arial">'
    for i, g in enumerate(["1", "2", "3", "4", "5", "6", "7", "0"]):
        s += f'<text x="{L + i*cw + cw/2 - 1.5}" y="16" font-size="11" font-weight="700" text-anchor="middle" fill="#1E40AF">Group {g}</text>'
    for j in range(4):
        s += f'<text x="{L-8}" y="{Tp + j*ch + ch/2 + 4}" font-size="11" font-weight="700" text-anchor="end" fill="#1E40AF">Period {j+1}</text>'
    for j, row in enumerate(PT):
        for i, c in enumerate(row):
            if not c:
                continue
            n, sym, name = c
            fillc = "#DBEAFE" if sym in METALS else "#FEF3C7"
            x = L + i * cw; y = Tp + j * ch
            s += f'<g class="cellb tap" data-act="pop"><rect x="{x}" y="{y}" width="{cw-3}" height="{ch-3}" rx="5" fill="{fillc}" stroke="#71717A"/>'
            s += f'<text x="{x+5}" y="{y+12}" font-size="9.5" fill="#52525B">{n}</text>'
            s += f'<text x="{x+cw/2-1.5}" y="{y+33}" font-size="19" font-weight="700" text-anchor="middle" fill="#18181B">{sym}</text>'
            s += f'<text x="{x+cw/2-1.5}" y="{y+48}" font-size="8.8" text-anchor="middle" fill="#3F3F46">{name}</text></g>'
    x2, x3 = L + 2 * cw - 1.5, L + 3 * cw - 1.5
    y2, y3, y4 = Tp + ch - 1.5, Tp + 2 * ch - 1.5, Tp + 3 * ch - 1.5
    s += f'<path d="M{x2},{y2} L{x2},{y3} L{x3},{y3} L{x3},{y4}" fill="none" stroke="#DC2626" stroke-width="4" stroke-linecap="round"/>'
    s += '</svg>'
    return s


def pt_outline(cell=15):
    """Tiny outline of the full periodic table (main block) showing where metals and non-metals are."""
    rows = {1: [1, 18], 2: [1, 2] + list(range(13, 19)), 3: [1, 2] + list(range(13, 19))}
    for p in range(4, 8):
        rows[p] = list(range(1, 19))
    nonm = {(1, 1), (1, 18)} | {(2, c) for c in range(13, 19)} | {(3, c) for c in range(14, 19)} | \
           {(4, c) for c in range(16, 19)} | {(5, 17), (5, 18), (6, 18)}
    first20 = {(1, 1), (1, 18), (4, 1), (4, 2)} | {(2, c) for c in rows[2]} | {(3, c) for c in rows[3]}
    w = cell * 18 + 4; h = cell * 7 + 4
    s = f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg">'
    for p, cols in rows.items():
        for c in cols:
            f = "#FEF3C7" if (p, c) in nonm else "#DBEAFE"
            sw = "1.6" if (p, c) in first20 else "0.6"
            st = "#1E3A8A" if (p, c) in first20 else "#A1A1AA"
            s += f'<rect x="{2+(c-1)*cell}" y="{2+(p-1)*cell}" width="{cell-1.5}" height="{cell-1.5}" rx="2" fill="{f}" stroke="{st}" stroke-width="{sw}"/>'
    return s + '</svg>'


def formula(f):
    return f.replace("2", "<sub>2</sub>").replace("3", "<sub>3</sub>").replace("4", "<sub>4</sub>")


# ============ PAGE 1 · cover + atoms & elements ============
add(f'''<div class="hdr"><span>Year 7 Science · 1:1 Lesson</span><span>Name: <span class="fill"></span> &nbsp; Date: <span class="fill s"></span></span></div>
<h1 style="font-size:26px">Elements in Our World</h1>
<p style="color:#52525B;margin-bottom:6px">What is everything made of? Today: atoms, elements, molecules, compounds and mixtures, how the periodic table works,
where elements are found, what air is made of, metals and non-metals, and chemical reactions. There is a graph in most parts.</p>
<h2><span class="tag">PART 1</span> Atoms and elements</h2>
<div class="learn"><div class="lt">LEARN</div>
Everything around you is made of tiny particles called <b>atoms</b>. An atom is far too small to see, even with a microscope.<br>
An <b>element</b> is a substance made of <b>only one type of atom</b>. It cannot be broken down into anything simpler.
There are about <b>118</b> elements. Everything in the universe is made from them.</div>
<div class="row" style="align-items:flex-start;flex-wrap:nowrap;justify-content:space-around">
{gas_box(["A_purple"]*7, 5, w=150, h=115, minsep=34, label="helium", sub="atoms on their own")}
{gas_box(["O2"]*6, 8, w=150, h=115, minsep=36, label="oxygen", sub="atoms joined in pairs")}
{solid_box(lambda i, j: "grey", w=150, h=115, r=9, label="iron", sub="atoms packed together")}
</div>
<div class="small center" style="margin:-2px 0 6px">All three are <b>elements</b>: each box has only <b>one type</b> of atom (one colour).</div>
<div class="learn"><div class="lt">LEARN · Chemical symbols</div>
Every element has a <b>symbol</b> of one or two letters. The <b>first letter is always a capital</b>. A second letter is always <b>small</b>.<br>
<span style="display:inline-block;margin-top:4px">O = oxygen &nbsp;·&nbsp; C = carbon &nbsp;·&nbsp; Cl = chlorine &nbsp;·&nbsp; Ca = calcium &nbsp;·&nbsp; Mg = magnesium</span><br>
Some symbols come from old <b>Latin</b> names:</div>
<table style="font-size:12px">
<tr><th>Element</th><th>Symbol</th><th>Latin name</th><th>Element</th><th>Symbol</th><th>Latin name</th></tr>
<tr><td>sodium</td><td><b>Na</b></td><td>natrium</td><td>copper</td><td><b>Cu</b></td><td>cuprum</td></tr>
<tr><td>iron</td><td><b>Fe</b></td><td>ferrum</td><td>gold</td><td><b>Au</b></td><td>aurum</td></tr>
<tr><td>potassium</td><td><b>K</b></td><td>kalium</td><td>silver</td><td><b>Ag</b></td><td>argentum</td></tr>
</table>
<div class="warn" style="font-size:12px"><b>Capitals matter!</b> <b>Co</b> is cobalt, an element. <b>CO</b> is carbon monoxide, a compound of carbon and oxygen.</div>
''')

# ============ PAGE 2 · molecules, compounds, mixtures ============
add(f'''
<h2><span class="tag">PART 1</span> Molecules, compounds and mixtures</h2>
<div class="grid3" style="font-size:12px">
<div class="card"><h4>Molecule</h4>Two or more atoms <b>chemically joined</b> (bonded) together. The atoms can be the <b>same</b> (O<sub>2</sub>) or <b>different</b> (H<sub>2</sub>O).</div>
<div class="card"><h4>Compound</h4>Two or more <b>different</b> elements <b>chemically joined</b>. It has new properties and is <b>hard to separate</b>.</div>
<div class="card"><h4>Mixture</h4>Two or more substances <b>mixed but not joined</b>. Each keeps its own properties. It is usually <b>easy to separate</b>.</div>
</div>
<div class="row" style="align-items:flex-start;flex-wrap:nowrap;justify-content:space-between;margin-top:6px">
{gas_box(["A_purple"]*6, 5, w=140, h=110, minsep=34, label="element", sub="atoms")}
{gas_box(["N2"]*5, 21, w=140, h=110, minsep=38, label="element", sub="molecules")}
{gas_box(["H2O"]*5, 13, w=140, h=110, minsep=38, label="compound", sub="molecules")}
{gas_box(["N2"]*3 + ["A_purple"]*3, 31, w=140, h=110, minsep=34, label="mixture", sub="not joined")}
</div>
<div class="learn"><div class="lt">LEARN · Reading a formula</div>
A <b>formula</b> tells you which atoms are in a molecule and how many. The small number counts the atom <b>just before it</b>. No number means one.
<table class="data" style="margin-top:6px;font-size:12px">
<tr><th>Formula</th><th>Atoms in one molecule</th><th>Total atoms</th><th>Element or compound?</th></tr>
<tr><td><b>H<sub>2</sub>O</b> (water)</td><td>2 hydrogen + 1 oxygen</td><td>3</td><td>compound</td></tr>
<tr><td><b>CO<sub>2</sub></b> (carbon dioxide)</td><td>1 carbon + 2 oxygen</td><td>3</td><td>compound</td></tr>
<tr><td><b>O<sub>2</sub></b> (oxygen gas)</td><td>2 oxygen</td><td>2</td><td><b>element</b></td></tr>
</table></div>
<div class="warn" style="font-size:12px"><b>Exam trap:</b> O<sub>2</sub> is a molecule, but it is <b>not</b> a compound. Count the <b>types</b> of atom, not the number of atoms.
One type = element. Two or more types joined = compound.</div>
<div class="grid2" style="font-size:12px">
<div class="card"><h4>Compound: new properties</h4><b>Sodium</b> is a soft metal that fizzes in water. <b>Chlorine</b> is a poisonous green gas. Joined together they make <b>sodium chloride</b>, the salt on your food.</div>
<div class="card"><h4>Mixture: easy to separate</h4>Iron filings mixed with sulfur powder: a <b>magnet</b> pulls the iron out. After heating they react to make <b>iron sulfide</b>, a compound, and the magnet no longer works.</div>
</div>
''')

# ============ PAGE 3 · Part 1 questions ============
SYM = ["oxygen", "C", "sodium", "Fe", "chlorine", "Ca"]   # name to give a symbol, or symbol to give a name
sym_rows = "".join(f'<tr><td>{v}</td>{cell()}</tr>' if k % 2 == 0 else f'<tr>{cell()}<td><b>{v}</b></td></tr>'
                   for k, v in enumerate(SYM))
QB = [("A", gas_box(["H2O"]*5, 44, w=128, h=100, minsep=38)),
      ("B", gas_box(["A_yellow"]*7, 45, w=128, h=100, minsep=30)),
      ("C", gas_box(["O2"]*3 + ["CO2"]*3, 46, w=128, h=100, minsep=38)),
      ("D", gas_box(["G2"]*5, 47, w=128, h=100, minsep=36))]
add(f'''
<h2><span class="tag">PART 1</span> Atoms and elements — questions</h2>
<div class="q"><span class="n">1.1</span>{lvl("e")} Complete the table. Write the symbol or the name.
<table style="margin:8px 0 0 24px;width:60%;font-size:12.5px">
<tr><th>Element</th><th>Symbol</th></tr>{sym_rows}</table></div>
<div class="q"><span class="n">1.2</span>{lvl("e")} Each symbol is written wrongly. Write it correctly.
<div style="margin:10px 0 0 24px;line-height:2.6">MG {fill(True)} &nbsp;&nbsp; cl {fill(True)} &nbsp;&nbsp; CU {fill(True)} &nbsp;&nbsp; nA {fill(True)}</div></div>
<div class="q"><span class="n">1.3</span>{lvl("m")} Is each box an <b>element</b>, a <b>compound</b> or a <b>mixture</b>?
<table style="margin:8px 0 0 24px;width:calc(100% - 24px);font-size:12.5px;table-layout:fixed">
<tr>{"".join(f'<th>{l}</th>' for l, _ in QB)}</tr>
<tr>{"".join(f'<td class="center" style="padding:4px">{b}</td>' for _, b in QB)}</tr>
<tr>{cell() * len(QB)}</tr>
</table></div>
{Q("1.4", "m", "Which <b>two</b> boxes in 1.3 contain molecules of an <b>element</b>? Explain how you know.", k=2)}
''')

# ============ PAGE 4 · Part 1 questions continued ============
FORM = ["O2", "CH4", "NH3", "N2", "CO2"]
form_rows = "".join(f'<tr><td><b>{formula(f)}</b></td>{cell() * 3}</tr>' for f in FORM)
add(f'''
<h2><span class="tag">PART 1</span> Formulas and compounds — questions</h2>
<div class="q"><span class="n">1.5</span>{lvl("m")} Complete the table.
<table style="margin:8px 0 0 24px;width:calc(100% - 24px);font-size:12.5px">
<tr><th style="width:14%">Formula</th><th>Atoms in one molecule</th><th style="width:15%">Total atoms</th><th style="width:22%">Element or compound?</th></tr>
{form_rows}</table></div>
{Q("1.6", "m", "Sam writes <b>CO</b> but means the element cobalt. What has Sam written instead? Explain the mistake.", marks=2)}
{Q("1.7", "c", "A magnet can pull iron out of a <b>mixture</b> of iron and sulfur, but not out of <b>iron sulfide</b>. Explain why.", k=4, marks=2)}
{Q("1.8", "c", "Water is made of hydrogen and oxygen, but water does not burn and is not a gas at room temperature. What does this tell you about compounds?", k=3)}
''')

# ============ PAGE 5 · periodic table learn ============
add(f'''
<h2><span class="tag">PART 2</span> The periodic table</h2>
<div class="learn"><div class="lt">LEARN</div>
The <b>periodic table</b> lists all the elements in order of their <b>atomic number</b> (the small number in each box).<br>
The rows going across are called <b>periods</b>. The columns going down are called <b>groups</b>.
Elements in the <b>same group</b> have <b>similar properties</b>: they react in a similar way.</div>
<div class="graphbox"><div class="gt">THE FIRST 20 ELEMENTS</div>
{pt20()}
<div class="row tight" style="align-items:center;flex-wrap:nowrap;margin-top:4px">
<div>{legend_pt()}<div class="small"><span style="display:inline-block;width:20px;height:4px;background:#DC2626;vertical-align:3px"></span> the staircase line between metals and non-metals</div></div>
</div></div>
<div class="row" style="align-items:center;flex-wrap:nowrap;gap:14px">
<div class="center">{pt_outline(cell=17)}<div class="small">the whole table: 118 elements<br>(the dark outlines are the 20 above)</div></div>
<div style="flex:1;font-size:12px"><ul style="margin:0;padding-left:18px">
<li><b>Metals</b> are on the <b>left</b> and in the middle. Most elements are metals.</li>
<li><b>Non-metals</b> are on the <b>right</b> of the staircase line. <b>Hydrogen</b> is a non-metal even though it sits on the left.</li>
<li><b>Group 1</b>: very reactive soft metals. They fizz in water.</li>
<li><b>Group 7</b>: reactive non-metals, such as chlorine.</li>
<li><b>Group 0</b>: very <b>unreactive</b> gases, such as helium, neon and argon.</li>
</ul></div></div>
''')

# ============ PAGE 6 · periodic table questions ============
PTQ = [6, 11, 17, 20, 2]   # atomic numbers
ptq_rows = "".join(f'<tr><td class="center"><b>{n}</b></td>{cell() * 5}</tr>' for n in PTQ)
add(f'''
<h2><span class="tag">PART 2</span> The periodic table — questions</h2>
<div class="q"><span class="n">2.1</span>{lvl("e")} Use the periodic table on the page before to complete the table.
<table style="margin:8px 0 0 24px;width:calc(100% - 24px);font-size:12.5px">
<tr><th>Atomic number</th><th>Symbol</th><th>Name</th><th>Group</th><th>Period</th><th>Metal or non-metal?</th></tr>
{ptq_rows}</table></div>
<div class="q"><span class="n">2.2</span>{lvl("e")} Fill in the gaps.
<div style="margin:10px 0 0 24px;line-height:2.6">The rows across the periodic table are called {fill()}. The columns are called {fill()}.<br>
Metals are on the {fill(True)} of the staircase line and non-metals are on the {fill(True)}.</div></div>
{Q("2.3", "m", "Sodium is in Group 1. It fizzes and moves around when it is put in water. Predict what <b>potassium</b> does in water, and explain your prediction.", marks=2)}
{Q("2.4", "c", "Element X is in <b>Group 2</b> and <b>Period 3</b>. Name element X. Is it a metal or a non-metal? How do you know?", k=3, marks=2)}
{Q("2.5", "c", "Balloons are filled with helium, and light bulbs are filled with argon. Use the periodic table to suggest why these gases are safe to use.", k=3)}
''')

# ============ PAGE 7 · Earth's elements ============
add(f'''
<h2><span class="tag">PART 3</span> Elements in the Earth</h2>
<div class="learn"><div class="lt">LEARN</div>
The Earth's <b>crust</b> (the rocky outer layer) is made mostly of just <b>eight</b> elements.
Most of these elements are not found on their own. They are joined to other elements in <b>compounds</b>. For example, sand is a compound of <b>silicon</b> and <b>oxygen</b>.</div>
<div class="graphbox"><div class="gt">GRAPH A · The 8 most common elements in the Earth's crust</div>
<div class="row tight" style="align-items:flex-start;flex-wrap:nowrap">
<div>{bar_chart(CRUST, "Percentage of the crust (%)", 50, 10, w=420, h=250, xlabel="Element", colors=CRUST_COL)}{legend_mn()}</div>
<div style="flex:1;font-size:11.5px"><table class="data"><tr><th>Symbol</th><th>Element</th><th>%</th></tr>
<tr><td>O</td><td>oxygen</td><td>46</td></tr><tr><td>Si</td><td>silicon</td><td>28</td></tr><tr><td>Al</td><td>aluminium</td><td>8</td></tr><tr><td>Fe</td><td>iron</td><td>5</td></tr>
<tr><td>Ca</td><td>calcium</td><td>4</td></tr><tr><td>Na</td><td>sodium</td><td>3</td></tr><tr><td>K</td><td>potassium</td><td>3</td></tr><tr><td>Mg</td><td>magnesium</td><td>2</td></tr></table></div>
</div></div>
<div class="tip" style="font-size:12px"><b>Why a bar chart?</b> The things along the bottom are <b>names</b> (elements), not numbers. Numbers that change smoothly, like time, need a line graph.</div>
{Q("3.1", "e", "Which element is the most common in the Earth's crust?")}
{Q("3.2", "e", "Which <b>metal</b> is the most common in the Earth's crust? What percentage is it?")}
''')

# ============ PAGE 8 · Earth's elements questions ============
add(f'''
<h2><span class="tag">PART 3</span> Elements in the Earth — questions</h2>
{Q("3.3", "m", "Oxygen and silicon together make up what percentage of the crust? Show your working.", k=3)}
{Q("3.4", "m", "Look at the colours. Are more of these 8 elements metals or non-metals? Which group makes up the bigger <b>percentage</b> of the crust?", k=4, marks=2)}
{Q("3.5", "c", "Most of the oxygen in the crust is not a gas. Explain where it is, using the word <b>compound</b>.", k=4, marks=2,
   hint=f"The oxygen atoms are chemically joined to {fill()} atoms, for example in {fill()}.")}
''')

# ============ PAGE 9 · Air learn ============
add(f'''
<h2><span class="tag">PART 4</span> The air we breathe</h2>
<div class="learn"><div class="lt">LEARN</div>
Air is a <b>mixture</b> of gases. The gases are mixed together but <b>not chemically joined</b>, so each gas keeps its own properties.
Some of the gases in air are <b>elements</b> and some are <b>compounds</b>.</div>
<div class="graphbox"><div class="gt">GRAPH B · What is air made of? (percentage by volume)</div>
<div class="center">{pie_chart(AIR, r=100, w=470, h=230)}</div></div>
<div class="row" style="align-items:flex-start;flex-wrap:nowrap">
<div class="center">{gas_box(["N2"]*8 + ["O2"]*2 + ["A_grey"] + ["CO2"], 41, w=230, h=150, minsep=34, label="A sample of air")}</div>
<table style="font-size:12px;max-width:330px">
<tr><th>Gas</th><th>Formula</th><th>In the picture</th></tr>
<tr><td>nitrogen</td><td>N<sub>2</sub></td><td>two blue atoms joined</td></tr>
<tr><td>oxygen</td><td>O<sub>2</sub></td><td>two red atoms joined</td></tr>
<tr><td>argon</td><td>Ar</td><td>one grey atom on its own</td></tr>
<tr><td>carbon dioxide</td><td>CO<sub>2</sub></td><td>one black + two red atoms joined</td></tr>
</table></div>
<div class="tip" style="font-size:12px"><b>Why a pie chart?</b> A pie chart shows how a <b>whole</b> (all of the air, 100%) is split into <b>parts</b>.</div>
''')

# ============ PAGE 10 · Air questions ============
AIRT = ["nitrogen (N<sub>2</sub>)", "oxygen (O<sub>2</sub>)", "argon (Ar)", "carbon dioxide (CO<sub>2</sub>)"]
add(f'''
<h2><span class="tag">PART 4</span> The air we breathe — questions</h2>
{Q("4.1", "e", "What percentage of the air is nitrogen? What percentage is oxygen?")}
{Q("4.2", "m", "Is air an element, a compound or a mixture? Explain how you know.", marks=2)}
<div class="q"><span class="n">4.3</span>{lvl("m")} Complete the table. Use the particle picture on the page before.
<table style="margin:8px 0 0 24px;width:calc(100% - 24px);font-size:12.5px">
<tr><th>Gas</th><th style="width:24%">Element or compound?</th><th>How do you know?</th></tr>
{"".join(f'<tr><td>{g}</td>{cell() * 2}</tr>' for g in AIRT)}
</table></div>
{Q("4.4", "c", "A student says: <i>“Oxygen gas is a compound because each particle has two atoms.”</i> Is the student right? Explain.", k=4, marks=2)}
''')

# ============ PAGE 11 · Metals vs non-metals learn ============
add(f'''
<h2><span class="tag">PART 5</span> Metals and non-metals</h2>
<div class="learn"><div class="lt">LEARN</div>
Most elements are <b>metals</b>. They are on the <b>left</b> of the periodic table. <b>Non-metals</b> are on the <b>right</b>.
We can sort elements by their <b>properties</b>: what they are like and how they behave.</div>
<table style="font-size:12.5px">
<tr><th style="width:28%">Property</th><th>Metals</th><th>Non-metals</th></tr>
<tr><td>Look</td><td>shiny</td><td>usually dull</td></tr>
<tr><td>Conduct electricity?</td><td>yes, good conductors</td><td>no, insulators</td></tr>
<tr><td>Conduct heat?</td><td>yes</td><td>no (poor)</td></tr>
<tr><td>Hit with a hammer</td><td>bend into shape (<b>malleable</b>)</td><td>solids break (<b>brittle</b>)</td></tr>
<tr><td>Sound when hit</td><td>ring (<b>sonorous</b>)</td><td>dull thud</td></tr>
<tr><td>Melting point</td><td>usually <b>high</b></td><td>usually <b>low</b></td></tr>
<tr><td>State at room temperature</td><td>solid (except mercury)</td><td>many are gases</td></tr>
<tr><td>Magnetic?</td><td>only iron, nickel and cobalt</td><td>no</td></tr>
</table>
<div class="warn" style="font-size:12px"><b>Two famous exceptions:</b> <b>mercury</b> is a metal but it is a <b>liquid</b> at room temperature. <b>Graphite</b> (a type of carbon) is a non-metal but it <b>conducts electricity</b>.</div>
<div class="note" style="font-size:12px"><b>Careful:</b> not all metals are magnetic. A magnet will not pick up aluminium or copper.</div>
''')

# ============ PAGE 12 · Melting point graph ============
add(f'''
<h2><span class="tag">PART 5</span> Melting points — the graph</h2>
<div class="graphbox"><div class="gt">GRAPH C · Melting points of some elements</div>
<div class="center">{bar_chart(MP, "Melting point (°C)", 1600, 200, w=500, h=270, xlabel="Element", colors=MP_COL)}{legend_mn()}</div>
{two_row(MP, "Element", "Melting point (°C)")}
<div class="small">Fe iron · Cu copper · Al aluminium · Mg magnesium · Na sodium · S sulfur · I iodine · P phosphorus</div></div>
{Q("5.1", "e", "Which element has the highest melting point?")}
{Q("5.2", "m", "<b>Describe</b> what the graph shows about the melting points of metals and non-metals. Use numbers.", k=4, marks=2)}
''')

# ============ PAGE 13 · Metals questions ============
MYS = [("A", "shiny, grey", "yes", "1455 °C", "magnetic"),
       ("B", "dull, yellow", "no", "115 °C", "breaks easily"),
       ("C", "shiny, silver", "yes", "−39 °C", "liquid at room temp."),
       ("D", "dull, black", "yes", "3600 °C", "breaks easily")]
add(f'''
<h2><span class="tag">PART 5</span> Metals and non-metals — questions</h2>
{Q("5.3", "m", "Which metal on Graph C does <b>not</b> fit the pattern? Explain why.", marks=2)}
<div class="q"><span class="n">5.4</span>{lvl("c")} <b>Mystery elements.</b> Decide if each element is a metal or a non-metal. Give a reason.
<table style="margin:8px 0 0 24px;width:calc(100% - 24px);font-size:12px">
<tr><th>Element</th><th>Look</th><th>Conducts electricity?</th><th>Melting point</th><th>Other</th><th style="width:30%">Metal or non-metal? Why?</th></tr>
{"".join(f'<tr><td><b>{e}</b></td><td>{a}</td><td>{b}</td><td>{c}</td><td>{d}</td>{cell("height:58px")}</tr>' for e, a, b, c, d in MYS)}
</table></div>
{Q("5.5", "c", "Electric wires are made of copper covered in plastic. Explain why each material is used.", k=4, marks=2)}
''')

# ============ PAGE 14 · Reactions learn ============
def mg_equation():
    grey_red = lambda i, j: "grey" if (i + j) % 2 == 0 else "red"
    # tap: the magnesium burns with a bright white light, then the product pops up
    return (f'<div class="row tap react" data-act="react" style="align-items:center;flex-wrap:nowrap">'
            f'{solid_box(lambda i, j: "grey", w=130, h=100, r=8, label="magnesium", sub="metal · element", act=None, attrs=' class="mg"')}'
            f'<div style="font-size:26px;font-weight:700">+</div>'
            f'{gas_box(["O2"]*5, 17, w=130, h=100, minsep=30, label="oxygen", sub="gas · element", act=None)}'
            f'<div style="font-size:26px;font-weight:700">→</div>'
            f'{solid_box(grey_red, w=130, h=100, r=8, label="magnesium oxide", sub="compound", act=None, attrs=' class="mgo"')}</div>')


add(f'''
<h2><span class="tag">PART 6</span> Chemical reactions</h2>
<div class="learn"><div class="lt">LEARN</div>
In a <b>chemical reaction</b>, atoms are rearranged and join in new ways to make a <b>new substance</b>.
In a <b>physical change</b> (like melting or dissolving) no new substance is made, and it is usually easy to reverse.</div>
<div class="grid2">
<div class="card"><h4>Signs of a chemical reaction</h4><ul style="margin:2px 0;padding-left:18px"><li>a new substance is made</li><li>colour change</li><li>fizzing (a gas is made)</li><li>heat or light is given out</li><li>hard to reverse</li></ul></div>
<div class="card"><h4>Word equations</h4>The substances we start with are the <b>reactants</b>. The new substances are the <b>products</b>.<br><br>
<b>reactants → products</b><br>magnesium + oxygen → magnesium oxide</div>
</div>
<h3>Burning magnesium</h3>
<p>Magnesium burns with a very bright white light. The magnesium atoms join with oxygen atoms from the air to make <b>magnesium oxide</b>, a white powder.</p>
{mg_equation()}
<div class="note" style="font-size:12px"><b>Naming tip:</b> a compound of a metal and oxygen ends in <b>-ide</b>: magnesium <b>oxide</b>, copper <b>oxide</b>, iron <b>oxide</b>.</div>
''')

# ============ PAGE 15 · Reactions questions ============
CHG = ["ice melting", "paper burning", "salt dissolving in water", "an egg cooking", "an iron nail rusting"]
add(f'''
<h2><span class="tag">PART 6</span> Chemical reactions — questions</h2>
<div class="q"><span class="n">6.1</span>{lvl("e")} Is each one a <b>physical</b> change or a <b>chemical</b> reaction? Write your answer in the table.
<table style="margin:8px 0 0 24px;width:calc(100% - 24px);font-size:12.5px">
<tr><th>Change</th><th style="width:40%">Physical or chemical?</th></tr>
{"".join(f'<tr><td>{c}</td>{cell()}</tr>' for c in CHG)}
</table></div>
{Q("6.2", "m", "Give <b>two</b> signs that show magnesium burning is a chemical reaction.", marks=2)}
<div class="q"><span class="n">6.3</span>{lvl("m")} Complete the word equations.
<div style="margin:10px 0 0 24px;line-height:2.6">
copper + oxygen → {fill()}<br>
iron + {fill()} → iron sulfide<br>
{fill()} + chlorine → sodium chloride</div></div>
{Q("6.4", "m", "In the reaction <i>magnesium + oxygen → magnesium oxide</i>, name the reactants and the product.", marks=2)}
''')

# ============ PAGE 16 · Magnesium graph ============
add(f'''
<h2><span class="tag">PART 6</span> Burning magnesium — the graph</h2>
<div class="learn"><div class="lt">THE EXPERIMENT</div>
Different masses of magnesium were burned in a crucible. The mass of magnesium oxide made each time was measured.</div>
<div class="graphbox"><div class="gt">GRAPH D · Mass of magnesium oxide made</div>
<table class="data"><tr><th style="text-align:left">Mass of magnesium (g)</th>{"".join(f"<td>{a:.2f}</td>" for a, _ in MG)}</tr>
<tr><th style="text-align:left">Mass of magnesium oxide (g)</th>{"".join(f"<td>{b:.2f}</td>" for _, b in MG)}</tr></table>
<div class="center">{line_graph(MG, (0, 0.7, 0.1), (0, 1.2, 0.2), "Mass of magnesium (g)", "Mass of magnesium oxide (g)", w=470, h=270, fit="line_origin")}</div></div>
{Q("6.5", "e", "What mass of magnesium oxide was made from 0.36 g of magnesium?")}
{Q("6.6", "m", "Which result is <b>anomalous</b>? Suggest one reason it happened.", marks=2)}
''')

# ============ PAGE 17 · Magnesium graph questions ============
add(f'''
<h2><span class="tag">PART 6</span> The graph — describe &amp; explain</h2>
{Q("6.7", "m", "<b>Describe</b> the pattern in Graph D. Use numbers.", k=4, marks=2,
   hint=f"As the mass of magnesium increases, the mass of magnesium oxide {fill()}. 0.12 g of magnesium made {fill(True)} g, and 0.60 g made {fill(True)} g.")}
{Q("6.8", "c", "The magnesium oxide is always <b>heavier</b> than the magnesium that was burned. Explain why.", k=4, marks=2)}
{Q("6.9", "c", "Predict the mass of magnesium oxide made from 0.30 g of magnesium. How did you work it out?", k=3)}
''')

# ============ PAGE 18 · Homework ============
add(f'''
<h2><span class="tag">HOME</span> Draw it yourself</h2>
<div class="hw"><b>Homework:</b> the table shows the most common elements in the <b>human body</b>. Draw a <b>bar chart</b> of the data on this grid. Then check your graph against the checklist.</div>
<table class="data"><tr><th style="text-align:left">Element</th><td>oxygen (O)</td><td>carbon (C)</td><td>hydrogen (H)</td><td>nitrogen (N)</td><td>calcium (Ca)</td><td>phosphorus (P)</td></tr>
<tr><th style="text-align:left">Percentage of body mass (%)</th>{"".join(f"<td>{b:g}</td>" for _, b in BODY)}</tr></table>
<div class="gridpaper" style="height:400px"></div>
<h3>My checklist</h3>
<ul style="font-size:12.5px;padding-left:20px;line-height:1.7">
<li>Elements along the <b>x-axis</b>, percentage up the <b>y-axis</b></li>
<li>The y-axis has a <b>label and a unit</b>: Percentage of body mass (%)</li>
<li>The y-axis goes up in <b>equal steps</b></li>
<li>All bars are the <b>same width</b> with <b>gaps</b> between them</li>
<li>Each bar is <b>labelled</b> with the element name</li>
<li>I coloured the metals and non-metals differently and added a key</li>
</ul>
''')

# ============ PAGE 19 · Key words ============
KW = ["atom", "element", "molecule", "compound", "mixture", "group / period", "chemical reaction", "physical change", "reactant / product"]
add(f'''
<h2><span class="tag">REVIEW</span> My key words</h2>
<p>Write what each word means in your own words.</p>
<table style="font-size:12.5px">
<tr><th style="width:28%">Word</th><th>What it means</th></tr>
{"".join(f'<tr><td>{w}</td>{cell("height:76px")}</tr>' for w in KW)}
</table>
''')

S.write("y7-elements", "Elements in Our World", "tools/build-y7-elements.py")
