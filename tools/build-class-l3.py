#!/usr/bin/env python3
"""Lesson 3 (Flip the Bar) live-class content, read from the worksheet scripts in View's maths kit
(build_l3v3.py and the files it execs; they need sympy). Writes a JSON with questions AND answers:
keep it out of the repo and encrypt it with tools/build-class.mjs.

Usage: python3 tools/build-class-l3.py <kit>/worksheets/worksheet-src /tmp/l3.json
       node tools/build-class.mjs /tmp/l3.json <student code> <teacher password> public/class/l3/index.html l3

Modes per set (View's rules): number-line sets go Explore → Drag and guess (numbers + small ticks, then numbers only)
→ Answer (with a "Show the number line" button when the line fits); other sets are Answer; Warm-up, Check A and
Check are Check (question + working out + answer, no right/wrong)."""
import json
import math
import re
import sys
from fractions import Fraction as Fr
from pathlib import Path

src = Path(sys.argv[1]) / "build_l3v3.py"
code = src.read_text(encoding="utf-8").replace('build(False); build(True)\nprint("ok")', "")
K = {"__file__": str(src), "__name__": "class_l3"}
exec(compile(code, str(src), "exec"), K)

UF = {"½": Fr(1, 2), "⅓": Fr(1, 3), "⅔": Fr(2, 3), "¼": Fr(1, 4), "¾": Fr(3, 4), "⅕": Fr(1, 5), "⅖": Fr(2, 5),
      "⅗": Fr(3, 5), "⅘": Fr(4, 5), "⅙": Fr(1, 6), "⅚": Fr(5, 6), "⅛": Fr(1, 8)}
NUM = r"(?:\d+(?:\.\d+)?(?:/\d+)?[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛]?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛])"


def num(t):
    neg = t.startswith("−")
    t = t.lstrip("−")
    v = Fr(0)
    if t and t[-1] in UF:
        v += UF[t[-1]]
        t = t[:-1]
    if t:
        v += Fr(t)
    return -v if neg else v


def moves(q):
    """'−9 + 4 − (−7)' -> (start, [(op, b)], parts) or None if it is not a plain chain of + and −."""
    s = q.replace(" ", "")
    m = re.match(rf"^(−?{NUM})", s)
    if not m:
        return None
    a, rest, out, parts = num(m.group(1)), s[m.end():], [], [q.split(" ")[0]]
    while rest:
        m = re.match(rf"^([+−])(\((−{NUM})\)|{NUM})", rest)
        if not m:
            return None
        op, b = m.group(1), num(m.group(3) or m.group(2))
        out.append(("+" if op == "+" else "-", b))
        parts.append(f"{op} {m.group(2)}")
        rest = rest[m.end():]
    if not out or " ".join(parts).replace(" ", "") != s:
        return None
    return a, out, parts


def line(q, max_units=60):
    got = moves(q)
    if not got:
        return None, None
    a, ms, parts = got
    den = 1
    for v in [a] + [b for _, b in ms]:
        den = den * v.denominator // math.gcd(den, v.denominator)
    if den not in (1, 2, 3, 4, 6, 10, 12) or ("." in q and den not in (1, 10)):
        return None, None
    if "." in q:
        den = 10
    pos = [a]
    for op, b in ms:
        pos.append(pos[-1] + (b if op == "+" else -b))
    lo, hi = min(pos), max(pos)
    if den == 1:
        lo, hi = (-20, 20) if lo >= -20 and hi <= 20 else (-30, 30) if lo >= -30 and hi <= 30 else (math.floor(lo / 10) * 10 - 10, math.ceil(hi / 10) * 10 + 10)
    else:
        lo, hi = math.floor(lo) - 1, math.ceil(hi) + 1
    if hi - lo > max_units or (hi - lo) * den > 80:
        return None, None
    t = lambda v: int(v * den)
    return {"den": den, "a": t(a), "m": [[op, t(b)] for op, b in ms], "lo": lo * den, "hi": hi * den}, parts


def clean(a):
    """'−25 m' -> ('−25', 'm'); answers keep their letters."""
    m = re.match(r"^(.*?)\s*(°C|m)$", a)
    return (m.group(1), m.group(2)) if m else (a, None)


def item(code, q, a, mode, ln=True):
    ans, unit = clean(a)
    it = {"id": code, "q": q, "ans": ans, "mode": mode}
    if unit:
        it["unit"] = unit
    if re.search(r"[a-z]", ans):
        it["alg"] = True
    if ln:
        L, parts = line(q)
        if L:
            it["line"], it["parts"] = L, parts
        elif mode in ("explore", "guess"):
            it["mode"] = "answer"
    return it


def line_set(code, lined, hard, start_hard):
    """lined: [(question, answer)] that have a number line; hard: [(question, answer)]."""
    n = len(lined)
    modes = (["explore"] * 1 + ["guess"] * (n - 1)) if n <= 4 else (["explore"] * (n // 3) + ["guess"] * (n - n // 3))
    if n >= 8:
        modes = ["explore"] * 4 + ["guess"] * (n - 4)
    out, guesses = [], [i for i, m in enumerate(modes) if m == "guess"]
    half = len(guesses) // 2
    for i, (q, a) in enumerate(lined):
        it = item(f"{code}.{i + 1}", q, a, modes[i])
        if modes[i] == "guess" and guesses.index(i) >= half and half:
            it["scale"] = False
        out.append(it)
    for i, (q, a) in enumerate(hard):
        out.append(item(f"{code}.{start_hard + i}", q, a, "answer"))
    return out


S = []
S.append({"id": "W", "name": "Warm-up", "items": [item(f"W.{i + 1}", q, a, "check", False) for i, (q, a) in enumerate(K["R"])]})
S.append({"id": "S1", "name": "The four patterns", "items": line_set(
    "S1", [(K["qtext"](a, op, b), ans) for a, op, b, ans in K["S1"]], [(K["qtext"](a, op, b), ans) for a, op, b, ans in K["S1H"]], 9)})
S.append({"id": "S2", "name": "Start anywhere", "items": line_set(
    "S2", [(K["qtext"](a, op, b), ans) for a, op, b, ans in K["S2"]], K["S2H"], 7)})
S.append({"id": "S3", "name": "Many moves", "items": line_set("S3", [(q, a) for q, _, a in K["S3"]], K["S3H"], 5)})
S.append({"id": "S4", "name": "Times and divide", "items": [item(f"S4.{i + 1}", q, a, "answer") for i, (q, _, a) in enumerate(K["S4"])]
          + [item(f"S4.{7 + i}", q, a, "answer") for i, (q, a) in enumerate(K["S4H"])]})
S.append({"id": "S5", "name": "Mixed (order of operations)", "items": [item(f"S5.{i + 1}", q, a, "answer") for i, (q, _, a) in enumerate(K["A3"])]
          + [item(f"S5.{7 + i}", q, a, "answer") for i, (q, a) in enumerate(K["HARD"]["A3"])]})
S.append({"id": "CA", "name": "Check A", "items": [item(f"K.{i + 1}", q, a, "check", False) for i, (q, a) in enumerate(K["CA"])]})
for code, name, data, hard in (("S6", "Decimals", K["S6"], K["S6H"]), ("S7", "Fractions", K["S7"], K["S7H"])):
    lined = [(q, a) for q, nl, a in data if nl]
    rest = [(q, a) for q, nl, a in data if not nl]
    its = line_set(code, lined, [], 0)
    its += [item(f"{code}.{len(lined) + 1 + i}", q, a, "answer") for i, (q, a) in enumerate(rest)]
    its += [item(f"{code}.{len(data) + 1 + i}", q, a, "answer") for i, (q, a) in enumerate(hard)]
    S.append({"id": code, "name": name, "items": its})
S.append({"id": "S8", "name": "Expand and simplify", "items": [item(f"S8.{i + 1}", q, a, "answer") for i, (q, a) in enumerate(K["B1"])]
          + [item(f"S8.{7 + i}", q, a, "answer") for i, (q, a) in enumerate(K["HARD"]["B1"])]})
S.append({"id": "S9", "name": "Put in a negative value", "items": [item(f"S9.{i + 1}", q, a, "answer") for i, (q, _, a) in enumerate(K["B2"])]
          + [item(f"S9.{5 + i}", q, a, "answer") for i, (q, a) in enumerate(K["HARD"]["B2"])]})
w = [item("S10.1", "The temperature is −8°C. It rises 15 degrees, then falls 11 degrees. What is the temperature now?", "−4 °C", "answer", False),
     item("S10.2", "A quiz gives +5 for a right answer and −4 for a wrong one. Mew gets 2 right and 3 wrong. What is Mew's score?", "−2", "answer", False)]
w[0]["line"], w[0]["parts"] = line("−8 + 15 − 11")
del w[0]["parts"]
w += [item(f"S10.{3 + i}", q, a, "answer", False) for i, (q, a) in enumerate(K["B3"])]
w += [item(f"S10.{7 + i}", q, a, "answer", False) for i, (q, a) in enumerate(K["HARD"]["B3"])]
S.append({"id": "S10", "name": "Word problems and challenge", "items": w})
S.append({"id": "X", "name": "Check", "items": [item(f"X.{i + 1}", q, a, "check", False) for i, (q, a) in enumerate(K["C"])]})

Path(sys.argv[2]).write_text(json.dumps({"title": "Lesson 3 · Flip the Bar", "sets": S}, ensure_ascii=False), encoding="utf-8")
print(f"{sum(len(s['items']) for s in S)} questions in {len(S)} sets → {sys.argv[2]}")
