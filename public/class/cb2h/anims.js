// Page animations for /class/cb2h/ (circular motion + buoyancy). Loaded by index.html when this file exists
// (tools/build-sheet-class.mjs sets CFG.anims). A play button sits on the sheet's figure; tapping it opens the animation
// full screen. Drag in the picture and things follow the finger. Public file: shows physics, never fills in the sheet's blanks.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const C = { ink: '#1f2836', grey: '#8a94a6', line: '#d9dee8', blue: '#1f5fa8', red: '#d62828', orange: '#d9730d', purple: '#7b3fb0',
              green: '#2f7a4f', navy: '#2b3a55', peach: '#db9e89', paper: '#fffdf8' };
  const W = 1000, H = 600;

  // ---------- tiny SVG kit ----------
  function svgRoot(el) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', `0 0 ${W} ${H}`);
    s.style.cssText = 'display:block;width:100%;height:auto;max-height:calc(100dvh - 90px);touch-action:none;font-family:var(--body,"Sarabun",sans-serif)';
    let bg = `<rect width="${W}" height="${H}" fill="${C.paper}"/>`;
    for (let x = 0; x < W; x += 25) bg += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#eef1f6"/>`;
    for (let y = 0; y < H; y += 25) bg += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#eef1f6"/>`;
    s.innerHTML = bg;
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
  // an arrow drawn into a <g> again each frame
  function arrow(g, x1, y1, x2, y2, color, w = 5, dash = false) {
    const a = Math.atan2(y2 - y1, x2 - x1), hd = 18, len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 2) return;
    const bx = x2 - hd * Math.cos(a), by = y2 - hd * Math.sin(a);
    add(g, 'line', { x1, y1, x2: bx, y2: by, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', ...(dash ? { 'stroke-dasharray': '10 7' } : {}) });
    add(g, 'polygon', { points: `${x2},${y2} ${bx + hd * .5 * Math.sin(a)},${by - hd * .5 * Math.cos(a)} ${bx - hd * .5 * Math.sin(a)},${by + hd * .5 * Math.cos(a)}`, fill: color });
  }
  function label(g, x, y, t, color, size = 26, anchor = 'middle', sub) {
    const e = add(g, 'text', { x, y, fill: color, 'font-size': size, 'font-weight': 700, 'text-anchor': anchor }, t);
    if (sub) { add(e, 'tspan', { dy: '0.3em', 'font-size': '70%' }, sub); }
    return e;
  }
  function clear(g) { while (g.firstChild) g.firstChild.remove(); }
  // a pill button inside the picture
  function button(s, x, y, w, text, color, onTap) {
    const g = add(s, 'g', { style: 'cursor:pointer' });
    const r = add(g, 'rect', { x, y, width: w, height: 46, rx: 23, fill: '#fff', stroke: color, 'stroke-width': 2.5 });
    const t = add(g, 'text', { x: x + w / 2, y: y + 31, 'font-size': 21, 'font-weight': 700, fill: color, 'text-anchor': 'middle', 'pointer-events': 'none' }, text);
    g.addEventListener('pointerdown', (e) => { e.stopPropagation(); onTap(); });
    return { g, set(on, txt) { r.setAttribute('fill', on ? color : '#fff'); t.setAttribute('fill', on ? '#fff' : color); if (txt) t.textContent = txt; } };
  }
  // the pointer in picture coordinates
  function pt(s, e) {
    const p = s.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(s.getScreenCTM().inverse());
  }
  // drag anywhere in the picture: onMove(point); returns nothing (listeners die with the svg)
  function draggable(s, onDown, onMove, onUp) {
    let id = null;
    s.addEventListener('pointerdown', (e) => { id = e.pointerId; try { s.setPointerCapture(id); } catch (x) {} onDown && onDown(pt(s, e)); onMove(pt(s, e)); e.preventDefault(); });
    s.addEventListener('pointermove', (e) => { if (e.pointerId === id) onMove(pt(s, e)); });
    const end = (e) => { if (e.pointerId === id) { id = null; onUp && onUp(); } };
    s.addEventListener('pointerup', end); s.addEventListener('pointercancel', end);
  }
  function loop(step) {
    let on = true, last = performance.now();
    const f = (t) => { if (!on) return; step(Math.min(.05, (t - last) / 1000)); last = t; requestAnimationFrame(f); };
    requestAnimationFrame(f);
    return () => { on = false; };
  }

  // ---------- p02 figure 1: a ball going round, v always along the edge, the net force always to the centre ----------
  function circ(el) {
    const s = svgRoot(el);
    const cx = 290, cy = 290, R = 190;
    add(s, 'text', { x: 20, y: 40, 'font-size': 22, 'font-weight': 700, fill: C.grey }, 'ลากลูกบอลไปรอบวง หรือกด ▶');
    add(s, 'circle', { cx, cy, r: R, fill: 'none', stroke: C.grey, 'stroke-width': 2.5, 'stroke-dasharray': '9 7' });
    add(s, 'circle', { cx, cy, r: 6, fill: C.ink }); label(s, cx - 16, cy + 30, 'O', C.ink, 24);
    add(s, 'text', { x: cx, y: cy + R + 50, 'font-size': 19, fill: C.grey, 'text-anchor': 'middle' }, 'มองจากด้านบน');
    const trail = add(s, 'g', {}), live = add(s, 'g', {});
    // right: the two velocities a moment apart, tail to tail, and the change between them
    add(s, 'line', { x1: 560, y1: 20, x2: 560, y2: 530, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    add(s, 'text', { x: 585, y: 40, 'font-size': 22, 'font-weight': 700, fill: C.grey }, 'ความเร็วก่อน–หลัง (ห่างกันนิดเดียว)');
    const vec = add(s, 'g', {});
    let th = -Math.PI / 2 + .6, play = false, showTrail = false, lastMark = null;
    const pb = button(s, 20, 545, 130, '▶ เล่น', C.blue, () => { play = !play; pb.set(play, play ? '❚❚ หยุด' : '▶ เล่น'); });
    const tb = button(s, 162, 545, 210, 'ทิ้งรอย v ไว้', C.purple, () => { showTrail = !showTrail; tb.set(showTrail); clear(trail); lastMark = null; });
    function draw() {
      clear(live);
      const x = cx + R * Math.cos(th), y = cy + R * Math.sin(th);
      const tx = -Math.sin(th), ty = Math.cos(th);          // the way it goes round (clockwise on screen)
      add(live, 'line', { x1: cx, y1: cy, x2: x, y2: y, stroke: C.grey, 'stroke-width': 2 });
      label(live, cx + .3 * (x - cx) + 24 * Math.sin(th), cy + .3 * (y - cy) - 24 * Math.cos(th) + 8, 'r', C.grey, 22);
      arrow(live, x, y, x + 120 * tx, y + 120 * ty, C.blue);
      label(live, x + 145 * tx, y + 145 * ty + 9, 'v', C.blue, 28);
      arrow(live, x, y, x - 105 * Math.cos(th), y - 105 * Math.sin(th), C.orange);
      label(live, x - 128 * Math.cos(th), y - 128 * Math.sin(th) + 9, 'ΣF', C.orange, 24);
      add(live, 'circle', { cx: x, cy: y, r: 17, fill: '#c4cad6', stroke: C.ink, 'stroke-width': 2.5 });
      if (showTrail && (lastMark === null || Math.abs(Math.atan2(Math.sin(th - lastMark), Math.cos(th - lastMark))) > .45)) {
        lastMark = th;
        arrow(trail, x, y, x + 90 * tx, y + 90 * ty, '#9bb7dd', 3);
      }
      // velocity before and after (±0.35 rad), from one point
      clear(vec);
      const ox = 760, oy = 250, L = 140, d = .35;
      const v1 = [-Math.sin(th - d), Math.cos(th - d)], v2 = [-Math.sin(th + d), Math.cos(th + d)];
      arrow(vec, ox, oy, ox + L * v1[0], oy + L * v1[1], '#9bb7dd', 5);
      label(vec, ox + (L + 26) * v1[0], oy + (L + 26) * v1[1] + 8, 'v', '#6f8fbd', 24, 'middle', 'ก่อน');
      arrow(vec, ox, oy, ox + L * v2[0], oy + L * v2[1], C.blue, 5);
      label(vec, ox + (L + 26) * v2[0], oy + (L + 26) * v2[1] + 8, 'v', C.blue, 24, 'middle', 'หลัง');
      arrow(vec, ox + L * v1[0], oy + L * v1[1], ox + L * v2[0], oy + L * v2[1], C.red, 4);
      const mx = ox + L * (v1[0] + v2[0]) / 2, my = oy + L * (v1[1] + v2[1]) / 2;
      const am = Math.hypot(mx - ox, my - oy) || 1;
      label(vec, mx + 40 * (mx - ox) / am, my + 40 * (my - oy) / am + 8, 'Δv', C.red, 24);
      add(vec, 'circle', { cx: ox, cy: oy, r: 5, fill: C.ink });
      // the same direction as ΣF, drawn small beside it
      add(vec, 'text', { x: 585, y: 505, 'font-size': 20, 'font-weight': 700, fill: C.grey }, 'Δv ชี้ทางเดียวกับ ΣF ไหม? ΣF ตอนนี้ →');
      arrow(vec, 950 + 26 * Math.cos(th), 497 + 26 * Math.sin(th), 950 - 26 * Math.cos(th), 497 - 26 * Math.sin(th), C.orange, 4);
    }
    draggable(s, () => { if (play) { play = false; pb.set(false, '▶ เล่น'); } }, (p) => {
      if (p.x > 560 || p.y > 530) return;
      th = Math.atan2(p.y - cy, p.x - cx); draw();
    });
    draw();
    return loop((dt) => { if (play) { th += dt * 1.6; draw(); } });
  }

  // ---------- p02 figure 2: the string breaks, the ball goes straight on from where it was ----------
  function cut(el) {
    const s = svgRoot(el);
    const cx = 330, cy = 300, R = 180;
    add(s, 'text', { x: 20, y: 40, 'font-size': 22, 'font-weight': 700, fill: C.grey }, 'ลากลูกบอลไปตรงไหนก็ได้ แล้วกด ✂ ตัดเชือก');
    add(s, 'circle', { cx, cy, r: R, fill: 'none', stroke: C.grey, 'stroke-width': 2.5, 'stroke-dasharray': '9 7' });
    add(s, 'circle', { cx, cy, r: 7, fill: C.ink });
    add(s, 'text', { x: cx, y: cy + R + 50, 'font-size': 19, fill: C.grey, 'text-anchor': 'middle' }, 'ลูกบอลหมุนบนโต๊ะลื่น · มองจากด้านบน');
    const path = add(s, 'g', {}), live = add(s, 'g', {});
    let th = -Math.PI / 2, w = 2.2, state = 'spin', bx = 0, by = 0, vx = 0, vy = 0, t0 = 0;
    const cb = button(s, 20, 545, 170, '✂ ตัดเชือก', C.red, () => {
      if (state !== 'spin') return;
      state = 'free'; bx = cx + R * Math.cos(th); by = cy + R * Math.sin(th);
      const sp = w * R; vx = -Math.sin(th) * sp; vy = Math.cos(th) * sp; t0 = 0; cb.set(true);
      clear(path); add(path, 'circle', { cx: bx, cy: by, r: 6, fill: C.red });
    });
    button(s, 202, 545, 150, '↺ เริ่มใหม่', C.navy, () => { state = 'spin'; cb.set(false); clear(path); });
    function draw() {
      clear(live);
      let x, y, red = false;
      if (state === 'spin') {
        x = cx + R * Math.cos(th); y = cy + R * Math.sin(th);
        add(live, 'line', { x1: cx, y1: cy, x2: x, y2: y, stroke: C.ink, 'stroke-width': 3 });
        arrow(live, x, y, x + 90 * -Math.sin(th), y + 90 * Math.cos(th), C.blue, 4);
        label(live, x + 112 * -Math.sin(th), y + 112 * Math.cos(th) + 8, 'v', C.blue, 24);
      } else {
        x = bx; y = by; red = true;
        // the broken string stays with the centre
        add(live, 'line', { x1: cx, y1: cy, x2: cx + 40 * Math.cos(th), y2: cy + 40 * Math.sin(th), stroke: C.ink, 'stroke-width': 3 });
        const sp = Math.hypot(vx, vy);
        arrow(live, x, y, x + 90 * vx / sp, y + 90 * vy / sp, C.blue, 4);
      }
      add(live, 'circle', { cx: x, cy: y, r: 17, fill: red ? C.red : '#c4cad6', stroke: C.ink, 'stroke-width': 2.5 });
    }
    draggable(s, null, (p) => { if (state !== 'spin' || p.y > 530) return; th = Math.atan2(p.y - cy, p.x - cx); draw(); });
    draw();
    return loop((dt) => {
      if (state === 'spin') { th += w * dt * .6; draw(); return; }
      if (state === 'free') {
        bx += vx * dt * .6; by += vy * dt * .6; t0 += dt;
        if (Math.floor(t0 * 10) !== Math.floor((t0 - dt) * 10)) add(path, 'circle', { cx: bx, cy: by, r: 4, fill: C.red, opacity: .6 });
        if (bx < -40 || bx > 1040 || by < -40 || by > 640) state = 'gone';
        draw();
      }
    });
  }

  window.SC_ANIMS = {
    pages: {
      p02: [{ id: 'circ', x: .86, y: .31, t: 'วัตถุเคลื่อนที่เป็นวงกลม: v กับ ΣF' }, { id: 'cut', x: .86, y: .655, t: 'ถ้าเชือกขาด ลูกบอลไปทางไหน' }],
    },
    make: { circ, cut },
  };
})();
