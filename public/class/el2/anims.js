// Page animations for /class/el2/ (electricity session 2: series, parallel, bridge). Loaded by index.html when this file exists
// (tools/build-sheet-class.mjs sets CFG.anims). A play button on the learning page opens the animation full screen.
// Public file: shows physics only (no numbers on screen), never fills in the sheet's blanks or shows a problem's answer.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const C = { ink: '#1f2836', grey: '#8a94a6', line: '#d9dee8', blue: '#1f5fa8', red: '#d62828', orange: '#d9730d',
              green: '#2f7a4f', navy: '#2b3a55', yellow: '#f5c542', paper: '#fffdf8' };
  const W = 1000, H = 600;
  function svgRoot(el) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', `0 0 ${W} ${H}`);
    s.style.cssText = 'display:block;width:100%;height:auto;max-height:calc(100dvh - 90px);touch-action:none;font-family:var(--body,"Sarabun",sans-serif)';
    el.appendChild(s); return s;
  }
  function add(p, tag, a, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in a) e.setAttribute(k, a[k]);
    if (text != null) e.textContent = text;
    p.appendChild(e); return e;
  }
  function clear(g) { while (g.firstChild) g.firstChild.remove(); }
  function button(s, x, y, w, text, color, onTap) {
    const g = add(s, 'g', { style: 'cursor:pointer' });
    const r = add(g, 'rect', { x, y, width: w, height: 46, rx: 23, fill: '#fff', stroke: color, 'stroke-width': 2.5 });
    const t = add(g, 'text', { x: x + w / 2, y: y + 31, 'font-size': 21, 'font-weight': 700, fill: color, 'text-anchor': 'middle', 'pointer-events': 'none' }, text);
    g.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); onTap(); });
    return { g, set(on, txt) { r.setAttribute('fill', on ? color : '#fff'); t.setAttribute('fill', on ? '#fff' : color); if (txt != null) t.textContent = txt; } };
  }
  function pt(s, e) { const p = s.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(s.getScreenCTM().inverse()); }
  // drag up/down (or tap) on a target to change a level
  function levelDrag(el, s, get, set, min, max) {
    let id = null, y0 = 0, l0 = 0, moved = false;
    el.addEventListener('pointerdown', (e) => { id = e.pointerId; try { el.setPointerCapture(id); } catch (x) {} y0 = pt(s, e).y; l0 = get(); moved = false; e.preventDefault(); e.stopPropagation(); });
    el.addEventListener('pointermove', (e) => { if (e.pointerId !== id) return; const d = Math.round((y0 - pt(s, e).y) / 45); if (d) moved = true; set(Math.max(min, Math.min(max, l0 + d))); });
    const end = (e) => { if (e.pointerId !== id) return; id = null; if (!moved) set(get() >= max ? min : get() + 1); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', () => { id = null; });
  }
  function loop(step) {
    let on = true, last = performance.now();
    const f = (t) => { if (!on) return; step(Math.min(.05, (t - last) / 1000)); last = t; requestAnimationFrame(f); };
    requestAnimationFrame(f); return () => { on = false; };
  }
  const hint = (s, t) => add(s, 'text', { x: 24, y: 40, 'font-size': 22, 'font-weight': 700, fill: C.grey }, t);
  // zigzag between two points; teeth ~ size
  function zig(g, x1, y1, x2, y2, teeth, color, amp = 18) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    let d = `M${x1} ${y1}`;
    for (let i = 0; i < teeth; i++) { const u = (i + .5) / teeth * L, a = i % 2 ? amp : -amp; d += ` L${(x1 + ux * u + nx * a).toFixed(1)} ${(y1 + uy * u + ny * a).toFixed(1)}`; }
    d += ` L${x2} ${y2}`;
    return add(g, 'path', { d, fill: 'none', stroke: color || C.ink, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  }
  function battery(g, x, yTop, yBot) {           // vertical cell, + on top
    const m = (yTop + yBot) / 2;
    add(g, 'line', { x1: x, y1: yTop, x2: x, y2: m - 10, stroke: C.ink, 'stroke-width': 4 });
    add(g, 'line', { x1: x, y1: m + 10, x2: x, y2: yBot, stroke: C.ink, 'stroke-width': 4 });
    add(g, 'line', { x1: x - 34, y1: m - 10, x2: x + 34, y2: m - 10, stroke: C.ink, 'stroke-width': 4 });
    add(g, 'line', { x1: x - 18, y1: m + 10, x2: x + 18, y2: m + 10, stroke: C.ink, 'stroke-width': 10 });
    add(g, 'text', { x: x - 48, y: m - 4, 'font-size': 30, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle' }, '+');
  }
  // charges flowing along a polyline: equal spacing, speed set by current
  function flow(g, pts) {
    const segs = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const [a, b] = [pts[i - 1], pts[i]], l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, l, s: L }); L += l; }
    const n = Math.max(1, Math.round(L / 46)), sp = L / n, dots = [];
    for (let i = 0; i < n; i++) dots.push(add(g, 'circle', { r: 8, fill: C.yellow, stroke: '#8a5a00', 'stroke-width': 2 }));
    let ph = 0;
    function at(u) { for (const q of segs) if (u <= q.s + q.l) { const f = (u - q.s) / q.l; return [q.a[0] + (q.b[0] - q.a[0]) * f, q.a[1] + (q.b[1] - q.a[1]) * f]; } return pts[pts.length - 1]; }
    function place() { dots.forEach((d, i) => { const u = ((ph + i * sp) % L + L) % L, [x, y] = at(u); d.setAttribute('cx', x.toFixed(1)); d.setAttribute('cy', y.toFixed(1)); }); }
    place();
    return { step(v, dt) { ph += v * dt; place(); }, show(on) { dots.forEach((d) => d.setAttribute('opacity', on ? 1 : 0)); } };
  }
  const SPEED = 260;                              // px/s for the largest current in a scene
  const potCol = (f) => { f = Math.max(0, Math.min(1, f)); const a = [31, 95, 168], b = [214, 40, 40]; return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(',')})`; };

  // ---------- 2A: series ----------
  function series(el) {
    const s = svgRoot(el);
    hint(s, 'ลากขึ้น–ลง (หรือแตะ) ที่ตัวต้านทานเพื่อเปลี่ยนขนาด แล้วกด ▶');
    const X0 = 110, X1 = 860, T = 120, B = 330;
    const gW = add(s, 'g', {}), gR = add(s, 'g', {}), gD = add(s, 'g', {}), gG = add(s, 'g', {});
    const slots = [300, 500, 700];
    const lv = [2, 4, 2]; let three = false, short = false, run = false;
    const R = () => slots.map((_, i) => (i === 2 && !three) || (i === 1 && short) ? 0 : lv[i]);
    let flows = [];
    function draw() {
      clear(gW); clear(gR); clear(gD); clear(gG);
      battery(gW, X0, 190, 260);
      add(gW, 'path', { d: `M${X0} 220 V${T} H${X1} V${B} H${X0} V260`, fill: 'none', stroke: C.ink, 'stroke-width': 4 });
      slots.forEach((x, i) => {
        if (i === 2 && !three) return;
        const w = 50 + 25 * lv[i];
        add(gR, 'rect', { x: x - w / 2 - 4, y: T - 26, width: w + 8, height: 52, fill: C.paper });
        zig(gR, x - w / 2, T, x + w / 2, T, 2 * lv[i] + 2, i === 1 && short ? C.grey : C.ink);
        const hit = add(gR, 'rect', { x: x - 90, y: T - 60, width: 180, height: 120, fill: 'transparent', style: 'cursor:ns-resize' });
        levelDrag(hit, s, () => lv[i], (v) => { if (v !== lv[i]) { lv[i] = v; draw(); } }, 1, 4);
        add(gR, 'text', { x, y: T - 40, 'font-size': 22, 'font-weight': 700, 'text-anchor': 'middle', fill: C.navy }, `R${'₁₂₃'[i]}`);
      });
      if (short) add(gR, 'path', { d: `M${slots[1] - 130} ${T} V${T - 70} H${slots[1] + 130} V${T}`, fill: 'none', stroke: C.orange, 'stroke-width': 5 });
      // potential staircase along the top wire (no numbers)
      const r = R(), tot = r.reduce((a, b) => a + b, 0), GY = 575, GH = 105;
      add(gG, 'text', { x: X0 - 10, y: GY - GH - 12, 'font-size': 20, 'font-weight': 700, fill: C.grey }, 'ศักย์ไฟฟ้าตามสายด้านบน (ซ้าย → ขวา)');
      add(gG, 'line', { x1: X0, y1: GY, x2: X1, y2: GY, stroke: C.line, 'stroke-width': 2 });
      let v = 1, d = `M${X0} ${GY - GH}`;
      slots.forEach((x, i) => {
        const w = r[i] ? (50 + 25 * lv[i]) / 2 : 0;
        d += ` H${x - w}`; v -= r[i] / tot; d += ` L${x + w} ${GY - GH * v}`;
      });
      d += ` H${X1}`;
      add(gG, 'path', { d, fill: 'none', stroke: C.red, 'stroke-width': 5, 'stroke-linejoin': 'round' });
      // current bar
      const I = 1 / tot;
      add(gG, 'text', { x: 940, y: 140, 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', fill: C.grey }, 'กระแส');
      add(gG, 'rect', { x: 915, y: 160, width: 50, height: 190, fill: '#fff', stroke: C.line, 'stroke-width': 2 });
      add(gG, 'rect', { x: 915, y: 350 - 190 * Math.min(1, I * 2), width: 50, height: 190 * Math.min(1, I * 2), fill: C.green });
      const top = short ? [[slots[1] - 130, T], [slots[1] - 130, T - 70], [slots[1] + 130, T - 70], [slots[1] + 130, T]] : [];
      flows = [{ f: flow(gD, [[X0, 190], [X0, T], ...top, [X1, T], [X1, B], [X0, B], [X0, 260]]), I }];
      flows.forEach((o) => o.f.show(run));
    }
    const bPlay = button(s, 110, 365, 130, '▶ ไหล', C.green, () => { run = !run; bPlay.set(run, run ? '⏸ หยุด' : '▶ ไหล'); flows.forEach((o) => o.f.show(run)); });
    const b3 = button(s, 260, 365, 180, '+ ตัวที่ 3', C.navy, () => { three = !three; b3.set(three, three ? '− ตัวที่ 3' : '+ ตัวที่ 3'); draw(); });
    const bS = button(s, 460, 365, 230, 'ลวดลัดตัวกลาง', C.orange, () => { short = !short; bS.set(short); draw(); });
    draw();
    return loop((dt) => { if (run) flows.forEach((o) => o.f.step(SPEED * 2 * o.I, dt)); });
  }

  // ---------- 2B: parallel ----------
  function parallel(el) {
    const s = svgRoot(el);
    hint(s, 'ลากขึ้น–ลง (หรือแตะ) ที่ตัวต้านทานแต่ละแขน แล้วกด ▶');
    const X0 = 110, T = 110, B = 430, xs = [340, 540, 740], MY = (T + B) / 2;
    const gW = add(s, 'g', {}), gD = add(s, 'g', {}), gR = add(s, 'g', {}), gG = add(s, 'g', {});
    const lv = [2, 4, 3]; let three = false, run = false, flows = [];
    function draw() {
      clear(gW); clear(gR); clear(gD); clear(gG);
      const n = three ? 3 : 2, XR = xs[n - 1];
      battery(gW, X0, 235, 305);
      add(gW, 'path', { d: `M${X0} 235 V${T} H${XR} M${X0} 305 V${B} H${XR}`, fill: 'none', stroke: C.ink, 'stroke-width': 4 });
      const I = [];
      for (let i = 0; i < n; i++) {
        const x = xs[i], h = 50 + 22 * lv[i];
        I.push(1 / lv[i]);
        add(gW, 'line', { x1: x, y1: T, x2: x, y2: B, stroke: C.ink, 'stroke-width': 4 });
        add(gW, 'circle', { cx: x, cy: T, r: 7, fill: C.ink }); add(gW, 'circle', { cx: x, cy: B, r: 7, fill: C.ink });
        add(gR, 'rect', { x: x - 26, y: MY - h / 2 - 4, width: 52, height: h + 8, fill: C.paper });
        zig(gR, x, MY - h / 2, x, MY + h / 2, 2 * lv[i] + 2);
        const hit = add(gR, 'rect', { x: x - 60, y: MY - 110, width: 120, height: 220, fill: 'transparent', style: 'cursor:ns-resize' });
        levelDrag(hit, s, () => lv[i], (v) => { if (v !== lv[i]) { lv[i] = v; draw(); } }, 1, 4);
        add(gR, 'text', { x: x + 34, y: MY + 8, 'font-size': 22, 'font-weight': 700, fill: C.navy }, `R${'₁₂₃'[i]}`);
      }
      const tot = I.reduce((a, b) => a + b, 0), k = SPEED / 2.2;
      flows = [];
      flows.push({ f: flow(gD, [[X0, B], [X0, 305]]), I: tot });
      flows.push({ f: flow(gD, [[X0, 235], [X0, T], [xs[0], T]]), I: tot });
      flows.push({ f: flow(gD, [[xs[0], B], [X0, B]]), I: tot });
      for (let i = 0; i < n; i++) {
        flows.push({ f: flow(gD, [[xs[i], T], [xs[i], B]]), I: I[i] });
        if (i < n - 1) {
          const rest = I.slice(i + 1).reduce((a, b) => a + b, 0);
          flows.push({ f: flow(gD, [[xs[i], T], [xs[i + 1], T]]), I: rest });
          flows.push({ f: flow(gD, [[xs[i + 1], B], [xs[i], B]]), I: rest });
        }
      }
      flows.forEach((o) => { o.v = k * o.I; o.f.show(run); });
      // current bars (no numbers): each branch and total
      const GX = 850, BH = 300, sc = BH / 3.2;
      add(gG, 'text', { x: 920, y: 100, 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', fill: C.grey }, 'กระแส');
      const bars = I.map((v, i) => [`I${'₁₂₃'[i]}`, v, C.navy]).concat([['รวม', tot, C.green]]);
      bars.forEach(([lab, v, col], j) => {
        const x = GX + j * 36;
        add(gG, 'rect', { x, y: 120, width: 28, height: BH, fill: '#fff', stroke: C.line, 'stroke-width': 2 });
        add(gG, 'rect', { x, y: 120 + BH - v * sc, width: 28, height: v * sc, fill: col });
        add(gG, 'text', { x: x + 14, y: 120 + BH + 26, 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: col }, lab);
      });
    }
    const bPlay = button(s, 110, 500, 130, '▶ ไหล', C.green, () => { run = !run; bPlay.set(run, run ? '⏸ หยุด' : '▶ ไหล'); flows.forEach((o) => o.f.show(run)); });
    const b3 = button(s, 260, 500, 180, '+ แขนที่ 3', C.navy, () => { three = !three; b3.set(three, three ? '− แขนที่ 3' : '+ แขนที่ 3'); draw(); });
    draw();
    return loop((dt) => { if (run) flows.forEach((o) => o.f.step(o.v, dt)); });
  }

  // ---------- 2C: bridge with a bulb in the middle ----------
  function bridge(el) {
    const s = svgRoot(el);
    hint(s, 'ลากขึ้น–ลง (หรือแตะ) ที่ R₁ สีสายบอกศักย์: แดง = สูง น้ำเงิน = ต่ำ');
    const L = [290, 300], Tp = [500, 130], Bp = [500, 470], Rp = [710, 300];
    const R2 = 6, R3 = 2, R4 = 4, Rb = 2;
    let r1 = 1, run = false, flows = [];
    const gW = add(s, 'g', {}), gD = add(s, 'g', {}), gR = add(s, 'g', {}), gT = add(s, 'g', {});
    function solve() {       // node analysis: V(L) = 1, V(R) = 0, unknown V(T), V(B)
      const a11 = 1 / r1 + 1 / Rb + 1 / R2, a12 = -1 / Rb, b1 = 1 / r1;
      const a21 = -1 / Rb, a22 = 1 / R3 + 1 / Rb + 1 / R4, b2 = 1 / R3;
      const det = a11 * a22 - a12 * a21;
      return [(b1 * a22 - a12 * b2) / det, (a11 * b2 - a21 * b1) / det];
    }
    function arm(g, p, q, teeth, col) {      // diagonal resistor with short leads
      const dx = q[0] - p[0], dy = q[1] - p[1];
      const a = [p[0] + dx * .25, p[1] + dy * .25], b = [p[0] + dx * .75, p[1] + dy * .75];
      add(g, 'line', { x1: p[0], y1: p[1], x2: a[0], y2: a[1], stroke: col[0], 'stroke-width': 6 });
      add(g, 'line', { x1: b[0], y1: b[1], x2: q[0], y2: q[1], stroke: col[1], 'stroke-width': 6 });
      zig(g, a[0], a[1], b[0], b[1], teeth);
    }
    function draw() {
      clear(gW); clear(gR); clear(gD); clear(gT);
      const [vt, vb] = solve(), cH = potCol(1), cL = potCol(0), cT = potCol(vt), cB = potCol(vb);
      const Im = (vt - vb) / Rb;
      // battery loop
      add(gW, 'path', { d: `M${L[0]} ${L[1]} H150 V545 H460`, fill: 'none', stroke: cH, 'stroke-width': 6 });
      add(gW, 'path', { d: `M540 545 H850 V${Rp[1]} H${Rp[0]}`, fill: 'none', stroke: cL, 'stroke-width': 6 });
      add(gW, 'line', { x1: 480, y1: 515, x2: 480, y2: 575, stroke: C.ink, 'stroke-width': 4 });
      add(gW, 'line', { x1: 520, y1: 530, x2: 520, y2: 560, stroke: C.ink, 'stroke-width': 10 });
      add(gW, 'line', { x1: 460, y1: 545, x2: 480, y2: 545, stroke: cH, 'stroke-width': 6 });
      add(gW, 'line', { x1: 520, y1: 545, x2: 540, y2: 545, stroke: cL, 'stroke-width': 6 });
      add(gW, 'text', { x: 466, y: 515, 'font-size': 28, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle' }, '+');
      arm(gR, L, Tp, r1 + 2, [cH, cT]); arm(gR, Tp, Rp, R2 + 2, [cT, cL]);
      arm(gR, L, Bp, R3 + 2, [cH, cB]); arm(gR, Bp, Rp, R4 + 2, [cB, cL]);
      // middle branch with bulb
      add(gW, 'line', { x1: 500, y1: Tp[1], x2: 500, y2: 260, stroke: cT, 'stroke-width': 6 });
      add(gW, 'line', { x1: 500, y1: 340, x2: 500, y2: Bp[1], stroke: cB, 'stroke-width': 6 });
      const glow = Math.min(1, Math.abs(Im) * 9);
      if (glow > .01) add(gW, 'circle', { cx: 500, cy: 300, r: 40 + 50 * glow, fill: C.yellow, opacity: .2 + .45 * glow });
      add(gW, 'circle', { cx: 500, cy: 300, r: 40, fill: glow > .01 ? '#fff6cc' : '#fff', stroke: C.ink, 'stroke-width': 4 });
      add(gW, 'path', { d: 'M472 272 L528 328 M472 328 L528 272', stroke: C.ink, 'stroke-width': 3 });
      [[L, cH], [Rp, cL], [Tp, cT], [Bp, cB]].forEach(([p, c]) => add(gT, 'circle', { cx: p[0], cy: p[1], r: 13, fill: c, stroke: C.ink, 'stroke-width': 2 }));
      add(gT, 'text', { x: 500, y: 108, 'font-size': 26, 'font-weight': 700, 'text-anchor': 'middle' }, 'A');
      add(gT, 'text', { x: 530, y: 492, 'font-size': 26, 'font-weight': 700 }, 'B');
      add(gT, 'text', { x: 365, y: 190, 'font-size': 24, 'font-weight': 700, fill: C.navy, 'text-anchor': 'end' }, 'R₁ (ลากได้)');
      add(gT, 'text', { x: 880, y: 150, 'font-size': 22, 'font-weight': 700, fill: Math.abs(Im) < 1e-7 ? C.green : C.grey, 'text-anchor': 'middle' },
        Math.abs(Im) < 1e-7 ? 'A กับ B สีเดียวกัน' : 'A กับ B สีต่างกัน');
      add(gT, 'text', { x: 880, y: 180, 'font-size': 22, 'font-weight': 700, fill: Math.abs(Im) < 1e-7 ? C.green : C.grey, 'text-anchor': 'middle' },
        Math.abs(Im) < 1e-7 ? 'หลอดกลางดับ' : 'หลอดกลางติด');
      const hit = add(gR, 'circle', { cx: (L[0] + Tp[0]) / 2, cy: (L[1] + Tp[1]) / 2, r: 80, fill: 'transparent', style: 'cursor:ns-resize' });
      levelDrag(hit, s, () => r1, (v) => { if (v !== r1) { r1 = v; draw(); } }, 1, 6);
      // charges
      const iTop = (1 - vt) / r1, iT2 = vt / R2, iL3 = (1 - vb) / R3, iB4 = vb / R4, tot = iTop + iL3, k = SPEED * 1.3;
      flows = [
        [[[850, Rp[1]], [850, 545], [540, 545]], tot], [[[460, 545], [150, 545], [150, L[1]], L], tot],
        [[L, Tp], iTop], [[Tp, Rp], iT2], [[L, Bp], iL3], [[Bp, Rp], iB4], [[Rp, [850, Rp[1]]], tot],
        [Im >= 0 ? [Tp, Bp] : [Bp, Tp], Math.abs(Im)],
      ].map(([p, i]) => ({ f: flow(gD, p), v: k * i }));
      flows.forEach((o) => o.f.show(run && o.v > 1e-6));
    }
    const bPlay = button(s, 40, 70, 130, '▶ ไหล', C.green, () => { run = !run; bPlay.set(run, run ? '⏸ หยุด' : '▶ ไหล'); flows.forEach((o) => o.f.show(run && o.v > 1e-6)); });
    draw();
    return loop((dt) => { if (run) flows.forEach((o) => o.f.step(o.v, dt)); });
  }

  window.SC_ANIMS = {
    pages: {
      p01: [{ id: 'series', x: .9, y: .1, t: 'อนุกรม: กระแสและศักย์' }],
      p07: [{ id: 'parallel', x: .9, y: .1, t: 'ขนาน: กระแสแบ่งที่ทางแยก' }],
      p11: [{ id: 'bridge', x: .9, y: .62, t: 'สะพาน: เมื่อไรหลอดกลางดับ' }],
    },
    make: { series, parallel, bridge },
    sims: {},
  };
})();
