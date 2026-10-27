// Page animations for /class/heat5/ (heat: whole-chapter exam + drill). Loaded by index.html when this file exists
// (tools/build-sheet-class.mjs sets CFG.anims). A play button sits on the sheet's figure; tapping it opens the animation
// full screen. Public file: shows the physics with its own numbers (never the sheet's), so it never answers a question.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const C = { ink: '#1f2836', grey: '#8a94a6', line: '#d9dee8', blue: '#1f5fa8', red: '#d62828', orange: '#d9730d',
              purple: '#7b3fb0', green: '#2f7a4f', ice: '#cfe8f7', water: '#9fd3f0', hot: '#f6b8a8', gold: '#f5b301' };
  const W = 1000, H = 560;

  function svgRoot(el) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', `0 0 ${W} ${H}`);
    s.style.cssText = 'display:block;width:100%;height:auto;max-height:calc(100dvh - 170px);touch-action:none;font-family:var(--body,"Sarabun",sans-serif)';
    el.appendChild(s);
    return s;
  }
  function add(parent, tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    return e;
  }
  // a row of option buttons under the picture: [{label, opts: [[text, value]], val, on(v)}] + extra buttons
  function controls(el, groups, extra) {
    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;padding:10px 4px 0;font:600 15px var(--body,sans-serif)';
    const btn = (t, on, pressed) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = t;
      b.style.cssText = 'min-height:42px;min-width:54px;border-radius:10px;border:1.5px solid #1f5fa8;background:#fff;color:#1f5fa8;font:700 15px var(--display,sans-serif);padding:0 12px';
      b.onclick = on;
      return b;
    };
    const paint = (row, v) => [...row.querySelectorAll('button')].forEach((b) => {
      const on = b.dataset.v === String(v);
      b.style.background = on ? '#1f5fa8' : '#fff'; b.style.color = on ? '#fff' : '#1f5fa8';
    });
    for (const g of groups) {
      const row = document.createElement('span');
      row.style.cssText = 'display:inline-flex;gap:6px;align-items:center';
      row.append(g.label);
      for (const [t, v] of g.opts) { const b = btn(t, () => { g.on(v); paint(row, v); }); b.dataset.v = v; row.appendChild(b); }
      paint(row, g.val);
      bar.appendChild(row);
    }
    const out = {};
    for (const [k, t, on] of extra || []) { const b = btn(t, on); b.style.background = '#1f5fa8'; b.style.color = '#fff'; bar.appendChild(b); out[k] = b; }
    el.appendChild(bar);
    return out;
  }
  // a thermometer: returns set(T) for T in [lo, hi]
  function thermo(s, x, y, h, lo, hi, color) {
    add(s, 'rect', { x: x - 9, y, width: 18, height: h, rx: 9, fill: '#fff', stroke: C.ink, 'stroke-width': 2 });
    add(s, 'circle', { cx: x, cy: y + h + 12, r: 17, fill: color, stroke: C.ink, 'stroke-width': 2 });
    const col = add(s, 'rect', { x: x - 5, y, width: 10, height: 0, fill: color });
    for (let t = lo; t <= hi; t += 20) {
      const yy = y + h - (t - lo) / (hi - lo) * h;
      add(s, 'line', { x1: x + 9, y1: yy, x2: x + 17, y2: yy, stroke: C.ink, 'stroke-width': 1.5 });
      add(s, 'text', { x: x + 21, y: yy + 5, 'font-size': 15, fill: C.grey }, t);
    }
    const lab = add(s, 'text', { x, y: y - 14, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: C.ink });
    return (T) => {
      const f = Math.max(0, Math.min(1, (T - lo) / (hi - lo)));
      col.setAttribute('y', y + h - f * h + 2); col.setAttribute('height', f * h + 10);
      lab.textContent = (Math.round(T * 10) / 10).toFixed(1) + ' °C';
    };
  }
  function loop(step) {
    let raf = 0, last = 0, dead = false;
    const f = (t) => { if (dead) return; const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t; step(dt); raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => { dead = true; cancelAnimationFrame(raf); };
  }

  // ---------- an electric kettle: P joules every second go into the water (Q = P × t = m c ΔT) ----------
  function kettle(el) {
    const s = svgRoot(el), c = 4200, T0 = 25;
    const S = { P: 2000, m: 1, T: T0, t: 0, run: false, E: 0 };
    // the kettle
    add(s, 'rect', { x: 120, y: 470, width: 300, height: 26, rx: 8, fill: '#c9cfdb', stroke: C.ink, 'stroke-width': 2 });
    const water = add(s, 'rect', { x: 150, y: 250, width: 240, height: 210, fill: C.water });
    add(s, 'path', { d: 'M150 200 L150 460 Q150 470 160 470 L380 470 Q390 470 390 460 L390 200 Z', fill: 'none', stroke: C.ink, 'stroke-width': 4 });
    add(s, 'path', { d: 'M390 240 Q470 250 450 340 Q440 400 390 410', fill: 'none', stroke: C.ink, 'stroke-width': 10, 'stroke-linecap': 'round' });
    add(s, 'path', { d: 'M150 230 L95 190', stroke: C.ink, 'stroke-width': 10, 'stroke-linecap': 'round' });
    add(s, 'rect', { x: 140, y: 185, width: 260, height: 18, rx: 8, fill: '#64748b' });
    const coil = add(s, 'path', { d: 'M170 452 q15 -14 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0', fill: 'none', stroke: C.grey, 'stroke-width': 5 });
    const bubbles = add(s, 'g', {});
    const pLab = add(s, 'text', { x: 270, y: 520, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: C.ink });
    const mLab = add(s, 'text', { x: 270, y: 300, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#0b4f7a' });
    const setT = thermo(s, 560, 120, 300, 0, 100, C.red);
    // the energy meter
    add(s, 'text', { x: 680, y: 70, 'font-size': 22, 'font-weight': 700, fill: C.ink }, 'พลังงานที่ให้น้ำ');
    add(s, 'rect', { x: 680, y: 90, width: 280, height: 30, rx: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 2 });
    const bar = add(s, 'rect', { x: 682, y: 92, width: 0, height: 26, rx: 6, fill: C.gold });
    const eLab = add(s, 'text', { x: 680, y: 150, 'font-size': 20, fill: C.ink });
    const tLab = add(s, 'text', { x: 680, y: 210, 'font-size': 26, 'font-weight': 700, fill: C.blue });
    const r1 = add(s, 'text', { x: 680, y: 270, 'font-size': 19, fill: C.ink });
    const r2 = add(s, 'text', { x: 680, y: 300, 'font-size': 19, fill: C.ink });
    const r3 = add(s, 'text', { x: 680, y: 350, 'font-size': 19, 'font-weight': 700, fill: C.purple });
    const tip = add(s, 'text', { x: 680, y: 400, 'font-size': 17, fill: C.grey });
    add(s, 'text', { x: 680, y: 430, 'font-size': 17, fill: C.grey }, 'ไม่มีความร้อนสูญเสีย · เวลาจำลองเร่งให้เร็วขึ้น');
    const need = () => S.m * c * (100 - T0);
    function draw() {
      pLab.textContent = 'กำลัง ' + S.P.toLocaleString() + ' W = ' + S.P.toLocaleString() + ' J ทุก 1 วินาที';
      mLab.textContent = 'น้ำ ' + S.m + ' kg';
      water.setAttribute('y', 460 - 110 * S.m - 40); water.setAttribute('height', 110 * S.m + 40);
      water.setAttribute('fill', S.T > 60 ? '#b9d9ec' : C.water);
      coil.setAttribute('stroke', S.run && S.T < 100 ? C.orange : C.grey);
      setT(S.T);
      bar.setAttribute('width', Math.min(276, 276 * S.E / need()));
      eLab.textContent = 'Q = ' + Math.round(S.E).toLocaleString() + ' J';
      tLab.textContent = 'เวลา ' + Math.round(S.t) + ' s';
      r1.textContent = 'ทุก 1 วินาที: น้ำได้ ' + S.P.toLocaleString() + ' J';
      r2.textContent = 'น้ำร้อนขึ้น ' + (S.P / (S.m * c)).toFixed(2) + ' °C ทุกวินาที';
      r3.textContent = S.T >= 100 ? 'เดือดแล้ว! P × t = m c ΔT' : '';
      tip.textContent = S.T >= 100 ? '' : 'ลองเปลี่ยนกำลังไฟ หรือมวลน้ำ แล้วกดต้ม';
    }
    const reset = () => { S.T = T0; S.t = 0; S.E = 0; S.run = false; bubbles.innerHTML = ''; draw(); };
    controls(el, [
      { label: 'กำลังไฟ', val: S.P, opts: [['1000 W', 1000], ['2000 W', 2000], ['3000 W', 3000]], on: (v) => { S.P = v; reset(); } },
      { label: 'น้ำ', val: S.m, opts: [['0.5 kg', 0.5], ['1 kg', 1], ['2 kg', 2]], on: (v) => { S.m = v; reset(); } },
    ], [['go', 'ต้ม ▶', () => { if (S.T >= 100) reset(); S.run = true; }], ['re', 'เริ่มใหม่', reset]]);
    draw();
    let bt = 0;
    return loop((dt) => {
      if (!S.run || S.T >= 100) return;
      const sim = dt * 40;                                  // 1 real second = 40 simulated seconds
      S.t += sim; S.E += S.P * sim; S.T = Math.min(100, T0 + S.E / (S.m * c));
      if (S.T >= 100) { S.t = need() / S.P; S.E = need(); }
      bt += dt;
      if (S.T > 70 && bt > 0.12) {
        bt = 0;
        const b = add(bubbles, 'circle', { cx: 170 + Math.random() * 200, cy: 450, r: 3 + Math.random() * 5, fill: '#fff', opacity: 0.8 });
        b.animate([{ transform: 'translateY(0)' }, { transform: `translateY(-${80 + 110 * S.m}px)`, opacity: 0 }], { duration: 900 });
        setTimeout(() => b.remove(), 880);
      }
      draw();
    });
  }

  // ---------- ice below 0 °C into warm water: warm the ice to 0, melt it, warm the melted water; the hot water pays for all ----------
  function icewater(el) {
    const s = svgRoot(el), c = 4200, ci = 2100, L = 336000;
    const S = { mi: 0.05, Ti: -20, mw: 0.3, Tw: 70, run: false };
    let st;
    const reset = () => {
      st = { Ti: S.Ti, Tw: S.Tw, melt: 0, Tm: 0, q1: 0, q2: 0, q3: 0, lost: 0, done: false };
      S.run = false; draw();
    };
    // the beaker
    add(s, 'path', { d: 'M90 140 L110 470 Q112 490 132 490 L348 490 Q368 490 370 470 L390 140', fill: 'none', stroke: C.ink, 'stroke-width': 4 });
    const water = add(s, 'path', { fill: C.hot });
    const cube = add(s, 'rect', { rx: 8, fill: C.ice, stroke: '#5b9cc9', 'stroke-width': 3 });
    const cubeT = add(s, 'text', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#0b4f7a' });
    const setW = thermo(s, 450, 110, 300, -20, 80, C.red);
    add(s, 'text', { x: 450, y: 470, 'text-anchor': 'middle', 'font-size': 17, fill: C.grey }, 'น้ำร้อน');
    // energy bars: what the ice takes (3 steps) vs what the hot water gives
    const X0 = 560, BW = 400;
    add(s, 'text', { x: X0, y: 60, 'font-size': 22, 'font-weight': 700, fill: C.ink }, 'น้ำแข็ง "รับ" ความร้อน');
    const labels = [['① น้ำแข็งร้อนขึ้นถึง 0 °C', 'm c น้ำแข็ง ΔT', '#7fb8e0'], ['② ละลายที่ 0 °C', 'm L', '#5b6ee1'], ['③ น้ำที่ละลายร้อนขึ้น', 'm c น้ำ ΔT', '#38a3a5']];
    const bars = labels.map(([t, f, col], k) => {
      const y = 85 + k * 72;
      add(s, 'text', { x: X0, y, 'font-size': 17, fill: C.ink }, t);
      add(s, 'text', { x: X0 + BW, y, 'text-anchor': 'end', 'font-size': 16, fill: C.grey }, f);
      add(s, 'rect', { x: X0, y: y + 8, width: BW, height: 24, rx: 6, fill: '#f1f3f7' });
      return { r: add(s, 'rect', { x: X0, y: y + 8, width: 0, height: 24, rx: 6, fill: col }), v: add(s, 'text', { x: X0 + 6, y: y + 26, 'font-size': 15, 'font-weight': 700, fill: C.ink }) };
    });
    add(s, 'text', { x: X0, y: 320, 'font-size': 22, 'font-weight': 700, fill: C.red }, 'น้ำร้อน "คาย" ความร้อน');
    add(s, 'rect', { x: X0, y: 330, width: BW, height: 24, rx: 6, fill: '#f1f3f7' });
    const lost = add(s, 'rect', { x: X0, y: 330, width: 0, height: 24, rx: 6, fill: C.red });
    const lostV = add(s, 'text', { x: X0 + 6, y: 348, 'font-size': 15, 'font-weight': 700, fill: '#fff' });
    const eq = add(s, 'text', { x: X0, y: 395, 'font-size': 19, 'font-weight': 700, fill: C.purple });
    const note = add(s, 'text', { x: X0, y: 430, 'font-size': 17, fill: C.grey });
    add(s, 'text', { x: X0, y: 460, 'font-size': 16, fill: C.grey }, 'ภาชนะไม่รับความร้อน ไม่มีความร้อนสูญเสีย · ค่าตัวอย่าง');
    const scale = () => S.mw * c * (S.Tw + 20);              // the bars share one scale
    function draw() {
      if (!st) return;
      const lvl = 470 - 300 * S.mw - 40 - 120 * st.melt * S.mi;
      water.setAttribute('d', `M${100 + (lvl - 140) * 0.06} ${lvl} L110 470 Q112 490 132 490 L348 490 Q368 490 370 470 L${380 - (lvl - 140) * 0.06} ${lvl} Z`);
      const t = Math.max(0, Math.min(1, (st.Tw - 0) / 70));
      water.setAttribute('fill', `rgb(${Math.round(159 + 87 * t)},${Math.round(211 - 27 * t)},${Math.round(240 - 72 * t)})`);
      const side = 40 + 90 * Math.cbrt((1 - st.melt) * S.mi / 0.15);
      cube.setAttribute('x', 240 - side / 2); cube.setAttribute('y', lvl - side * 0.2); cube.setAttribute('width', side); cube.setAttribute('height', side);
      cube.setAttribute('opacity', st.melt >= 1 ? 0 : 0.95);
      cubeT.setAttribute('x', 240); cubeT.setAttribute('y', lvl - side * 0.2 - 10);
      cubeT.textContent = st.melt >= 1 ? 'ละลายหมด ' + st.Tm.toFixed(1) + ' °C' : st.melt > 0 ? 'ละลายแล้ว ' + Math.round(st.melt * 100) + '% · 0 °C' : 'น้ำแข็ง ' + st.Ti.toFixed(1) + ' °C';
      setW(st.Tw);
      const sc = BW / scale();
      [st.q1, st.q2, st.q3].forEach((q, k) => { bars[k].r.setAttribute('width', Math.min(BW, q * sc)); bars[k].v.textContent = q > 0 ? Math.round(q).toLocaleString() + ' J' : ''; });
      lost.setAttribute('width', Math.min(BW, st.lost * sc)); lostV.textContent = st.lost > 0 ? Math.round(st.lost).toLocaleString() + ' J' : '';
      eq.textContent = st.lost > 0 ? '① + ② + ③ = ความร้อนที่น้ำร้อนคาย' : '';
      note.textContent = st.done ? (st.melt < 1 ? 'สมดุลที่ 0 °C: น้ำแข็งละลายไม่หมด!' : 'สมดุลแล้ว ทั้งหมด ' + st.Tw.toFixed(1) + ' °C') : S.run ? 'กำลังแลกเปลี่ยนความร้อน…' : 'เลือกค่า แล้วกด ใส่น้ำแข็ง';
    }
    controls(el, [
      { label: 'น้ำแข็ง', val: S.mi, opts: [['50 g', 0.05], ['150 g', 0.15], ['300 g', 0.3]], on: (v) => { S.mi = v; reset(); } },
      { label: 'อุณหภูมิน้ำแข็ง', val: S.Ti, opts: [['−10 °C', -10], ['−30 °C', -30]], on: (v) => { S.Ti = v; reset(); } },
    ], [['go', 'ใส่น้ำแข็ง ▶', () => { if (st.done) reset(); S.run = true; }], ['re', 'เริ่มใหม่', reset]]);
    reset();
    return loop((dt) => {
      if (!S.run || st.done) return;
      for (let k = 0; k < 40; k++) {
        const Tice = st.melt >= 1 ? st.Tm : st.melt > 0 ? 0 : st.Ti;
        let q = (st.Tw - Tice) * 400 * dt / 40;           // J moved this sub-step: more when the gap is big
        if (st.Tw - Tice < 0.05) { st.done = true; break; }
        q = Math.min(q, (st.Tw - Tice) * S.mw * c * 0.5);
        st.Tw -= q / (S.mw * c); st.lost += q;
        if (st.melt === 0 && st.Ti < 0) {                   // ① the ice warms
          const room = -st.Ti * S.mi * ci, use = Math.min(q, room);
          st.Ti += use / (S.mi * ci); st.q1 += use; q -= use;
          if (st.Ti > -1e-6) st.Ti = 0;
        }
        if (q > 0 && st.Ti >= 0 && st.melt < 1) {           // ② it melts at 0 °C
          const room = (1 - st.melt) * S.mi * L, use = Math.min(q, room);
          st.melt += use / (S.mi * L); st.q2 += use; q -= use;
          if (st.melt > 1 - 1e-9) st.melt = 1;
          if (st.Tw <= 0.001 && st.melt < 1) { st.Tw = 0; st.done = true; break; }
        }
        if (q > 0 && st.melt >= 1) {                        // ③ the melted water warms
          st.Tm += q / (S.mi * c); st.q3 += q;
        }
        if (st.Tw <= 0) { st.Tw = 0; st.done = true; break; }
      }
      draw();
    });
  }

  window.SC_ANIMS = {
    pages: {
      p43: [{ id: 'icewater', x: .9, y: .2, t: 'น้ำแข็งติดลบ ลงน้ำร้อน: ความร้อนไปไหนบ้าง' }],
      p48: [{ id: 'kettle', x: .9, y: .2, t: 'กาต้มน้ำไฟฟ้า: P × t = m c ΔT' }],
    },
    make: { icewater, kettle },
  };
})();
