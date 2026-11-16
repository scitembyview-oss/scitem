// Page animations for /class/el1/ (electricity session 1). Loaded by index.html when this file exists
// (tools/build-sheet-class.mjs sets CFG.anims). A play button on the learning page opens the animation full screen.
// Public file: shows physics only, never fills in the sheet's blanks or shows a problem's answer.
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
  function dragOn(el, s, fn) {
    let id = null;
    el.addEventListener('pointerdown', (e) => { id = e.pointerId; try { el.setPointerCapture(id); } catch (x) {} fn(pt(s, e), 'down'); e.preventDefault(); e.stopPropagation(); });
    el.addEventListener('pointermove', (e) => { if (e.pointerId === id) fn(pt(s, e), 'move'); });
    const end = (e) => { if (e.pointerId === id) { id = null; fn(pt(s, e), 'up'); } };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  function loop(step) {
    let on = true, last = performance.now();
    const f = (t) => { if (!on) return; step(Math.min(.05, (t - last) / 1000)); last = t; requestAnimationFrame(f); };
    requestAnimationFrame(f); return () => { on = false; };
  }
  const hint = (s, t) => add(s, 'text', { x: 24, y: 40, 'font-size': 22, 'font-weight': 700, fill: C.grey }, t);

  // ---------- 1A: count charges through a cross-section (1 dot = 1 C) ----------
  function gate(el) {
    const s = svgRoot(el);
    const hs = hint(s, 'เลือกความเร็ว แล้วกด ▶ นับประจุที่ผ่านหน้าตัดใน 5 วินาที (1 จุด = 1 C)');
    const X0 = 90, X1 = 910, Y0 = 200, Y1 = 330, L = X1 - X0, K = 20, d = L / K, cx = 500;
    add(s, 'rect', { x: X0, y: Y0, width: L, height: Y1 - Y0, rx: 60, fill: '#f1f3f7', stroke: C.ink, 'stroke-width': 3 });
    add(s, 'text', { x: 50, y: 282, 'font-size': 52, 'font-weight': 700, fill: C.red, 'text-anchor': 'middle' }, '+');
    add(s, 'text', { x: 950, y: 282, 'font-size': 52, 'font-weight': 700, fill: C.blue, 'text-anchor': 'middle' }, '−');
    add(s, 'line', { x1: cx, y1: Y0 - 30, x2: cx, y2: Y1 + 30, stroke: C.blue, 'stroke-width': 4, 'stroke-dasharray': '12 8' });
    add(s, 'text', { x: cx, y: Y1 + 58, 'font-size': 20, fill: C.blue, 'text-anchor': 'middle', 'font-weight': 700 }, 'หน้าตัด');
    const gE = add(s, 'g', {}), gP = add(s, 'g', {});
    const els = [], ions = [];
    for (let i = 0; i < K; i++) {
      const g = add(gE, 'g', {}); add(g, 'circle', { r: 15, fill: C.yellow, stroke: '#8a5a00', 'stroke-width': 2 }); add(g, 'text', { y: 8, 'font-size': 24, 'font-weight': 700, 'text-anchor': 'middle' }, '−');
      els.push({ g, x: X0 + 20 + i * d, y: 240 + (i % 3) * 25 });
      const h = add(gP, 'g', { opacity: 0 }); add(h, 'circle', { r: 15, fill: '#f6b0b0', stroke: C.red, 'stroke-width': 2 }); add(h, 'text', { y: 8, 'font-size': 24, 'font-weight': 700, 'text-anchor': 'middle', fill: C.red }, '+');
      ions.push({ g: h, x: X0 + 40 + i * d, y: 252 + ((i + 1) % 3) * 25 });
    }
    const tE = add(s, 'text', { x: 120, y: 430, 'font-size': 28, 'font-weight': 700, fill: '#8a5a00' }, '');
    const tP = add(s, 'text', { x: 120, y: 470, 'font-size': 28, 'font-weight': 700, fill: C.red }, '');
    const tT = add(s, 'text', { x: 880, y: 430, 'font-size': 34, 'font-weight': 700, fill: C.ink, 'text-anchor': 'end' }, '0.0 s');
    const V = [40, 80, 160]; let lv = 0, ionOn = false, run = false, t = 0, nE = 0, nP = 0;
    const bs = ['ช้า', 'กลาง', 'เร็ว'].map((n, i) => button(s, 90 + i * 130, 520, 115, n, C.navy, () => { if (!run) { lv = i; bs.forEach((b, j) => b.set(j === i)); } }));
    bs[0].set(true);
    const bI = button(s, 500, 520, 230, 'ไอออนบวกวิ่งสวน', C.red, () => { if (run) return; ionOn = !ionOn; bI.set(ionOn); ions.forEach((o) => o.g.setAttribute('opacity', ionOn ? 1 : 0)); show(); });
    const bG = button(s, 760, 520, 150, '▶ 5 วินาที', C.green, () => { if (run) return; run = true; t = 0; nE = 0; nP = 0; bG.set(true, 'กำลังนับ…'); });
    function show() {
      tE.textContent = `อิเล็กตรอนผ่านหน้าตัด: ${nE} ตัว`;
      tP.textContent = ionOn ? `ไอออนบวกผ่านหน้าตัด: ${nP} ตัว` : '';
      tT.textContent = t.toFixed(1) + ' s';
    }
    function place() { els.forEach((o) => o.g.setAttribute('transform', `translate(${o.x},${o.y})`)); ions.forEach((o) => o.g.setAttribute('transform', `translate(${o.x},${o.y})`)); }
    place(); show();
    const wrap = (x) => (x < X0 + 15 ? x + L : x > X1 - 15 ? x - L : x);
    return loop((dt) => {
      if (!run) return;
      const step = Math.min(dt, 5 - t), v = V[lv];
      for (const o of els) { const x0 = o.x; o.x -= v * step; if (x0 >= cx && o.x < cx) nE++; o.x = wrap(o.x); }
      if (ionOn) for (const o of ions) { const x0 = o.x; o.x += v * step; if (x0 <= cx && o.x > cx) nP++; o.x = wrap(o.x); }
      t += step; place(); show();
      if (t >= 5) { run = false; bG.set(false, '▶ 5 วินาที'); hs.textContent = 'คิดเอง: กระแส = ประจุที่ผ่าน ÷ เวลา (ลองเปลี่ยนความเร็ว หรือเปิดไอออนบวก)'; }
    });
  }

  // ---------- 1B: cells + resistor or bulb, ammeter, I–V points ----------
  function ohm(el) {
    const s = svgRoot(el);
    hint(s, 'แตะ + / − เปลี่ยนจำนวนถ่าน แล้วดูเข็มและจุดบนกราฟ');
    // circuit (left half)
    const L = 60, R = 450, T = 140, B = 430;
    add(s, 'path', { d: `M${L} ${T} H${R} V${B} H${L} Z`, fill: 'none', stroke: C.ink, 'stroke-width': 4 });
    const gCell = add(s, 'g', {}), gLoad = add(s, 'g', {}), gDots = add(s, 'g', {}), gNeedle = add(s, 'g', {});
    // ammeter on the right side
    add(s, 'circle', { cx: R, cy: 285, r: 44, fill: '#fff', stroke: C.ink, 'stroke-width': 4 });
    add(s, 'text', { x: R, y: 318, 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle' }, 'A');
    add(s, 'path', { d: `M${R - 32} 280 A 34 34 0 0 1 ${R + 32} 280`, fill: 'none', stroke: C.grey, 'stroke-width': 2 });
    const needle = add(gNeedle, 'line', { x1: R, y1: 292, x2: R, y2: 254, stroke: C.red, 'stroke-width': 4, 'stroke-linecap': 'round' });
    // graph (right half)
    const GX = 560, GY = 470, GW = 380, GH = 330;
    for (let i = 1; i <= 6; i++) add(s, 'line', { x1: GX + i * GW / 6, y1: GY, x2: GX + i * GW / 6, y2: GY - GH, stroke: C.line });
    for (let j = 1; j <= 6; j++) add(s, 'line', { x1: GX, y1: GY - j * GH / 6, x2: GX + GW, y2: GY - j * GH / 6, stroke: C.line });
    add(s, 'path', { d: `M${GX} ${GY - GH - 15} V${GY} H${GX + GW + 15}`, fill: 'none', stroke: C.ink, 'stroke-width': 3 });
    add(s, 'text', { x: GX + GW + 10, y: GY + 34, 'font-size': 22, 'font-weight': 700, 'text-anchor': 'end' }, 'V (จำนวนถ่าน)');
    add(s, 'text', { x: GX + 8, y: GY - GH - 22, 'font-size': 22, 'font-weight': 700 }, 'I');
    const gPts = add(s, 'g', {});
    let n = 2, bulb = false, run = false, phase = 0;
    const pts = { r: new Set(), b: new Set() };
    const Ires = (k) => k / 6;                       // resistor: straight line (full scale at 6 cells)
    const Ibulb = (k) => (k ? Math.sqrt(k / 6) * 0.78 + 0.0 : 0);   // bulb: hot filament, curve bending over
    const I = () => (bulb ? Ibulb(n) : Ires(n));
    function draw() {
      clear(gCell); clear(gLoad); clear(gPts);
      // cells on the left side, stacked vertically
      const h = 26, y0 = 285 - (n * h) / 2;
      add(gCell, 'rect', { x: L - 30, y: y0 - 8, width: 60, height: n * h + 16, fill: C.paper, stroke: 'none' });
      for (let i = 0; i < n; i++) {
        const y = y0 + i * h;
        add(gCell, 'line', { x1: L - 26, y1: y + 4, x2: L + 26, y2: y + 4, stroke: C.ink, 'stroke-width': 3 });
        add(gCell, 'line', { x1: L - 13, y1: y + 14, x2: L + 13, y2: y + 14, stroke: C.ink, 'stroke-width': 7 });
      }
      add(gCell, 'text', { x: L - 40, y: y0 + 10, 'font-size': 26, 'font-weight': 700, fill: C.red, 'text-anchor': 'end' }, '+');
      add(gCell, 'text', { x: L + 40, y: 470, 'font-size': 22, 'font-weight': 700, fill: C.ink }, `ถ่าน ${n} ก้อน`);
      // load on the top wire
      const cx = 255, y = T;
      add(gLoad, 'rect', { x: cx - 70, y: y - 30, width: 140, height: 60, fill: C.paper });
      if (!bulb) {
        let d = `M${cx - 70} ${y}`; for (let i = 0; i < 6; i++) d += ` L${cx - 60 + i * 20} ${y + (i % 2 ? 18 : -18)}`; d += ` L${cx + 60} ${y} L${cx + 70} ${y}`;
        add(gLoad, 'path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 4, 'stroke-linejoin': 'round' });
      } else {
        const p = Ibulb(n) ** 2 / 0.3;
        if (n) add(gLoad, 'circle', { cx, cy: y, r: 30 + 40 * Math.min(1.4, p), fill: C.yellow, opacity: 0.25 + 0.3 * Math.min(1, p) });
        add(gLoad, 'line', { x1: cx - 70, y1: y, x2: cx - 30, y2: y, stroke: C.ink, 'stroke-width': 4 });
        add(gLoad, 'line', { x1: cx + 30, y1: y, x2: cx + 70, y2: y, stroke: C.ink, 'stroke-width': 4 });
        add(gLoad, 'circle', { cx, cy: y, r: 30, fill: '#fff', stroke: C.ink, 'stroke-width': 4 });
        add(gLoad, 'path', { d: `M${cx - 21} ${y - 21} L${cx + 21} ${y + 21} M${cx - 21} ${y + 21} L${cx + 21} ${y - 21}`, stroke: C.ink, 'stroke-width': 3 });
      }
      const a = (-60 + 120 * Math.min(1, I())) * Math.PI / 180;
      needle.setAttribute('x2', R + 38 * Math.sin(a)); needle.setAttribute('y2', 292 - 38 * Math.cos(a));
      // graph points
      pts[bulb ? 'b' : 'r'].add(n);
      for (const [k, set, f, col] of [['r', pts.r, Ires, C.blue], ['b', pts.b, Ibulb, C.orange]])
        for (const m of set) add(gPts, 'circle', { cx: GX + m * GW / 6, cy: GY - f(m) * GH, r: 9, fill: col, stroke: '#fff', 'stroke-width': 2 });
    }
    // dots along the loop (conventional current: + top-left → right → down → left → up)
    const per = 2 * (R - L) + 2 * (B - T), dots = [];
    for (let i = 0; i < 22; i++) dots.push(add(gDots, 'circle', { r: 7, fill: C.yellow, stroke: '#8a5a00', 'stroke-width': 1.5 }));
    function at(u) {
      u = ((u % per) + per) % per;
      if (u < R - L) return [L + u, T]; u -= R - L;
      if (u < B - T) return [R, T + u]; u -= B - T;
      if (u < R - L) return [R - u, B]; u -= R - L; return [L, B - u];
    }
    const bm = button(s, 60, 520, 70, '−', C.navy, () => { if (n > 0) { n--; draw(); } });
    const bp = button(s, 145, 520, 70, '+', C.navy, () => { if (n < 6) { n++; draw(); } });
    const bt = button(s, 240, 520, 250, 'เปลี่ยนเป็นหลอดไฟ', C.orange, () => { bulb = !bulb; bt.set(bulb, bulb ? 'เปลี่ยนเป็นตัวต้านทาน' : 'เปลี่ยนเป็นหลอดไฟ'); draw(); });
    const bg = button(s, 515, 520, 200, '▶ ให้ประจุไหล', C.green, () => { run = !run; bg.set(run, run ? '⏸ หยุด' : '▶ ให้ประจุไหล'); });
    const bc = button(s, 740, 520, 200, 'ล้างกราฟ', C.grey, () => { pts.r.clear(); pts.b.clear(); draw(); });
    draw();
    dots.forEach((d, i) => { const [x, y] = at(i * per / dots.length); d.setAttribute('cx', x); d.setAttribute('cy', y); });
    return loop((dt) => {
      if (!run) return;
      phase += I() * 260 * dt;
      dots.forEach((d, i) => { const [x, y] = at(phase + i * per / dots.length); d.setAttribute('cx', x); d.setAttribute('cy', y); });
    });
  }

  // ---------- 1C: resistance of a wire, R ∝ L/A, shown in blocks of "the original" ----------
  function wire(el) {
    const s = svgRoot(el);
    const hs = hint(s, 'ลากปลายขวาของลวดเพื่อเปลี่ยนความยาว • ลากขึ้นลงบนลวดเพื่อเปลี่ยนความอ้วน');
    const Ls = [0.5, 1, 2, 3], As = [0.5, 1, 2, 4];
    let li = 1, ai = 1, keepV = false, run = false, phase = 0;
    const X0 = 80, U = 170, Y = 250;           // 1 length unit = 170 px; area 1 = height 60
    const gW = add(s, 'g', {}), gD = add(s, 'g', {}), gBar = add(s, 'g', {});
    const hit = add(s, 'rect', { x: 0, y: 90, width: 700, height: 330, fill: 'transparent' });
    const len = () => Ls[li], area = () => (keepV ? 1 / Ls[li] : As[ai]), Rr = () => len() / area();
    function draw() {
      clear(gW); clear(gBar);
      const w = len() * U, h = 60 * Math.sqrt(area()), x1 = X0 + w;
      add(gW, 'rect', { x: X0, y: Y - h / 2, width: w, height: h, fill: '#d6dae2', stroke: C.ink, 'stroke-width': 3 });
      add(gW, 'ellipse', { cx: x1, cy: Y, rx: h / 5, ry: h / 2, fill: '#b5bcc8', stroke: C.ink, 'stroke-width': 3 });
      add(gW, 'ellipse', { cx: X0, cy: Y, rx: h / 5, ry: h / 2, fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      add(gW, 'circle', { cx: x1 + 26, cy: Y, r: 14, fill: C.blue });
      add(gW, 'text', { x: X0, y: 410, 'font-size': 24, 'font-weight': 700, fill: C.ink }, `ยาว ${len() === 0.5 ? '½' : len()} เท่า • พื้นที่หน้าตัด ${area() === 0.5 ? '½' : area() === 1 / 3 ? '⅓' : area() === 0.25 ? '¼' : area()} เท่าของเดิม`);
      // the R bar, stacked blocks of "the original wire's R", no number written
      const bx = 820, by = 470, bh = 38, r = Rr();
      add(gBar, 'text', { x: bx + 45, y: 80, 'font-size': 22, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }, 'ความต้านทาน');
      const full = Math.floor(r + 1e-9), part = r - full;
      for (let i = 0; i < full; i++) add(gBar, 'rect', { x: bx, y: by - (i + 1) * bh, width: 90, height: bh - 4, fill: C.red, rx: 4 });
      if (part > 1e-6) add(gBar, 'rect', { x: bx, y: by - full * bh - part * bh, width: 90, height: part * bh - 2, fill: C.red, opacity: .65, rx: 3 });
      add(gBar, 'line', { x1: bx - 25, y1: by - bh, x2: bx + 115, y2: by - bh, stroke: C.blue, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
      add(gBar, 'text', { x: bx - 30, y: by - bh + 7, 'font-size': 18, 'text-anchor': 'end', fill: C.blue, 'font-weight': 700 }, 'ของเดิม');
      add(gBar, 'line', { x1: bx - 10, y1: by, x2: bx + 100, y2: by, stroke: C.ink, 'stroke-width': 3 });
    }
    let mode = null, sx = 0, sy = 0, li0 = 1, ai0 = 1;
    dragOn(hit, s, (p, k) => {
      if (k === 'down') { sx = p.x; sy = p.y; li0 = li; ai0 = ai; mode = Math.abs(p.x - (X0 + len() * U)) < 70 ? 'len' : 'area'; return; }
      if (k === 'up') { mode = null; return; }
      if (mode === 'len') { const want = (p.x - X0) / U; let best = 0; Ls.forEach((v, i) => { if (Math.abs(v - want) < Math.abs(Ls[best] - want)) best = i; }); if (best !== li) { li = best; draw(); } }
      else if (mode === 'area' && !keepV) { const k2 = Math.max(0, Math.min(3, ai0 + Math.round((sy - p.y) / 45))); if (k2 !== ai) { ai = k2; draw(); } }
    });
    const bv = button(s, 80, 520, 260, 'โหมดปริมาตรคงที่', C.orange, () => { keepV = !keepV; bv.set(keepV); hs.textContent = keepV ? 'ปริมาตรคงที่: ดึงลวดให้ยาว ลวดจะผอมลงเอง (ทายก่อนว่าแท่งสูงกี่ช่อง)' : 'ลากปลายขวาของลวดเพื่อเปลี่ยนความยาว • ลากขึ้นลงบนลวดเพื่อเปลี่ยนความอ้วน'; draw(); });
    const bg = button(s, 360, 520, 220, '▶ ให้ประจุไหล', C.green, () => { run = !run; bg.set(run, run ? '⏸ หยุด' : '▶ ให้ประจุไหล'); });
    button(s, 600, 520, 150, 'เริ่มใหม่', C.grey, () => { li = 1; ai = 1; draw(); });
    draw();
    const dots = []; for (let i = 0; i < 18; i++) dots.push(add(gD, 'circle', { r: 6, fill: C.yellow, stroke: '#8a5a00', 'stroke-width': 1.5, opacity: 0 }));
    return loop((dt) => {
      if (!run) { dots.forEach((d) => d.setAttribute('opacity', 0)); return; }
      phase += 140 / Rr() * dt;
      const w = len() * U, h = 60 * Math.sqrt(area());
      dots.forEach((d, i) => {
        const u = ((phase + i * 37) % w + w) % w, row = ((i * 7) % 5) / 4 - 0.5;
        d.setAttribute('cx', X0 + u); d.setAttribute('cy', Y + row * (h - 14)); d.setAttribute('opacity', 1);
      });
    });
  }

  window.SC_ANIMS = {
    pages: {
      p01: [{ id: 'gate', x: .9, y: .1, t: 'นับประจุที่ผ่านหน้าตัด' }],
      p05: [{ id: 'ohm', x: .9, y: .26, t: 'เพิ่มถ่าน กระแสเปลี่ยนอย่างไร' }],
      p09: [{ id: 'wire', x: .9, y: .1, t: 'ความยาวและความอ้วนของลวด' }],
    },
    make: { gate, ohm, wire },
    sims: {},
  };
})();
