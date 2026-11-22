// Page animations for /class/el3/ (electricity session 3: real battery, cells, meters). Loaded by index.html when this file exists
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

  function bulbAt(g, x, y, glow, r = 30, vertical = false) {
    if (glow > .01) add(g, 'circle', { cx: x, cy: y, r: r + 45 * Math.min(1.3, glow), fill: C.yellow, opacity: .18 + .45 * Math.min(1, glow) });
    add(g, 'circle', { cx: x, cy: y, r, fill: glow > .01 ? '#fff6cc' : '#fff', stroke: C.ink, 'stroke-width': 4 });
    const k = r * .7;
    add(g, 'path', { d: `M${x - k} ${y - k} L${x + k} ${y + k} M${x - k} ${y + k} L${x + k} ${y - k}`, stroke: C.ink, 'stroke-width': 3 });
  }
  function bar(g, x, yBot, w, h, frac, col, lab) {
    add(g, 'rect', { x, y: yBot - h, width: w, height: h, fill: '#fff', stroke: C.line, 'stroke-width': 2 });
    const f = Math.max(0, Math.min(1, frac));
    add(g, 'rect', { x, y: yBot - h * f, width: w, height: h * f, fill: col });
    add(g, 'text', { x: x + w / 2, y: yBot + 26, 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: col }, lab);
  }

  // ---------- 3A: real battery (E with r inside), bulbs added in parallel ----------
  function emf(el) {
    const s = svgRoot(el);
    hint(s, 'แตะ + หลอด เพิ่มหลอดขนาน ดูแท่ง V ขั้ว กับ "หายใน r" แล้วกด ▶');
    const T = 110, B = 450, XB = 160, xs = [430, 560, 690, 820];
    const E0 = 1, r = .5, Rb = 2;
    let n = 1, short = false, run = false, flows = [];
    const gW = add(s, 'g', {}), gD = add(s, 'g', {}), gT = add(s, 'g', {});
    function draw() {
      clear(gW); clear(gD); clear(gT);
      const Rx = short ? 0 : Rb / n, I = E0 / (Rx + r), V = I * Rx, lost = I * r;
      // battery box
      add(gW, 'rect', { x: XB - 75, y: 150, width: 150, height: 260, rx: 18, fill: short ? '#ffd7d7' : '#f4f7fb', stroke: short ? C.red : C.blue, 'stroke-width': 3, 'stroke-dasharray': '10 7' });
      add(gW, 'text', { x: XB, y: 400, 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', fill: short ? C.red : C.blue }, short ? 'แบตร้อน!' : 'แบตเตอรี่ 1 ก้อน');
      add(gW, 'path', { d: `M${XB} ${T} V185 M${XB} 225 V255 M${XB} 365 V${B}`, fill: 'none', stroke: C.ink, 'stroke-width': 4 });
      add(gW, 'line', { x1: XB - 34, y1: 195, x2: XB + 34, y2: 195, stroke: C.ink, 'stroke-width': 4 });
      add(gW, 'line', { x1: XB - 18, y1: 215, x2: XB + 18, y2: 215, stroke: C.ink, 'stroke-width': 10 });
      add(gW, 'line', { x1: XB, y1: 185, x2: XB, y2: 195, stroke: C.ink, 'stroke-width': 4 }); add(gW, 'line', { x1: XB, y1: 215, x2: XB, y2: 225, stroke: C.ink, 'stroke-width': 4 });
      add(gW, 'text', { x: XB + 45, y: 212, 'font-size': 24, 'font-weight': 700, 'font-style': 'italic' }, 'E');
      add(gW, 'text', { x: XB - 50, y: 202, 'font-size': 28, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle' }, '+');
      zig(gW, XB, 255, XB, 365, 6, short ? C.red : C.ink, 14);
      add(gW, 'text', { x: XB + 30, y: 318, 'font-size': 24, 'font-weight': 700, 'font-style': 'italic' }, 'r');
      const XR = xs[n - 1];
      add(gW, 'path', { d: `M${XB} ${T} H${XR} M${XB} ${B} H${XR}`, fill: 'none', stroke: C.ink, 'stroke-width': 4 });
      if (short) add(gW, 'line', { x1: 300, y1: T, x2: 300, y2: B, stroke: C.orange, 'stroke-width': 6 });
      add(gW, 'circle', { cx: 250, cy: T, r: 7, fill: C.ink }); add(gW, 'circle', { cx: 250, cy: B, r: 7, fill: C.ink });
      add(gW, 'text', { x: 262, y: T - 14, 'font-size': 18, fill: C.grey, 'font-weight': 700 }, 'ขั้ว');
      add(gW, 'text', { x: 262, y: B + 30, 'font-size': 18, fill: C.grey, 'font-weight': 700 }, 'ขั้ว');
      for (let i = 0; i < n; i++) {
        const x = xs[i];
        add(gW, 'line', { x1: x, y1: T, x2: x, y2: B, stroke: C.ink, 'stroke-width': 4 });
        bulbAt(gW, x, (T + B) / 2, short ? 0 : (V / (Rb * 0 + 1)) ** 2 / (2 / 2.5) ** 2 * .6);
      }
      // bars (no numbers): terminal voltage and voltage lost in r add up to E
      const H = 300, y0 = 450;
      add(gT, 'text', { x: 885, y: 115, 'font-size': 19, 'font-weight': 700, 'text-anchor': 'middle', fill: C.grey }, 'แบ่ง E');
      add(gT, 'rect', { x: 860, y: y0 - H, width: 50, height: H, fill: '#fff', stroke: C.ink, 'stroke-width': 2 });
      add(gT, 'rect', { x: 860, y: y0 - H * V, width: 50, height: H * V, fill: C.green });
      add(gT, 'rect', { x: 860, y: y0 - H, width: 50, height: H * lost, fill: C.red, opacity: .8 });
      add(gT, 'text', { x: 885, y: y0 + 26, 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: C.green }, 'V ขั้ว');
      add(gT, 'text', { x: 925, y: y0 - H - 8 + 0, 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: C.red }, '');
      add(gT, 'text', { x: 920, y: y0 - H + 22, 'font-size': 17, 'font-weight': 700, fill: C.red }, 'หาย');
      add(gT, 'text', { x: 920, y: y0 - H + 42, 'font-size': 17, 'font-weight': 700, fill: C.red }, 'ใน r');
      // charges
      const k = SPEED * .25;
      flows = [{ f: flow(gD, [[XB, B], [XB, T]]), v: k * I }];
      if (short) flows.push({ f: flow(gD, [[XB, T], [300, T], [300, B], [XB, B]]), v: k * I });
      else {
        const ib = I / n;
        flows.push({ f: flow(gD, [[XB, T], [xs[0], T]]), v: k * I }, { f: flow(gD, [[xs[0], B], [XB, B]]), v: k * I });
        for (let i = 0; i < n; i++) {
          flows.push({ f: flow(gD, [[xs[i], T], [xs[i], (T + B) / 2 - 30]]), v: k * ib }, { f: flow(gD, [[xs[i], (T + B) / 2 + 30], [xs[i], B]]), v: k * ib });
          if (i < n - 1) flows.push({ f: flow(gD, [[xs[i], T], [xs[i + 1], T]]), v: k * ib * (n - 1 - i) }, { f: flow(gD, [[xs[i + 1], B], [xs[i], B]]), v: k * ib * (n - 1 - i) });
        }
      }
      flows.forEach((o) => o.f.show(run));
    }
    const bPlay = button(s, 60, 520, 130, '▶ ไหล', C.green, () => { run = !run; bPlay.set(run, run ? '⏸ หยุด' : '▶ ไหล'); flows.forEach((o) => o.f.show(run)); });
    button(s, 210, 520, 150, '+ หลอด', C.navy, () => { if (n < 4) { n++; draw(); } });
    button(s, 380, 520, 150, '− หลอด', C.navy, () => { if (n > 1) { n--; draw(); } });
    const bS = button(s, 550, 520, 170, 'ลัดวงจร', C.red, () => { short = !short; bS.set(short); draw(); });
    draw();
    return loop((dt) => { if (run) flows.forEach((o) => o.f.step(o.v, dt)); });
  }

  // ---------- 3B: cell holder, series or parallel ----------
  function cells(el) {
    const s = svgRoot(el);
    hint(s, 'แตะช่องถ่าน: ว่าง → ใส่ → กลับขั้ว → ว่าง • สลับราง แล้วกด ▶');
    const st = [1, 1, 0, 0]; let par = false, run = false, flows = [];
    const gW = add(s, 'g', {}), gD = add(s, 'g', {}), gC = add(s, 'g', {}), gT = add(s, 'g', {});
    const Rb = 2, rc = .5;
    function cellH(g, cx, cy, state, onTap) {     // horizontal cell in a slot, + on the left when state 1
      add(g, 'rect', { x: cx - 55, y: cy - 38, width: 110, height: 76, rx: 12, fill: state ? '#fffaf0' : '#f2f4f8', stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': state ? '' : '8 6' });
      if (state) {
        const lp = state === 1 ? -9 : 9;               // long plate (+)
        add(g, 'line', { x1: cx - 55, y1: cy, x2: cx - 9, y2: cy, stroke: C.ink, 'stroke-width': 4 }); add(g, 'line', { x1: cx + 9, y1: cy, x2: cx + 55, y2: cy, stroke: C.ink, 'stroke-width': 4 });
        add(g, 'line', { x1: cx + lp, y1: cy - 28, x2: cx + lp, y2: cy + 28, stroke: C.ink, 'stroke-width': 4 });
        add(g, 'line', { x1: cx - lp, y1: cy - 15, x2: cx - lp, y2: cy + 15, stroke: C.ink, 'stroke-width': 10 });
        add(g, 'text', { x: cx + lp * 3.2, y: cy - 14, 'font-size': 24, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle' }, '+');
        if (state === 2) add(g, 'text', { x: cx, y: cy + 60, 'font-size': 17, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle' }, 'กลับขั้ว');
      } else { if (!par) add(g, 'line', { x1: cx - 55, y1: cy, x2: cx + 55, y2: cy, stroke: C.ink, 'stroke-width': 4 }); add(g, 'text', { x: cx, y: cy - 12, 'font-size': 18, fill: C.grey, 'text-anchor': 'middle' }, par ? 'ว่าง' : 'ว่าง (ลวดต่อ)'); }
      const hit = add(g, 'rect', { x: cx - 60, y: cy - 45, width: 120, height: 90, fill: 'transparent', style: 'cursor:pointer' });
      hit.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); onTap(); });
    }
    function calc() {
      const on = st.filter((v) => v);
      if (!on.length) return { E: 0, r: 0, I: 0 };
      if (!par) { const E = st.reduce((a, v) => a + (v === 1 ? 1 : v === 2 ? -1 : 0), 0), r = on.length * rc; return { E, r, I: E / (Rb + r) }; }
      const r = rc / on.length; return { E: 1, r, I: 1 / (Rb + r) };
    }
    function draw() {
      clear(gW); clear(gD); clear(gC); clear(gT);
      if (par) st.forEach((v, i) => { if (v === 2) st[i] = 1; });
      const { E, r, I } = calc(), cnt = st.filter((v) => v).length;
      const XL = 120, XR = 640, T = 120, B = 470;
      let path;
      if (!par) {
        const xs = [200, 320, 440, 560];
        add(gW, 'path', { d: `M${xs[0] - 55} ${T} H${XL} V${B} H${XR} V${T} H${xs[3] + 55}`, fill: 'none', stroke: C.ink, 'stroke-width': 4 });
        xs.forEach((x, i) => { if (i < 3) add(gW, 'line', { x1: x + 55, y1: T, x2: xs[i + 1] - 55, y2: T, stroke: C.ink, 'stroke-width': 4 }); });
        xs.forEach((x, i) => cellH(gC, x, T, st[i], () => { st[i] = (st[i] + 1) % 3; draw(); }));
        path = [[XL, B], [XL, T], [XR, T], [XR, B], [XL, B]];
        // an empty slot breaks the circuit in series
      } else {
        const ys = [120, 205, 290, 375], X1 = 240, X2 = 480;
        add(gW, 'path', { d: `M${X1} ${ys[0]} V${ys[3]} M${X2} ${ys[0]} V${ys[3]} M${X1} ${ys[0]} H${XL} V${B} H${XR} V${ys[0]} H${X2}`, fill: 'none', stroke: C.ink, 'stroke-width': 4 });
        ys.forEach((y, i) => { add(gW, 'line', { x1: X1, y1: y, x2: 305, y2: y, stroke: C.ink, 'stroke-width': 4 }); add(gW, 'line', { x1: 415, y1: y, x2: X2, y2: y, stroke: C.ink, 'stroke-width': 4 });
          cellH(gC, 360, y, st[i], () => { st[i] = st[i] ? 0 : 1; draw(); }); });
        path = [[XL, B], [XL, ys[0]], [X1, ys[0]]];
      }
      const broken = false;
      const Ireal = broken ? 0 : Math.abs(I);
      // bulb on the right side
      add(gW, 'rect', { x: XR - 40, y: 255, width: 80, height: 80, fill: C.paper });
      bulbAt(gW, XR, 295, (Ireal / .42) ** 2 * .7, 34);
      // bars
      const y0 = 470, H = 300;
      bar(gT, 740, y0, 50, H, Math.abs(E) / 4, C.navy, 'E รวม');
      bar(gT, 820, y0, 50, H, r / 2, C.red, 'r รวม');
      bar(gT, 900, y0, 50, H, Ireal / 1.1, C.green, 'กระแส');
      add(gT, 'text', { x: 845, y: 135, 'font-size': 19, 'font-weight': 700, 'text-anchor': 'middle', fill: C.grey }, `ถ่าน ${cnt} ก้อน`);
      // charges: main loop (series), or each row in parallel
      const k = SPEED * .5, dir = I < 0 ? -1 : 1;
      flows = [];
      if (!broken && cnt) {
        if (!par) flows.push({ f: flow(gD, [[XL, T], [XR, T], [XR, B], [XL, B], [XL, T]]), v: k * Ireal * dir });
        else {
          flows.push({ f: flow(gD, [[480, 120], [XR, 120], [XR, B], [XL, B], [XL, 120], [240, 120]]), v: k * Ireal });
          [120, 205, 290, 375].forEach((y, i) => { if (st[i]) flows.push({ f: flow(gD, [[240, y], [480, y]]), v: k * Ireal / cnt }); });
        }
      }
      flows.forEach((o) => o.f.show(run));
    }
    const bPlay = button(s, 60, 530, 130, '▶ ไหล', C.green, () => { run = !run; bPlay.set(run, run ? '⏸ หยุด' : '▶ ไหล'); flows.forEach((o) => o.f.show(run)); });
    const bM = button(s, 210, 530, 230, 'รางอนุกรม', C.navy, () => { par = !par; bM.set(par, par ? 'รางขนาน' : 'รางอนุกรม'); draw(); });
    draw();
    return loop((dt) => { if (run) flows.forEach((o) => o.f.step(o.v, dt)); });
  }

  // ---------- 3C: place an ammeter / voltmeter ----------
  function meters(el) {
    const s = svgRoot(el);
    hint(s, 'เลือก A หรือ V แล้วแตะช่องเส้นประ (แตะอีกครั้ง = เอาออก)');
    let pick = 'A', slot = { ser: null, acr: null };
    const gW = add(s, 'g', {}), gT = add(s, 'g', {});
    const E0 = 1, r0 = .05, Rb = 2, RA = .01, RV = 2000;
    function meterAt(g, x, y, type, frac, over) {
      add(g, 'circle', { cx: x, cy: y, r: 44, fill: '#fff', stroke: over ? C.red : C.ink, 'stroke-width': 4 });
      add(g, 'path', { d: `M${x - 30} ${y + 2} A 32 32 0 0 1 ${x + 30} ${y + 2}`, fill: 'none', stroke: C.grey, 'stroke-width': 2 });
      const a = (-70 + 140 * Math.max(0, Math.min(1.08, frac))) * Math.PI / 180;
      add(g, 'line', { x1: x, y1: y + 8, x2: x + 36 * Math.sin(a), y2: y + 8 - 36 * Math.cos(a), stroke: C.red, 'stroke-width': 4, 'stroke-linecap': 'round' });
      add(g, 'text', { x, y: y + 34, 'font-size': 22, 'font-weight': 700, 'text-anchor': 'middle' }, type);
    }
    function slotBox(g, x, y, which) {
      const has = slot[which];
      if (!has) add(g, 'circle', { cx: x, cy: y, r: 44, fill: '#fff', stroke: C.grey, 'stroke-width': 3, 'stroke-dasharray': '9 7' });
      const hit = add(g, 'circle', { cx: x, cy: y, r: 55, fill: 'transparent', style: 'cursor:pointer' });
      hit.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); slot[which] = slot[which] ? null : pick; draw(); });
    }
    function draw() {
      clear(gW); clear(gT);
      const Rs = slot.ser === 'A' ? RA : slot.ser === 'V' ? RV : 0;
      const Ra = slot.acr === 'A' ? RA : slot.acr === 'V' ? RV : Infinity;
      const Rp = 1 / (1 / Rb + 1 / Ra), I = E0 / (r0 + Rs + Rp), Vp = I * Rp, Ib = Vp / Rb, Ia = isFinite(Ra) ? Vp / Ra : 0;
      const Inorm = E0 / (r0 + Rb);
      const XL = 120, XR = 640, T = 240, B = 500, XBul = 380;
      // circuit: battery on left, bulb on top wire, series slot on right side, across slot above bulb
      add(gW, 'path', { d: `M${XL} 345 V${T} H${XBul - 34} M${XBul + 34} ${T} H${XR} V${315} M${XR} ${425} V${B} H${XL} V395`, fill: 'none', stroke: C.ink, 'stroke-width': 4 });
      if (!slot.ser) add(gW, 'line', { x1: XR, y1: 315, x2: XR, y2: 425, stroke: C.ink, 'stroke-width': 4, opacity: .25 });
      add(gW, 'line', { x1: XL - 34, y1: 360, x2: XL + 34, y2: 360, stroke: C.ink, 'stroke-width': 4 });
      add(gW, 'line', { x1: XL - 18, y1: 380, x2: XL + 18, y2: 380, stroke: C.ink, 'stroke-width': 10 });
      add(gW, 'line', { x1: XL, y1: 345, x2: XL, y2: 360, stroke: C.ink, 'stroke-width': 4 }); add(gW, 'line', { x1: XL, y1: 380, x2: XL, y2: 395, stroke: C.ink, 'stroke-width': 4 });
      add(gW, 'text', { x: XL - 50, y: 368, 'font-size': 28, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle' }, '+');
      add(gW, 'path', { d: `M${XBul - 110} ${T} V${T - 85} H${XBul - 44} M${XBul + 44} ${T - 85} H${XBul + 110} V${T}`, fill: 'none', stroke: C.ink, 'stroke-width': 4, opacity: slot.acr ? 1 : .3 });
      add(gW, 'circle', { cx: XBul - 110, cy: T, r: 7, fill: C.ink }); add(gW, 'circle', { cx: XBul + 110, cy: T, r: 7, fill: C.ink });
      const blown = false;
      bulbAt(gW, XBul, T, (Ib / Inorm) ** 2 * .8, 34);
      add(gW, 'text', { x: XBul, y: T + 62, 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: C.grey }, 'หลอดไฟ');
      add(gW, 'text', { x: XR + 55, y: 376, 'font-size': 18, 'font-weight': 700, fill: C.grey }, 'ช่องอนุกรม');
      add(gW, 'text', { x: XBul + 60, y: T - 150, 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: C.grey }, 'ช่องคร่อมหลอด');
      slotBox(gW, XR, 370, 'ser'); slotBox(gW, XBul, T - 85, 'acr');
      const read = (type, cur, volt) => type === 'A' ? cur / (Inorm * 2) : volt / E0;
      let shortA = false;
      if (slot.ser) { const f = read(slot.ser, I, I * Rs); meterAt(gW, XR, 370, slot.ser, f, f > 1); if (slot.ser === 'A' && f > 1) shortA = true; }
      if (slot.acr) { const f = read(slot.acr, Ia, Vp); meterAt(gW, XBul, T - 85, slot.acr, f, f > 1); if (slot.acr === 'A' && f > 1) shortA = true; }
      // verdict
      let msg = 'วางมิเตอร์ลงในช่อง', col = C.grey;
      if (shortA) { msg = 'ลัดวงจร! กระแสมาก เข็ม A ตีสุด'; col = C.red; }
      else if (slot.ser === 'V') { msg = 'V อนุกรม: กระแสแทบไม่ไหล หลอดดับ'; col = C.orange; }
      else if (slot.ser === 'A' && slot.acr === 'V') { msg = 'ถูกต้อง: A อนุกรม V คร่อมหลอด'; col = C.green; }
      else if (slot.ser === 'A' || slot.acr === 'V') { msg = 'วางถูกที่แล้ว หลอดสว่างปกติ'; col = C.green; }
      add(gT, 'text', { x: 380, y: 565, 'font-size': 26, 'font-weight': 700, 'text-anchor': 'middle', fill: col }, msg);
      if (shortA) add(gT, 'path', { d: 'M560 60 l20 30 l-12 4 l22 34 l-34 -26 l12 -4 z', fill: C.orange });
      void blown;
    }
    const bA = button(s, 820, 200, 150, 'เลือก A', C.navy, () => { pick = 'A'; bA.set(true); bV.set(false); });
    const bV = button(s, 820, 270, 150, 'เลือก V', C.navy, () => { pick = 'V'; bV.set(true); bA.set(false); });
    button(s, 820, 360, 150, 'ล้าง', C.grey, () => { slot = { ser: null, acr: null }; draw(); });
    bA.set(true);
    draw();
    return () => {};
  }

  window.SC_ANIMS = {
    pages: {
      p01: [{ id: 'emf', x: .9, y: .1, t: 'แบตจริง: V ขั้วตกเมื่อดึงกระแสมาก' }],
      p06: [{ id: 'cells', x: .9, y: .1, t: 'รางถ่าน: อนุกรม ขนาน กลับขั้ว' }],
      p11: [{ id: 'meters', x: .9, y: .1, t: 'วางแอมมิเตอร์/โวลต์มิเตอร์' }],
    },
    make: { emf, cells, meters },
    sims: {},
  };
})();
