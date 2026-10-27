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
    // the graph-paper background is CSS on the svg (#hbBody svg in the shell), so animating never repaints it
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
    add(s, 'text', { x: 585, y: 40, 'font-size': 22, 'font-weight': 700, fill: C.grey }, 'v ก่อน–หลัง ที่ตำแหน่งเดียวกัน');
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
      // the same ball on a copy of the circle: velocity a moment before and after, tail to tail at the ball,
      // and the change between them moved to start at the ball, so it is seen pointing at the centre
      clear(vec);
      const ox = 780, oy = 265, r2 = 140, L = 115, d = .5;
      const px = ox + r2 * Math.cos(th), py = oy + r2 * Math.sin(th);
      const arc = (a0, a1) => `M${ox + r2 * Math.cos(a0)},${oy + r2 * Math.sin(a0)} A${r2},${r2} 0 0 1 ${ox + r2 * Math.cos(a1)},${oy + r2 * Math.sin(a1)}`;
      add(vec, 'circle', { cx: ox, cy: oy, r: r2, fill: 'none', stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 8' });
      add(vec, 'path', { d: arc(th - 1.1, th + 1.1), fill: 'none', stroke: C.grey, 'stroke-width': 3 });
      add(vec, 'line', { x1: px, y1: py, x2: ox, y2: oy, stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': '5 6' });
      add(vec, 'circle', { cx: ox, cy: oy, r: 6, fill: C.ink });
      label(vec, ox, py > oy + 20 ? oy - 16 : oy + 30, 'ศูนย์กลาง', C.ink, 18);
      const v1 = [-Math.sin(th - d), Math.cos(th - d)], v2 = [-Math.sin(th + d), Math.cos(th + d)];
      const t1 = [px + L * v1[0], py + L * v1[1]], t2 = [px + L * v2[0], py + L * v2[1]];
      arrow(vec, px, py, t1[0], t1[1], '#9bb7dd', 5);
      label(vec, px + (L + 24) * v1[0], py + (L + 24) * v1[1] + 8, 'v', '#6f8fbd', 22, 'middle', 'ก่อน');
      arrow(vec, px, py, t2[0], t2[1], C.blue, 5);
      label(vec, px + (L + 24) * v2[0], py + (L + 24) * v2[1] + 8, 'v', C.blue, 22, 'middle', 'หลัง');
      arrow(vec, t1[0], t1[1], t2[0], t2[1], C.red, 3, true);
      const dx = t2[0] - t1[0], dy = t2[1] - t1[1];
      arrow(vec, px, py, px + dx, py + dy, C.red, 5);
      label(vec, px + dx * .55 + 24 * Math.sin(th), py + dy * .55 - 24 * Math.cos(th) + 8, 'Δv', C.red, 24);
      add(vec, 'circle', { cx: px, cy: py, r: 12, fill: '#c4cad6', stroke: C.ink, 'stroke-width': 2 });
      // the same direction as ΣF, drawn small beside it
      add(vec, 'text', { x: 585, y: 522, 'font-size': 20, 'font-weight': 700, fill: C.grey }, 'Δv ชี้ทางเดียวกับ ΣF ไหม? ΣF ตอนนี้ →');
      arrow(vec, 950 + 26 * Math.cos(th), 514 + 26 * Math.sin(th), 950 - 26 * Math.cos(th), 514 - 26 * Math.sin(th), C.orange, 4);
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

  // ---------- shared bits for the pages below ----------
  const title = (s, t) => add(s, 'text', { x: 20, y: 40, 'font-size': 22, 'font-weight': 700, fill: C.grey }, t);
  const note = (s, x, y, t, color = C.grey, size = 19, anchor = 'middle') => add(s, 'text', { x, y, 'font-size': size, 'font-weight': 700, fill: color, 'text-anchor': anchor }, t);
  // a vertical meter: value v (1 = the dashed reference line)
  function meter(g, x, top, bot, v, color, name, ref) {
    const mid = (top + bot) / 2, h = Math.max(0, Math.min(v, 2)) * (bot - mid);
    add(g, 'rect', { x: x - 26, y: top, width: 52, height: bot - top, rx: 8, fill: '#fff', stroke: C.line, 'stroke-width': 2 });
    add(g, 'rect', { x: x - 20, y: bot - h, width: 40, height: h, rx: 5, fill: color, opacity: .85 });
    if (ref !== false) add(g, 'line', { x1: x - 40, y1: mid, x2: x + 40, y2: mid, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    if (ref) note(g, x + 46, mid + 6, ref, C.ink, 17, 'start');
    note(g, x, bot + 28, name, color, 18);
  }
  function carSide(g, x, y, ang, color = C.blue) {
    const c = add(g, 'g', { transform: `translate(${x},${y}) rotate(${ang})` });
    add(c, 'rect', { x: -48, y: -40, width: 96, height: 28, rx: 8, fill: color });
    add(c, 'path', { d: 'M-26,-40 l10,-18 h32 l12,18 Z', fill: color, opacity: .85 });
    add(c, 'circle', { cx: -28, cy: -10, r: 11, fill: C.ink }); add(c, 'circle', { cx: 28, cy: -10, r: 11, fill: C.ink });
    return c;
  }
  function carTop(g, x, y, ang, color = C.blue) {
    const c = add(g, 'g', { transform: `translate(${x},${y}) rotate(${ang})` });
    add(c, 'rect', { x: -16, y: -30, width: 32, height: 60, rx: 8, fill: color });
    add(c, 'rect', { x: -12, y: -26, width: 24, height: 14, rx: 3, fill: '#fff', opacity: .7 });
  }
  function tankBox(g, x0, x1, top, bot, level, fill = '#cfe3f5') {
    add(g, 'rect', { x: x0, y: level, width: x1 - x0, height: bot - level, fill });
    add(g, 'path', { d: `M${x0},${top} V${bot} H${x1} V${top}`, fill: 'none', stroke: C.navy, 'stroke-width': 5 });
  }

  // ---------- p03: a flat curve; on ice there is no friction, so the car goes straight on ----------
  function ice(el) {
    const s = svgRoot(el);
    const cx = 330, cy = 300, R = 180;
    title(s, 'ลากรถไปตรงไหนก็ได้ แล้วกด 🧊 ถนนกลายเป็นน้ำแข็ง');
    add(s, 'circle', { cx, cy, r: R, fill: 'none', stroke: '#c9ced8', 'stroke-width': 60 });
    add(s, 'circle', { cx, cy, r: R, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '12 10' });
    add(s, 'circle', { cx, cy, r: 6, fill: C.grey });
    note(s, cx, cy + R + 60, 'รถเลี้ยวบนถนนราบ · มองจากด้านบน');
    const iceG = add(s, 'g', {}), path = add(s, 'g', {}), live = add(s, 'g', {});
    let th = -Math.PI / 2, w = 1.1, state = 'turn', bx = 0, by = 0, vx = 0, vy = 0, t0 = 0;
    const ib = button(s, 20, 545, 300, '🧊 ถนนกลายเป็นน้ำแข็ง', C.blue, () => {
      if (state !== 'turn') return;
      state = 'free'; bx = cx + R * Math.cos(th); by = cy + R * Math.sin(th);
      vx = Math.sin(th) * w * R; vy = -Math.cos(th) * w * R; t0 = 0; ib.set(true);
      add(iceG, 'circle', { cx, cy, r: R, fill: 'none', stroke: '#e3f3ff', 'stroke-width': 60, opacity: .9 });
      clear(path);
    });
    button(s, 332, 545, 150, '↺ เริ่มใหม่', C.navy, () => { state = 'turn'; ib.set(false); clear(path); clear(iceG); });
    function draw() {
      clear(live);
      if (state === 'turn') carTop(live, cx + R * Math.cos(th), cy + R * Math.sin(th), th * 180 / Math.PI);
      else if (state === 'free') carTop(live, bx, by, Math.atan2(vy, vx) * 180 / Math.PI + 90, C.red);
    }
    draggable(s, null, (p) => { if (state !== 'turn' || p.y > 530) return; th = Math.atan2(p.y - cy, p.x - cx); draw(); });
    draw();
    return loop((dt) => {
      if (state === 'turn') { th -= w * dt; draw(); return; }
      if (state === 'free') {
        bx += vx * dt; by += vy * dt; t0 += dt;
        if (Math.floor(t0 * 8) !== Math.floor((t0 - dt) * 8)) add(path, 'circle', { cx: bx, cy: by, r: 4, fill: C.red, opacity: .6 });
        if (bx < -60 || bx > 1060 || by < -60 || by > 660) state = 'gone';
        draw();
      }
    });
  }

  // ---------- p06: over a hump and through a dip; what a scale under the driver reads ----------
  function hill(el) {
    const s = svgRoot(el);
    const road = (x) => 330 - 130 * Math.exp(-(((x - 250) / 105) ** 2)) + 130 * Math.exp(-(((x - 560) / 105) ** 2));
    const d2 = (x) => (road(x + 2) - 2 * road(x) + road(x - 2)) / 4;
    title(s, 'ลากรถไปตามถนน หรือกด ▶ · เลือกความเร็ว');
    let d = 'M20,' + road(20);
    for (let x = 24; x <= 760; x += 4) d += ' L' + x + ',' + road(x).toFixed(1);
    add(s, 'path', { d: d + ' L760,560 L20,560 Z', fill: '#efe7d8' });
    add(s, 'path', { d, fill: 'none', stroke: C.navy, 'stroke-width': 5 });
    note(s, 250, 105, 'ยอดเนิน'); note(s, 560, 500, 'ก้นแอ่ง');
    add(s, 'line', { x1: 790, y1: 20, x2: 790, y2: 530, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    note(s, 895, 70, 'ตาชั่งใต้ก้นคนขับ', C.grey, 18);
    const live = add(s, 'g', {}), mt = add(s, 'g', {});
    let x = 60, play = false, k = 18;
    const pb = button(s, 20, 545, 120, '▶ เล่น', C.blue, () => { play = !play; pb.set(play, play ? '❚❚ หยุด' : '▶ เล่น'); });
    const speeds = [['ช้า', 10], ['เร็ว', 30], ['เร็วมาก', 50]], sb = [];
    speeds.forEach(([t, v], i) => sb.push(button(s, 152 + i * 132, 545, 120, t, C.purple, () => { k = v; sb.forEach((b, j) => b.set(j === i)); draw(); })));
    sb[0].set(true); k = 10;
    function draw() {
      clear(live); clear(mt);
      const y = road(x), ang = Math.atan2(road(x + 3) - road(x - 3), 6) * 180 / Math.PI;
      let n = Math.cos(ang * Math.PI / 180) - k * d2(x), lift = 0;
      if (n < 0) { lift = Math.min(40, -n * 40); n = 0; }
      carSide(live, x, y - lift, ang, n === 0 ? C.red : C.blue);
      if (n === 0) note(live, x + 120, y - 40, 'ลอยพ้นถนน!', C.red, 20);
      meter(mt, 870, 110, 450, n, C.orange, 'ค่าที่อ่านได้', 'mg');
    }
    draggable(s, () => { if (play) { play = false; pb.set(false, '▶ เล่น'); } }, (p) => { if (p.x > 770 || p.y > 530) return; x = Math.max(50, Math.min(740, p.x)); draw(); });
    draw();
    return loop((dt) => { if (play) { x += dt * (60 + 4 * k); if (x > 740) x = 50; draw(); } });
  }

  // ---------- p07: a ball on a string in a vertical circle; the string tension all the way round ----------
  function vert(el) {
    const s = svgRoot(el);
    const cx = 300, cy = 290, R = 180;
    title(s, 'กด ▶ หรือลากลูกบอล · เลือกความเร็วที่ล่างสุด');
    add(s, 'circle', { cx, cy, r: R, fill: 'none', stroke: C.grey, 'stroke-width': 2.5, 'stroke-dasharray': '9 7' });
    add(s, 'circle', { cx, cy, r: 7, fill: C.ink });
    note(s, cx, cy - R - 26, 'บนสุด', C.grey, 17); note(s, cx, cy + R + 40, 'ล่างสุด', C.grey, 17);
    add(s, 'line', { x1: 620, y1: 20, x2: 620, y2: 530, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    note(s, 800, 70, 'แรงตึงเชือก', C.grey, 18);
    const trail = add(s, 'g', {}), live = add(s, 'g', {}), mt = add(s, 'g', {});
    // u = v² / gR at the bottom; at angle f from the bottom u(f) = ub − 2(1 − cos f), T/mg = u + cos f
    let ub = 6, f = 0, play = true, free = null;
    const pb = button(s, 20, 545, 120, '❚❚ หยุด', C.blue, () => { play = !play; pb.set(play, play ? '❚❚ หยุด' : '▶ เล่น'); });
    pb.set(true);
    const opts = [['เร็ว', 6], ['พอดี', 5], ['ช้าไป', 4]], ob = [];
    opts.forEach(([t, v], i) => ob.push(button(s, 152 + i * 120, 545, 108, t, C.purple, () => { ub = v; f = 0; free = null; clear(trail); ob.forEach((b, j) => b.set(j === i)); draw(); })));
    ob[0].set(true);
    const pos = (a) => [cx + R * Math.sin(a), cy + R * Math.cos(a)];   // f = 0 at the bottom, going round anticlockwise on screen
    function draw() {
      clear(live); clear(mt);
      let x, y, T;
      if (free) { x = cx + R * free.x; y = cy - R * free.y; T = 0;
        add(live, 'path', { d: `M${cx},${cy} Q${(cx + x) / 2 + 30},${(cy + y) / 2 + 30} ${x},${y}`, fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '3 5' });
      } else {
        [x, y] = pos(f); T = Math.max(0, ub - 2 * (1 - Math.cos(f)) + Math.cos(f));
        add(live, 'line', { x1: cx, y1: cy, x2: x, y2: y, stroke: C.ink, 'stroke-width': 1.5 + T * 1.2 });
      }
      add(live, 'circle', { cx: x, cy: y, r: 17, fill: free ? C.red : C.peach, stroke: C.ink, 'stroke-width': 2.5 });
      meter(mt, 790, 110, 450, T / 4, C.blue, free ? 'เชือกหย่อน!' : 'T', false);
    }
    draggable(s, () => { if (play) { play = false; pb.set(false, '▶ เล่น'); } }, (p) => {
      if (p.x > 600 || p.y > 530 || free) return;
      const a = Math.atan2(p.x - cx, p.y - cy), u = ub - 2 * (1 - Math.cos(a));
      if (u + Math.cos(a) >= 0) { f = a; draw(); }
    });
    draw();
    return loop((dt) => {
      if (!play) return;
      const st = dt * 2.4;
      if (free) {
        free.x += free.vx * st; free.y += free.vy * st; free.vy -= st; free.t += st;
        if (Math.floor(free.t * 6) !== Math.floor((free.t - st) * 6)) { const q = [cx + R * free.x, cy - R * free.y]; add(trail, 'circle', { cx: q[0], cy: q[1], r: 4, fill: C.red, opacity: .6 }); }
        if (free.x * free.x + free.y * free.y > 1 || free.t > 4) { free = null; f = 0; clear(trail); }
        draw(); return;
      }
      const u = ub - 2 * (1 - Math.cos(f));
      if (u + Math.cos(f) < 0 || u <= 0) {
        // the string goes slack: the ball flies off along the circle's tangent (or drops if it stopped)
        const v = Math.sqrt(Math.max(0, u)), px = Math.sin(f), py = -Math.cos(f);
        free = { x: px, y: py, vx: v * Math.cos(f), vy: v * Math.sin(f), t: 0 };
        draw(); return;
      }
      f += Math.sqrt(u) * st; if (f > 2 * Math.PI) f -= 2 * Math.PI;
      draw();
    });
  }

  // ---------- p10: a conical pendulum; faster turning, bigger angle ----------
  function cone(el) {
    const s = svgRoot(el);
    const px = 320, py = 80, L = 330;
    title(s, 'ลากซ้าย–ขวาในภาพ เพื่อหมุนช้าลง / เร็วขึ้น');
    add(s, 'rect', { x: px - 110, y: py - 14, width: 220, height: 14, fill: C.grey });
    add(s, 'line', { x1: px, y1: py, x2: px, y2: py + L + 20, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    const back = add(s, 'g', {}), live = add(s, 'g', {}), info = add(s, 'g', {});
    let k = 1.6, ph = 0;      // k = ω²L/g, cos θ = 1/k
    function draw() {
      clear(back); clear(live); clear(info);
      const th = Math.acos(1 / k), r = L * Math.sin(th), h = L * Math.cos(th), cy = py + h, ry = r * .28;
      add(back, 'ellipse', { cx: px, cy, rx: r, ry, fill: 'none', stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
      add(back, 'line', { x1: px, y1: cy, x2: px + r, y2: cy, stroke: C.orange, 'stroke-width': 3 });
      note(back, px + r / 2, cy + 30, 'r', C.orange, 22);
      const x = px + r * Math.cos(ph), y = cy + ry * Math.sin(ph);
      add(live, 'line', { x1: px, y1: py, x2: x, y2: y, stroke: C.ink, 'stroke-width': 3 });
      add(live, 'circle', { cx: x, cy: y, r: 13 + 4 * Math.sin(ph), fill: C.peach, stroke: C.ink, 'stroke-width': 2.5 });
      const a0 = Math.PI / 2, a1 = Math.PI / 2 - th, rr = 70;
      add(info, 'path', { d: `M${px},${py + rr} A${rr},${rr} 0 0 0 ${px + rr * Math.cos(a1)},${py + rr * Math.sin(a1)}`, fill: 'none', stroke: C.blue, 'stroke-width': 2.5 });
      note(info, px + 26, py + rr + 26, 'θ', C.blue, 22);
      note(info, 820, 200, 'θ = ' + Math.round(th * 180 / Math.PI) + '°', C.blue, 34);
      note(info, 820, 250, 'หมุนรอบละ ' + (2 * Math.PI / Math.sqrt(k) / 2).toFixed(1) + ' วินาที', C.grey, 20);
    }
    let lastX = null;
    draggable(s, (p) => { lastX = p.x; }, (p) => { if (lastX === null) return; k = Math.max(1.05, Math.min(5, k + (p.x - lastX) / 120)); lastX = p.x; draw(); }, () => { lastX = null; });
    draw();
    return loop((dt) => { ph += dt * 2 * Math.sqrt(k); draw(); });
  }

  // ---------- p14: a pendulum let go from A swings through B; height and speed ----------
  function swing(el) {
    const s = svgRoot(el);
    const px = 300, py = 90, L = 300;
    title(s, 'ลากลูกตุ้มขึ้นไปที่ A แล้วปล่อยมือ');
    add(s, 'rect', { x: px - 90, y: py - 14, width: 180, height: 14, fill: C.grey });
    add(s, 'path', { d: `M${px - L},${py} A${L},${L} 0 0 0 ${px + L},${py}`, fill: 'none', stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    add(s, 'line', { x1: 160, y1: py + L, x2: 470, y2: py + L, stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
    note(s, px + 22, py + L + 34, 'B', C.ink, 22);
    add(s, 'line', { x1: 620, y1: 20, x2: 620, y2: 530, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    const live = add(s, 'g', {}), mt = add(s, 'g', {});
    let a0 = -1, a = -1, w = 0, hold = false;
    function draw() {
      clear(live); clear(mt);
      const x = px + L * Math.sin(a), y = py + L * Math.cos(a), hA = L * (1 - Math.cos(a0));
      const xa = px + L * Math.sin(a0), ya = py + L * Math.cos(a0);
      add(live, 'line', { x1: 140, y1: ya, x2: 480, y2: ya, stroke: C.green, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
      note(live, xa - 22, ya - 18, 'A', C.green, 22);
      add(live, 'line', { x1: 500, y1: ya, x2: 500, y2: py + L, stroke: C.green, 'stroke-width': 3 });
      note(live, 512, (ya + py + L) / 2 + 8, 'h', C.green, 24, 'start');
      add(live, 'line', { x1: px, y1: py, x2: x, y2: y, stroke: C.ink, 'stroke-width': 3 });
      add(live, 'circle', { cx: x, cy: y, r: 18, fill: C.peach, stroke: C.ink, 'stroke-width': 2.5 });
      const hNow = L * (1 - Math.cos(a)), v = Math.sqrt(Math.max(0, hA - hNow) / L);
      meter(mt, 720, 110, 450, hNow / L * 1.5, C.green, 'ความสูง', null);
      meter(mt, 870, 110, 450, v, C.blue, 'อัตราเร็ว', null);
    }
    draggable(s, () => { hold = true; }, (p) => {
      if (p.x > 600 || p.y > 530) return;
      let t = Math.atan2(p.x - px, p.y - py); t = Math.max(-1.45, Math.min(1.45, t));
      a = a0 = t; w = 0; draw();
    }, () => { hold = false; });
    draw();
    return loop((dt) => { if (hold) return; const st = dt * 2.2; w += -Math.sin(a) * st; a += w * st; draw(); });
  }

  // ---------- p19: a cube under water; push on the top and bottom faces, the difference stays the same ----------
  function press(el) {
    const s = svgRoot(el);
    const x0 = 120, x1 = 520, top = 70, bot = 520, lvl = 110, a = 120;
    title(s, 'ลากลูกบาศก์ขึ้น–ลงในน้ำ');
    tankBox(s, x0, x1, top, bot, lvl);
    add(s, 'line', { x1: 620, y1: 20, x2: 620, y2: 530, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    const live = add(s, 'g', {}), mt = add(s, 'g', {});
    let y = 200;   // top face
    const k = .17;
    function draw() {
      clear(live); clear(mt);
      const cx = (x0 + x1) / 2, h = y - lvl, Ft = k * h, Fb = k * (h + a);
      add(live, 'rect', { x: cx - a / 2, y, width: a, height: a, fill: '#9aa3b2', stroke: C.ink, 'stroke-width': 2.5 });
      for (const dx of [-30, 0, 30]) {
        arrow(live, cx + dx, y - 14 - Ft, cx + dx, y - 3, C.purple, 4);
        arrow(live, cx + dx, y + a + 14 + Fb, cx + dx, y + a + 3, C.purple, 4);
      }
      for (const dy of [.3, .7]) {
        const fs = k * (h + a * dy) * .6;
        arrow(live, cx - a / 2 - 10 - fs, y + a * dy, cx - a / 2 - 3, y + a * dy, '#b49ad6', 3);
        arrow(live, cx + a / 2 + 10 + fs, y + a * dy, cx + a / 2 + 3, y + a * dy, '#b49ad6', 3);
      }
      add(live, 'line', { x1: x1 + 18, y1: lvl, x2: x1 + 18, y2: y, stroke: C.green, 'stroke-width': 3 });
      note(live, x1 + 28, (lvl + y) / 2 + 8, 'h', C.green, 22, 'start');
      const sc = 1 / (k * 300);
      meter(mt, 700, 110, 450, Ft * sc * 2, C.purple, 'ผิวบน', null);
      meter(mt, 800, 110, 450, Fb * sc * 2, C.purple, 'ผิวล่าง', null);
      meter(mt, 910, 110, 450, (Fb - Ft) * sc * 2, C.green, 'ล่าง − บน', null);
    }
    draggable(s, null, (p) => { if (p.x > 600 || p.y > 530) return; y = Math.max(lvl + 30, Math.min(bot - a - 30, p.y - a / 2)); draw(); });
    draw();
    return () => {};
  }

  // ---------- p22: sink, float or stay put, from the object's density ----------
  function sinkfloat(el) {
    const s = svgRoot(el);
    const x0 = 120, x1 = 520, top = 70, bot = 520, lvl = 180, a = 110;
    title(s, 'ลากลง = วัตถุหนาแน่นขึ้น · ลากขึ้น = เบาลง');
    tankBox(s, x0, x1, top, bot, lvl);
    note(s, (x0 + x1) / 2, bot + 34, 'น้ำ ρ = 1000 kg/m³', C.blue, 19);
    add(s, 'line', { x1: 620, y1: 20, x2: 620, y2: 530, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    const live = add(s, 'g', {}), info = add(s, 'g', {});
    let rho = 600, y = lvl - a * .4, vy = 0;
    function target() {
      if (rho < 1000) return lvl - a * (1 - rho / 1000);
      if (rho > 1000) return bot - a - 3;
      return Math.max(lvl, Math.min(bot - a - 3, y));
    }
    function draw() {
      clear(live); clear(info);
      const cx = (x0 + x1) / 2, sub = Math.max(0, Math.min(a, y + a - lvl)) / a;
      const shade = Math.round(225 - (rho - 200) / 1400 * 150);
      add(live, 'rect', { x: cx - a / 2, y, width: a, height: a, fill: `rgb(${shade},${shade - 30},${shade - 70})`, stroke: C.ink, 'stroke-width': 2.5 });
      const mg = rho / 1000 * 55, fb = sub * 55, my = y + a / 2;
      arrow(live, cx + 22, my, cx + 22, my + mg, C.red, 4); note(live, cx + 34, my + mg, 'mg', C.red, 19, 'start');
      if (fb > 2) { arrow(live, cx - 22, my, cx - 22, my - fb, C.green, 4); label(live, cx - 32, my - fb + 12, 'F', C.green, 20, 'end', 'B'); }
      const onFloor = Math.abs(y - (bot - a - 3)) < 1 && rho > 1000;
      if (onFloor) { arrow(live, cx, y + a, cx, y + a - (mg - fb), C.blue, 4); note(live, cx + 10, y + a - (mg - fb) - 6, 'N', C.blue, 19, 'start'); }
      note(info, 810, 150, 'ρ วัตถุ', C.grey, 22);
      note(info, 810, 200, Math.round(rho) + ' kg/m³', C.ink, 32);
      note(info, 810, 280, rho < 1000 ? 'ลอย' : rho > 1000 ? 'จมลงก้น' : 'จมมิดพอดี ลอยค้างได้', rho < 1000 ? C.green : rho > 1000 ? C.red : C.purple, 30);
      add(info, 'rect', { x: 700, y: 330, width: 220, height: 16, rx: 8, fill: C.line });
      add(info, 'line', { x1: 700 + 220 * (800 / 1400), y1: 322, x2: 700 + 220 * (800 / 1400), y2: 354, stroke: C.blue, 'stroke-width': 3 });
      add(info, 'circle', { cx: 700 + 220 * (rho - 200) / 1400, cy: 338, r: 12, fill: C.orange });
      note(info, 700, 380, 'เบา', C.grey, 16, 'start'); note(info, 920, 380, 'หนัก', C.grey, 16, 'end'); note(info, 700 + 220 * (800 / 1400), 380, 'น้ำ', C.blue, 16);
    }
    let lastY = null;
    draggable(s, (p) => { lastY = p.y; }, (p) => {
      if (lastY === null) return;
      rho = Math.max(200, Math.min(1600, rho + (p.y - lastY) * 3));
      if (Math.abs(rho - 1000) < 25) rho = 1000;
      lastY = p.y; draw();
    }, () => { lastY = null; });
    draw();
    return loop((dt) => { const t = target(); y += (t - y) * Math.min(1, dt * 3); draw(); });
  }

  // ---------- p25: lower a metal block on a spring scale into a beaker that sits on a scale ----------
  function scales(el) {
    const s = svgRoot(el);
    const bx0 = 180, bx1 = 440, btop = 280, bbot = 470, lvl0 = 330;
    const W1 = 50, FBmax = 15, W2 = 40;   // weight of the metal, buoyant force when all under, beaker + water (N)
    title(s, 'ลากก้อนโลหะลงไปในน้ำ');
    add(s, 'rect', { x: 270, y: 30, width: 120, height: 14, fill: C.grey });
    add(s, 'line', { x1: 620, y1: 20, x2: 620, y2: 530, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    const live = add(s, 'g', {}), info = add(s, 'g', {});
    let d = 0;    // how far the block is lowered (px)
    const bh = 70, bw = 70;
    function draw() {
      clear(live); clear(info);
      const top = 150 + d, sub = Math.max(0, Math.min(bh, top + bh - lvl0)) / bh, lvl = lvl0 - sub * 12;
      tankBox(live, bx0, bx1, btop, bbot, lvl);
      add(live, 'rect', { x: 140, y: bbot + 4, width: 340, height: 34, rx: 6, fill: C.grey });
      note(live, 310, bbot + 28, 'ตาชั่ง', '#fff', 17);
      // spring scale
      add(live, 'rect', { x: 310, y: 44, width: 40, height: 60, rx: 8, fill: '#fff', stroke: C.navy, 'stroke-width': 3 });
      add(live, 'line', { x1: 330, y1: 104, x2: 330, y2: top, stroke: C.ink, 'stroke-width': 3 });
      add(live, 'rect', { x: 330 - bw / 2, y: top, width: bw, height: bh, fill: '#9aa3b2', stroke: C.ink, 'stroke-width': 2.5 });
      const fb = FBmax * sub;
      note(info, 800, 150, 'เครื่องชั่งสปริงอ่าน', C.navy, 20);
      note(info, 800, 200, (W1 - fb).toFixed(1) + ' N', C.navy, 36);
      note(info, 800, 300, 'ตาชั่งอ่าน', C.grey, 20);
      note(info, 800, 350, (W2 + fb).toFixed(1) + ' N', C.ink, 36);
      note(info, 800, 430, `โลหะหนัก ${W1} N · น้ำ+บีกเกอร์หนัก ${W2} N`, C.grey, 17);
      if (fb > 0) note(info, 800, 470, 'น้ำดันโลหะขึ้น = ' + fb.toFixed(1) + ' N', C.green, 19);
    }
    let lastY = null;
    draggable(s, (p) => { lastY = p.y; }, (p) => { if (lastY === null || p.x > 600) return; d = Math.max(0, Math.min(lvl0 - 150 + 40, d + p.y - lastY)); lastY = p.y; draw(); }, () => { lastY = null; });
    draw();
    return () => {};
  }

  // ---------- p28: put a block of wood or a stone in; the water level rises by (volume under water) / A ----------
  function level(el) {
    const s = svgRoot(el);
    const x0 = 140, x1 = 460, top = 90, bot = 500, lvl0 = 330, A = x1 - x0, a = 90;
    title(s, 'ลากไม้หรือหินลงไปในน้ำ แล้วปล่อยมือ');
    add(s, 'line', { x1: 620, y1: 20, x2: 620, y2: 530, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    const live = add(s, 'g', {}), info = add(s, 'g', {});
    let kind = 'wood', y = 140, hold = false;
    const wb = button(s, 20, 545, 120, 'ไม้', C.orange, () => { kind = 'wood'; y = 140; wb.set(true); rb.set(false); });
    const rb = button(s, 152, 545, 120, 'หิน', C.navy, () => { kind = 'rock'; y = 140; rb.set(true); wb.set(false); });
    wb.set(true);
    const hgt = () => (kind === 'wood' ? a : a * .6);
    function waterAt(yy) {    // level with the block's top at yy (solve level = lvl0 − under·w / A)
      const w = kind === 'wood' ? a : a * .6, h = hgt();
      let L = lvl0;
      for (let i = 0; i < 20; i++) { const under = Math.max(0, Math.min(h, yy + h - L)); L = lvl0 - under * w / A; }
      return L;
    }
    function draw() {
      clear(live); clear(info);
      const L = waterAt(y), w = kind === 'wood' ? a : a * .6, h = hgt(), cx = (x0 + x1) / 2;
      tankBox(live, x0, x1, top, bot, L);
      add(live, 'line', { x1: x1 + 6, y1: lvl0, x2: x1 + 46, y2: lvl0, stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      note(live, x1 + 52, lvl0 + 22, 'เดิม', C.grey, 16, 'start');
      if (lvl0 - L > 1) {
        add(live, 'line', { x1: x1 + 6, y1: L, x2: x1 + 46, y2: L, stroke: C.purple, 'stroke-width': 3 });
        note(live, x1 + 52, (L + lvl0) / 2 + 6, 'Δh', C.purple, 20, 'start');
      }
      add(live, 'rect', { x: cx - w / 2, y, width: w, height: h, rx: kind === 'rock' ? 14 : 3, fill: kind === 'wood' ? '#d9a35b' : '#7d7f86', stroke: C.ink, 'stroke-width': 2.5 });
      const under = Math.max(0, Math.min(h, y + h - L));
      if (under > 0) add(live, 'rect', { x: cx - w / 2 - 6, y: Math.max(y, L), width: w + 12, height: under, fill: 'none', stroke: C.purple, 'stroke-width': 3, 'stroke-dasharray': '6 5' });
      note(info, 800, 160, kind === 'wood' ? 'ไม้ (ลอย)' : 'หิน (จม)', C.ink, 26);
      note(info, 800, 230, 'ปริมาตรส่วนที่จม', C.purple, 20);
      add(info, 'rect', { x: 700, y: 250, width: 200 * (under * w) / (a * a), height: 22, fill: C.purple, opacity: .7 });
      note(info, 800, 330, 'น้ำสูงขึ้น Δh', C.purple, 20);
      add(info, 'rect', { x: 700, y: 350, width: 200 * (lvl0 - L) / (a * a / A), height: 22, fill: C.blue, opacity: .7 });
      note(info, 800, 430, 'Δh = (ปริมาตรที่จม) ÷ (พื้นที่ก้น)', C.grey, 18);
    }
    draggable(s, () => { hold = true; }, (p) => { if (p.x > 600 || p.y > 530) return; y = Math.max(100, Math.min(bot - hgt() - 3, p.y - hgt() / 2)); draw(); }, () => { hold = false; });
    draw();
    return loop((dt) => {
      if (hold) return;
      const h = hgt();
      let t;
      if (kind === 'rock') t = bot - h - 3;
      else { t = y; for (let i = 0; i < 30; i++) { const L = waterAt(t); t = L - h * .5; } }   // wood: half under (ρ = 500)
      y += (t - y) * Math.min(1, dt * 3); draw();
    });
  }

  // ---------- live physics inside a hint (<g data-sim="…">, started by the shell's startSims) ----------
  // c12: a bob hanging in a van. The slider sets the van's acceleration; the bob obeys
  // φ'' = −(g/L)sinφ + (a/L)cosφ − damping·φ' (in the van's frame), so it settles where tanφ = a/g.
  function tilt(g, d) {
    const num = d.num === '1', svg = g.ownerSVGElement;
    const px = 260, py = 216, L = 100, G = 10, wL = 9;            // wL = g/L in 1/s²
    let k = +(d.k || 1), phi = 0, om = 0, v = 0, off = 0;
    const road = add(g, 'g'), van = add(g, 'g'), fx = add(g, 'g'), ui = add(g, 'g');
    add(van, 'rect', { x: 110, y: 210, width: 300, height: 150, rx: 16, fill: '#eef4fc', stroke: C.blue, 'stroke-width': 4 });
    add(van, 'circle', { cx: 165, cy: 370, r: 24, fill: C.ink }); add(van, 'circle', { cx: 355, cy: 370, r: 24, fill: C.ink });
    add(van, 'line', { x1: px, y1: py, x2: px, y2: py + L + 10, stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
    const str = add(van, 'line', { stroke: C.ink, 'stroke-width': 3 }), bob = add(van, 'circle', { r: 14, fill: C.peach, stroke: C.ink, 'stroke-width': 2 });
    // slider: brake ← 0 → speed up
    const sx0 = 70, sx1 = 470, sy = 462, k0 = -1, k1 = 1.5, kx = (kk) => sx0 + (kk - k0) / (k1 - k0) * (sx1 - sx0);
    add(ui, 'line', { x1: sx0, y1: sy, x2: sx1, y2: sy, stroke: C.line, 'stroke-width': 8, 'stroke-linecap': 'round' });
    add(ui, 'line', { x1: kx(0), y1: sy - 12, x2: kx(0), y2: sy + 12, stroke: C.grey, 'stroke-width': 2 });
    label(ui, sx0, sy + 34, 'เบรก', C.red, 17, 'start'); label(ui, kx(0), sy + 34, 'ความเร็วคงที่', C.grey, 17);
    label(ui, sx1, sy + 34, 'เร่ง', C.green, 17, 'end');
    const knob = add(ui, 'circle', { cy: sy, r: 15, fill: C.purple, stroke: '#fff', 'stroke-width': 3 });
    const hit = add(ui, 'rect', { x: sx0 - 30, y: sy - 30, width: sx1 - sx0 + 60, height: 56, fill: 'transparent', style: 'cursor:ew-resize;touch-action:none' });
    const read = label(ui, 20, 140, '', C.purple, 21, 'start');
    label(ui, 20, 112, 'ลากปุ่มม่วงเปลี่ยนความเร่งของรถ', C.grey, 17, 'start');
    let id = null;
    const setK = (e) => { k = Math.max(k0, Math.min(k1, k0 + (pt(svg, e).x - sx0) / (sx1 - sx0) * (k1 - k0))); if (Math.abs(k) < .06) k = 0; };
    hit.addEventListener('pointerdown', (e) => { id = e.pointerId; try { hit.setPointerCapture(id); } catch (x) {} setK(e); e.preventDefault(); e.stopPropagation(); });
    hit.addEventListener('pointermove', (e) => { if (e.pointerId === id) setK(e); });
    const end = (e) => { if (e.pointerId === id) id = null; };
    hit.addEventListener('pointerup', end); hit.addEventListener('pointercancel', end);
    const dash = [];
    for (let i = 0; i < 14; i++) dash.push(add(road, 'line', { y1: 420, y2: 420, stroke: C.grey, 'stroke-width': 3 }));
    add(road, 'line', { x1: 0, y1: 406, x2: 530, y2: 406, stroke: C.navy, 'stroke-width': 4 });
    // still until ▶: dragging the slider then shows where the bob settles (tanφ = a/g); ▶ runs the van and the swing
    let run = false;
    const play = button(ui, 380, 92, 130, '▶ เล่น', C.green, () => {
      run = !run; play.set(run, run ? '❚❚ หยุด' : '▶ เล่น');
      if (run && v <= 0) v = 8;
    });
    const rest = () => { if (!run) { phi = Math.atan(k); om = 0; draw(k * G); } };
    hit.addEventListener('pointermove', rest); hit.addEventListener('pointerdown', rest);
    v = 8;
    function draw(a) {
      dash.forEach((l, i) => { const x = i * 40 - off; l.setAttribute('x1', Math.max(0, x)); l.setAttribute('x2', Math.min(530, Math.max(0, x + 18))); });
      const bx = px - L * Math.sin(phi), by = py + L * Math.cos(phi);
      str.setAttribute('x1', px); str.setAttribute('y1', py); str.setAttribute('x2', bx); str.setAttribute('y2', by);
      bob.setAttribute('cx', bx); bob.setAttribute('cy', by);
      knob.setAttribute('cx', kx(k));
      // forces on the bob: T along the string (size m·√(g²+a²) once settled), mg straight down; 10 m/s² ↔ 50 px
      clear(fx);
      const Tm = Math.max(0, G * Math.cos(phi) + a * Math.sin(phi) + L / 50 * om * om) * 5, ux = (px - bx) / L, uy = (py - by) / L;
      arrow(fx, bx + ux * 15, by + uy * 15, bx + ux * (15 + Tm), by + uy * (15 + Tm), C.blue, 4);
      label(fx, bx + ux * (15 + Tm * .6) - uy * 22, by + uy * (15 + Tm * .6) + ux * 22 + 7, 'T', C.blue, 21);
      arrow(fx, bx, by + 15, bx, by + 65, C.red, 4); label(fx, bx - 10, by + 60, 'mg', C.red, 20, 'end');
      if (Math.abs(a) > .3) { arrow(fx, 260, 170, 260 + a * 9, 170, C.purple, 4, true); label(fx, 260 + a * 9 + (a > 0 ? 8 : -8), 158, 'a', C.purple, 22, a > 0 ? 'start' : 'end'); }
      read.textContent = num ? `a = ${Math.abs(a).toFixed(1)} m/s²${a < -.3 ? ' (เบรก)' : ''}` : (Math.abs(a) < .3 ? 'ไม่เร่ง: เชือกตรง' : a > 0 ? 'เร่งไปข้างหน้า' : 'เบรก');
    }
    phi = Math.atan(k); draw(k * G);
    return loop((dt) => {
      if (!run) return;
      let a = k * G;
      if (v <= 0 && a < 0) { v = 0; a = 0; }                        // a stopped van can't brake backwards
      v = Math.min(60, v + a * dt);
      // pendulum in the van's frame, small sub-steps for stability
      for (let i = 0; i < 4; i++) { const h = dt / 4; om += (-wL * Math.sin(phi) + wL * (a / G) * Math.cos(phi) - 2.2 * om) * h; phi += om * h; }
      off = (off + Math.min(v, 30) * 40 * dt) % 40;
      draw(a);
    });
  }

  // ---------- hint sims: a small kit. The picture is still until ▶; dragging changes the inputs while still ----------
  // K.scene (drawn once, moved by transforms), K.fx (arrows, redrawn), K.ui (slider, buttons). K.go(step, draw): step(dt) runs
  // only while playing; draw() runs when something changed (an input, a hint button that toggles a class or sets data-s).
  function kit(g, o = {}) {
    const svg = g.ownerSVGElement, K = { svg, run: false, dirty: true, num: g.dataset.num === '1' };
    K.scene = add(g, 'g'); K.fx = add(g, 'g'); K.ui = add(g, 'g');
    K.on = (n) => svg.classList.contains('t-' + n);
    K.state = () => svg.getAttribute('data-s');
    K.set = (run) => { K.run = run; if (K.play) K.play.set(run, run ? '❚❚ หยุด' : '▶ เล่น'); K.dirty = true; };
    if (o.play !== false) {
      const [x, y] = o.playAt || [390, 92];
      K.play = button(K.ui, x, y, 120, '▶ เล่น', C.green, () => { K.set(!K.run); o.onPlay && o.onPlay(K.run); });
    }
    // a slider: value v in [min, max]; marks = [[value, text, color]]
    K.slider = (s) => {
      const { x0 = 70, x1 = 470, y = 462, min, max, onChange } = s, ui = add(K.ui, 'g');
      const X = (v) => x0 + (v - min) / (max - min) * (x1 - x0);
      add(ui, 'line', { x1: x0, y1: y, x2: x1, y2: y, stroke: C.line, 'stroke-width': 8, 'stroke-linecap': 'round' });
      for (const [v, t, c, anchor] of s.marks || []) {
        if (s.tick !== false) add(ui, 'line', { x1: X(v), y1: y - 12, x2: X(v), y2: y + 12, stroke: C.grey, 'stroke-width': 2 });
        label(ui, X(v), y + 34, t, c || C.grey, 17, anchor || 'middle');
      }
      const knob = add(ui, 'circle', { cy: y, r: 15, fill: C.purple, stroke: '#fff', 'stroke-width': 3 });
      const hit = add(ui, 'rect', { x: x0 - 30, y: y - 30, width: x1 - x0 + 60, height: 56, fill: 'transparent', style: 'cursor:ew-resize;touch-action:none' });
      const S = { v: s.v, set(v) { S.v = Math.max(min, Math.min(max, v)); knob.setAttribute('cx', X(S.v)); K.dirty = true; } };
      let id = null;
      const mv = (e) => { let v = min + (pt(svg, e).x - x0) / (x1 - x0) * (max - min); if (s.snap != null && Math.abs(v - s.snap) < (max - min) * .025) v = s.snap; S.set(v); onChange && onChange(S.v); };
      hit.addEventListener('pointerdown', (e) => { id = e.pointerId; try { hit.setPointerCapture(id); } catch (x) {} mv(e); e.preventDefault(); e.stopPropagation(); });
      hit.addEventListener('pointermove', (e) => { if (e.pointerId === id) mv(e); });
      const end = (e) => { if (e.pointerId === id) id = null; };
      hit.addEventListener('pointerup', end); hit.addEventListener('pointercancel', end);
      S.set(s.v);
      return S;
    };
    // drag an element: fn(point, phase) with phase 'down' | 'move' | 'up'
    K.drag = (el, fn) => {
      let id = null;
      el.style.cursor = 'grab'; el.style.touchAction = 'none';
      el.addEventListener('pointerdown', (e) => { id = e.pointerId; try { el.setPointerCapture(id); } catch (x) {} fn(pt(svg, e), 'down'); K.dirty = true; e.preventDefault(); e.stopPropagation(); });
      el.addEventListener('pointermove', (e) => { if (e.pointerId === id) { fn(pt(svg, e), 'move'); K.dirty = true; } });
      const end = (e) => { if (e.pointerId === id) { id = null; fn(pt(svg, e), 'up'); K.dirty = true; } };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    };
    K.text = (x, y, size = 20, color = C.purple, anchor = 'start') => label(K.ui, x, y, '', color, size, anchor);
    K.go = (step, draw) => {
      let key = '';
      draw();
      return loop((dt) => {
        const k = svg.getAttribute('class') + '|' + svg.getAttribute('data-s');
        if (k !== key) { key = k; K.dirty = true; }
        if (K.run) { step(dt); K.dirty = true; }
        if (K.dirty) { K.dirty = false; draw(); }
      });
    };
    return K;
  }
  // a small force arrow with its label beside the tip; (x, y) start, (dx, dy) the arrow
  function farrow(g, x, y, dx, dy, color, name, w = 4) {
    const L = Math.hypot(dx, dy);
    if (L < 4) return;
    arrow(g, x, y, x + dx, y + dy, color, w);
    const ux = dx / L, uy = dy / L;
    label(g, x + dx + ux * 14 - uy * 16, y + dy + uy * 14 + ux * 16 + 7, name, color, 20);
  }
  function setT(el, x, y, a = 0, s = 1) { el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a.toFixed(2)})${s !== 1 ? ` scale(${s})` : ''}`); }
  // only show a live number while it is well clear of the critical value (q = value / critical)
  const safe = (q, lo = .85, hi = 1.15) => q < lo || q > hi;
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);

  // c5 car on a flat curve / c6 coins on a turntable (seen from above). Friction is the only force to the centre:
  // it can give at most μmg, so once mω²r > μmg the object slides off along the tangent (kinetic friction slows it).
  // data: kind car|coin, r (m), mu, px (radius in the picture), t1/t1hi/t2 (readout lines; {v} {w} {r} filled in)
  function ring(g, d) {
    const K = kit(g, { onPlay: (on) => { if (on && objs.some((o) => o.off)) reset(); } });
    const coin = d.kind === 'coin', mu = +d.mu, r0 = +d.r, P = +d.px, G = 10;
    const cx = 260, cy = coin ? 285 : 280;
    const wSlip = Math.sqrt(mu * G / r0), k = 2 * Math.PI / 2.6 / wSlip;   // picture ω = k × real ω: at the slip speed one lap takes 2.6 s
    let phi = 0, ramp = false;
    const S = K.slider({ min: 0, max: wSlip * 1.35, v: wSlip * .55, title: coin ? 'ลากเปลี่ยนความเร็วการหมุน' : 'ลากเปลี่ยนความเร็วรถ',
      marks: [[0, coin ? 'ไม่หมุน' : 'จอด', C.grey, 'start'], [wSlip * 1.35, 'เร็ว', C.red, 'end']], tick: false,
      onChange: () => { ramp = false; if (!K.run) reset(); } });
    const rb = button(K.ui, 390, 150, 120, 'เร่งจนหลุด', C.red, () => { if (objs.some((o) => o.off)) reset(); ramp = true; K.set(true); });
    const disc = add(K.scene, 'g');
    if (coin) {
      add(disc, 'circle', { cx, cy, r: P * 2 + 40, fill: '#f1ebe0', stroke: C.navy, 'stroke-width': 4 });
      add(disc, 'line', { x1: cx - P * 2 - 40, y1: cy, x2: cx + P * 2 + 40, y2: cy, stroke: '#d9cdb8', 'stroke-width': 2 });
      add(disc, 'line', { x1: cx, y1: cy - P * 2 - 40, x2: cx, y2: cy + P * 2 + 40, stroke: '#d9cdb8', 'stroke-width': 2 });
    } else {
      add(K.scene, 'circle', { cx, cy, r: P, fill: 'none', stroke: '#c9ced8', 'stroke-width': 56 });
      add(K.scene, 'circle', { cx, cy, r: P, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '12 10' });
    }
    add(K.scene, 'circle', { cx, cy, r: 6, fill: C.grey });
    const mk = (R, rm) => {
      const el = add(K.scene, 'g');
      if (coin) add(el, 'circle', { r: 14, fill: '#e7b84a', stroke: C.ink, 'stroke-width': 2 });
      else { add(el, 'rect', { x: -16, y: -30, width: 32, height: 60, rx: 8, fill: C.blue }); add(el, 'rect', { x: -12, y: -14, width: 24, height: 16, rx: 3, fill: '#fff', opacity: .7 }); }
      return { el, R, rm, off: false };
    };
    const objs = [mk(P, r0)];
    if (coin) objs.push(mk(P * 2, r0 * 2));
    const l1 = K.text(20, 76, 18, C.red), l2 = K.text(20, 102, 18, C.grey);
    function reset() { for (const o of objs) o.off = false; }
    function shown(o) { return objs.indexOf(o) === 0 || K.on('far'); }
    function step(dt) {
      if (ramp) { S.set(S.v + wSlip * .12 * dt); if (S.v >= wSlip * 1.35) ramp = false; }
      const w = S.v;
      phi += w * k * dt;
      for (const o of objs) {
        if (!shown(o)) continue;
        if (!o.off) {
          if (w * w * o.rm > mu * G) {                          // friction can't give mω²r any more: off along the tangent
            const a = phi, sp = w * k * o.R;
            o.off = true; o.x = cx + o.R * Math.cos(a); o.y = cy - o.R * Math.sin(a);
            o.vx = -sp * Math.sin(a); o.vy = -sp * Math.cos(a); o.ang = a;
            if (ramp) ramp = false;
          }
        } else {
          // kinetic friction (μk ≈ 0.8μ on the disc, less on the road) against the motion relative to the surface under it;
          // on the turntable the surface moves (Ω × r), so the coin is dragged round while it slides out, then flies off the edge
          const dec = (coin ? .8 : .35) * mu * G * (o.R / o.rm) * k * k, W = coin ? w * k : 0;
          for (let i = 0; i < 6; i++) {
            const h = dt / 6, dx = o.x - cx, dy = o.y - cy, onDisc = !coin || Math.hypot(dx, dy) < P * 2 + 40;
            const ux = o.vx - W * dy, uy = o.vy + W * dx, ul = Math.hypot(ux, uy);
            if (onDisc && ul > .5) { const dv = Math.min(ul, dec * h); o.vx -= ux / ul * dv; o.vy -= uy / ul * dv; }
            o.x += o.vx * h; o.y += o.vy * h;
          }
        }
      }
    }
    function draw() {
      const w = S.v;
      disc.setAttribute('transform', `rotate(${(-phi * 180 / Math.PI).toFixed(2)} ${cx} ${cy})`);
      clear(K.fx);
      let crit = null;
      for (const o of objs) {
        o.el.style.display = shown(o) ? '' : 'none';
        if (!shown(o)) continue;
        if (!o.off) {
          const x = cx + o.R * Math.cos(phi), y = cy - o.R * Math.sin(phi);
          setT(o.el, x, y, -phi * 180 / Math.PI);
          const need = w * w * o.rm / (mu * G), Lm = coin ? 60 : 80, ux = -Math.cos(phi), uy = Math.sin(phi);
          // dashed outline = the most friction can give (μmg); solid = what going round needs (mω²r)
          add(K.fx, 'line', { x1: x + ux * 16, y1: y + uy * 16, x2: x + ux * (16 + Lm), y2: y + uy * (16 + Lm), stroke: C.orange, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: .7 });
          farrow(K.fx, x + ux * 16, y + uy * 16, ux * Lm * need, uy * Lm * need, C.orange, 'fₛ');
          if (!crit || o.rm > crit.rm) crit = o;
        } else {
          setT(o.el, o.x, o.y, -o.ang * 180 / Math.PI);
          o.el.firstChild.setAttribute('fill', C.red);
        }
        if (!o.off) o.el.firstChild.setAttribute('fill', coin ? '#e7b84a' : C.blue);
      }
      const slipped = objs.some((o) => shown(o) && o.off);
      const q = crit ? w * Math.sqrt(crit.rm / (mu * G)) : 2;
      if (slipped) { l1.textContent = (coin ? 'เหรียญ' : 'รถ') + 'หลุด! ต้องใช้ mω²r มากกว่า fₛ ที่ได้มากสุด'; l2.textContent = 'ไถลออกตามแนวสัมผัส (กด ▶ เริ่มใหม่)'; }
      else if (K.num && safe(q, .85, 99)) {
        const fill = (t) => t.replace(/\{v\}/g, f1(w * r0)).replace(/\{w\}/g, f1(w)).replace(/\{r\}/g, String(crit.rm));
        l1.textContent = fill(d.t1); l2.textContent = d.t2;
      } else if (K.num) { l1.textContent = d.t1hi; l2.textContent = d.t2; }
      else { l1.textContent = q > .85 ? 'ใกล้หลุดแล้ว: ต้องใช้แรงเกือบเท่า f_s สูงสุด' : (coin ? 'หมุนเร็วขึ้น → ต้องใช้ mω²r มากขึ้น' : 'เร็วขึ้น → ต้องใช้ mv²/r มากขึ้น'); l2.textContent = 'แต่ f_s ได้มากสุดแค่ μₛmg (เส้นประ)'; }
    }
    return K.go(step, draw);
  }

  // c8 c16 c17: a pendulum. Drag the bob to where it is let go, ▶ lets it swing: φ'' = −(g/L) sinφ (no friction).
  // On the bob: T = m(g cosφ + v²/L) along the string, mg down, v along the path. data: a (deg), l (m), px py lpx
  function pend(g, d) {
    const K = kit(g, { onPlay: (on) => { if (on && Math.abs(om) < 1e-3 && Math.abs(phi) < .02) phi = a0; } });
    const G = 10, Lm = +d.l, px = +d.px, py = +d.py, L = +d.lpx, a0 = +d.a * Math.PI / 180;
    let phi = a0, om = 0;
    const str = add(K.scene, 'line', { x1: px, y1: py, stroke: C.ink, 'stroke-width': 3 });
    const bob = add(K.scene, 'circle', { r: 17, fill: C.peach, stroke: C.ink, 'stroke-width': 2 });
    const tip = K.text(20, 470, 18, C.grey);
    K.drag(bob, (p, ph) => { if (ph === 'down') K.set(false); phi = Math.max(-1.75, Math.min(1.75, Math.atan2(p.x - px, p.y - py))); om = 0; });
    function step(dt) { for (let i = 0; i < 8; i++) { const h = dt / 8; om += -G / Lm * Math.sin(phi) * h; phi += om * h; } }
    function draw() {
      const bx = px + L * Math.sin(phi), by = py + L * Math.cos(phi);
      str.setAttribute('x2', bx); str.setAttribute('y2', by); bob.setAttribute('cx', bx); bob.setAttribute('cy', by);
      clear(K.fx);
      const T = Math.cos(phi) + om * om * Lm / G, ux = (px - bx) / L, uy = (py - by) / L, v = om * Lm;   // T in units of mg
      farrow(K.fx, bx + ux * 18, by + uy * 18, ux * 60 * T, uy * 60 * T, C.blue, 'T');
      farrow(K.fx, bx, by + 18, 0, 60, C.red, 'mg');
      if (Math.abs(v) > .15) { const s = Math.sign(om) * 14 * Math.abs(v) / Math.sqrt(G * Lm); arrow(K.fx, bx, by, bx - uy * s * 4, by + ux * s * 4, C.grey, 3); }
      tip.textContent = K.run ? 'เร็วสุดที่จุดต่ำสุด → T มากสุดตรงนั้น' : 'ลากลูกตุ้มไปจุดที่จะปล่อย แล้วกด ▶';
    }
    return K.go(step, draw);
  }

  // c9 c11: a car over a hill / through a dip at a steady speed v (slider). Hill: N = m(g cosα − v²/r), N < 0 → the car
  // leaves the road and flies (projectile). Dip: N = m(g cosα + v²/r). data: kind hill|dip|toggle (t-dip picks), r (m),
  // v (start speed, hill), vd (dip), cx cy R (picture), t1 (readout "{v}")
  function hill(g, d) {
    const K = kit(g, { onPlay: (on) => { if (on && fly) { fly = null; al = -1; } } });
    const G = 10, r = +d.r, R = +d.rpx || 230, vc = Math.sqrt(G * r), k = Math.sqrt(r / G);   // picture: at v = √(gr) the arc (2 rad) takes 2 s
    let al = 0, fly = null, kind = '';
    const pos = { hill: [260, 470], dip: [260, 60] };
    const roads = {};
    for (const kn of ['hill', 'dip']) {
      const [cx, cy] = pos[kn], sg = kn === 'hill' ? -1 : 1, e = add(K.scene, 'g');
      const sx = R * Math.sin(1), sy = R * Math.cos(1);
      add(e, 'path', { d: `M${cx - sx},${cy + sg * sy} A${R},${R} 0 0 ${kn === 'hill' ? 1 : 0} ${cx + sx},${cy + sg * sy}`, fill: 'none', stroke: C.navy, 'stroke-width': 8, 'stroke-linecap': 'round' });
      add(e, 'line', { x1: cx, y1: cy + sg * R, x2: cx, y2: kn === 'hill' ? 432 : 120, stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
      label(e, cx + 10, kn === 'hill' ? 420 : 140, (d.rl || 'r') + (kn === 'hill' ? ' ↓ ศูนย์กลาง' : ' ↑ ศูนย์กลาง'), C.grey, 18, 'start');
      roads[kn] = e;
    }
    const S = K.slider({ min: 0, max: vc * 1.3, v: +d.v || vc * .6, title: 'ลากเปลี่ยนความเร็วรถ', tick: false,
      marks: [[0, 'ช้า', C.grey, 'start'], [vc * 1.3, 'เร็ว', C.red, 'end']], onChange: () => { if (!K.run && fly) { fly = null; al = 0; } } });
    const car = add(K.scene, 'g');
    add(car, 'rect', { x: -45, y: -43, width: 90, height: 29, rx: 9, fill: C.blue });
    add(car, 'path', { d: 'M-25,-43 l9,-22 h31 l11,22Z', fill: C.blue, opacity: .85 });
    add(car, 'circle', { cx: -27, cy: -14, r: 13, fill: C.ink }); add(car, 'circle', { cx: 27, cy: -14, r: 13, fill: C.ink });
    const l1 = K.text(20, 76, 18, C.purple), l2 = K.text(20, 102, 17, C.grey);
    K.drag(car, (p) => { if (fly) return; K.set(false); const [cx, cy] = pos[kind]; al = Math.max(-1, Math.min(1, Math.atan2(p.x - cx, kind === 'hill' ? cy - p.y : p.y - cy))); });
    const cur = () => (d.kind === 'toggle' ? (K.on('dip') ? 'dip' : 'hill') : d.kind);
    if (d.kind === 'toggle' && d.vd) S.set(+d.v || vc * .6);
    function N() { return kind === 'hill' ? Math.cos(al) - S.v * S.v / (G * r) : Math.cos(al) + S.v * S.v / (G * r); }
    function place() {
      const [cx, cy] = pos[kind], hillK = kind === 'hill';
      const x = cx + R * Math.sin(al), y = hillK ? cy - R * Math.cos(al) : cy + R * Math.cos(al);
      return { x, y, rot: hillK ? al : -al, nx: hillK ? Math.sin(al) : -Math.sin(al), ny: hillK ? -Math.cos(al) : -Math.cos(al) };
    }
    function step(dt) {
      if (fly) {
        const gp = G * (R / r) * k * k;
        fly.vy += gp * dt; fly.x += fly.vx * dt; fly.y += fly.vy * dt; fly.rot += fly.spin * dt;
        if (fly.y > 560 || fly.x > 560) { fly = null; al = -1; }
        return;
      }
      al += S.v / r * k * dt;
      if (al > 1) al = -1;
      if (kind === 'hill' && N() < 0) {                                     // no road force left: it leaves the road
        const p = place(), sp = S.v * k * R / r;
        fly = { x: p.x, y: p.y, rot: p.rot, vx: sp * Math.cos(al), vy: sp * Math.sin(al), spin: .3 };
      }
    }
    function draw() {
      const kn = cur();
      if (kn !== kind) { kind = kn; fly = null; al = 0; if (d.kind === 'toggle') { S.set(kind === 'dip' ? +d.vd : +d.v || vc * .6); } }
      clear(K.fx);
      let x, y, rot, nx, ny;
      if (fly) { ({ x, y, rot } = fly); nx = Math.sin(rot); ny = -Math.cos(rot); }
      else ({ x, y, rot, nx, ny } = place());
      setT(car, x, y, rot * 180 / Math.PI);
      const mx = x + nx * 30, my = y + ny * 30, n = fly ? 0 : Math.max(0, N());
      const sc = kind === 'dip' ? 48 : 70;
      if (n > .02) farrow(K.fx, mx, my - 10, nx * sc * n, ny * sc * n, C.blue, 'N');
      farrow(K.fx, mx + 4, my + 6, 0, sc, C.red, 'mg');
      roads.hill.style.display = kind === 'hill' ? '' : 'none'; roads.dip.style.display = kind === 'dip' ? '' : 'none';
      const q = S.v / vc;
      if (fly) { l1.textContent = 'รถลอยหลุดจากถนน!'; l2.textContent = 'mg มากกว่าแรงสู่ศูนย์กลางที่ต้องใช้ไม่ได้แล้ว: N = 0'; }
      else if (K.num && (kind === 'dip' || safe(q))) { l1.textContent = (d.t1 || 'v = {v} m/s').replace('{v}', f1(S.v)); l2.textContent = kind === 'hill' ? 'เร็วขึ้น → N น้อยลง' : 'เร็วขึ้น → N มากขึ้น'; }
      else if (K.num) { l1.textContent = 'ใกล้ความเร็วที่ N = 0'; l2.textContent = 'เร็วขึ้น → N น้อยลง'; }
      else { l1.textContent = kind === 'hill' ? 'บนเนิน: เร็วขึ้น → N น้อยลง' : 'ในแอ่ง: เร็วขึ้น → N มากขึ้น'; l2.textContent = 'ลากรถหรือกด ▶'; }
    }
    return K.go(step, draw);
  }

  // c10: a bucket of water swung in a vertical circle at a steady speed. The bottom pushes the water to the centre:
  // N = m(v²/r − g cosβ) (β from the top). N < 0 → the water falls out. data: r (m), v (start), rpx
  function bucket(g, d) {
    const K = kit(g, { onPlay: (on) => { if (on && drop) drop = null; } });
    const G = 10, r = +d.r, R = 140, cx = 260, cy = 290, vc = Math.sqrt(G * r), k = (2 * Math.PI / 2.4) / (vc / r);
    let be = 0, drop = null;
    const S = K.slider({ min: vc * .4, max: vc * 2.2, v: +d.v || vc * 1.5, title: 'ลากเปลี่ยนความเร็วที่แกว่ง', tick: false,
      marks: [[vc * .4, 'ช้า', C.grey, 'start'], [vc * 2.2, 'เร็ว', C.red, 'end']], onChange: () => { if (!K.run) drop = null; } });
    add(K.scene, 'circle', { cx, cy, r: R, fill: 'none', stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': '7 6' });
    add(K.scene, 'circle', { cx, cy, r: 8, fill: C.ink });
    const rope = add(K.scene, 'line', { x1: cx, y1: cy, stroke: C.ink, 'stroke-width': 3 });
    const bk = add(K.scene, 'g');
    add(bk, 'path', { d: 'M-34,28 L-28,-30 L28,-30 L34,28', fill: '#eef1f6', stroke: C.ink, 'stroke-width': 3 });
    const wat = add(bk, 'path', { d: 'M-31,-2 L-28,-28 L28,-28 L31,-2Z', fill: '#9cc9ec' });
    const blob = add(K.scene, 'ellipse', { rx: 26, ry: 12, fill: '#9cc9ec', opacity: .9 });
    const l1 = K.text(20, 76, 18, C.purple), l2 = K.text(20, 102, 17, C.grey);
    K.drag(bk, (p) => { K.set(false); be = Math.atan2(p.x - cx, cy - p.y); drop = null; });
    const Nw = () => S.v * S.v / (G * r) - Math.cos(be);
    function step(dt) {
      be += S.v / r * k * dt; if (be > Math.PI) be -= 2 * Math.PI;
      if (drop) {
        if (!drop.fall) return;
        drop.vy += G * (R / r) * k * k * dt; drop.x += drop.vx * dt; drop.y += drop.vy * dt;
        if (drop.y > 600) drop.fall = false;
      } else if (Nw() < 0) {                       // the bucket can't pull it round: it leaves on its own path
        const sp = S.v * k * R / r, wx = cx + (R + 14) * Math.sin(be), wy = cy - (R + 14) * Math.cos(be);
        drop = { fall: true, x: wx, y: wy, vx: sp * Math.cos(be), vy: sp * Math.sin(be) };
      }
    }
    function draw() {
      const bx = cx + R * Math.sin(be), by = cy - R * Math.cos(be);
      rope.setAttribute('x2', cx + (R - 30) * Math.sin(be)); rope.setAttribute('y2', cy - (R - 30) * Math.cos(be));
      setT(bk, bx, by, be * 180 / Math.PI);
      wat.style.display = drop ? 'none' : '';
      blob.style.display = drop && drop.fall ? '' : 'none';
      if (drop) { blob.setAttribute('cx', drop.x); blob.setAttribute('cy', drop.y); }
      clear(K.fx);
      if (!drop) {
        const wx = cx + (R + 14) * Math.sin(be), wy = cy - (R + 14) * Math.cos(be), n = Nw(), ux = -Math.sin(be), uy = Math.cos(be);
        if (n > .02) farrow(K.fx, wx + ux * 20 + 40 * Math.cos(be), wy + uy * 20 + 40 * Math.sin(be), ux * 30 * n, uy * 30 * n, C.blue, 'N');
        farrow(K.fx, wx - 40 * Math.cos(be), wy - 40 * Math.sin(be), 0, 30, C.red, 'mg');
      }
      const q = S.v / vc;
      if (drop) { l1.textContent = 'น้ำหล่นจากถัง!'; l2.textContent = 'ช้าเกินไป: mg มากกว่า mv²/r ที่ต้องใช้ (กด ▶ เริ่มใหม่)'; }
      else if (K.num && safe(q)) { l1.textContent = (d.t1 || 'v = {v} m/s').replace('{v}', f1(S.v)); l2.textContent = 'ที่จุดสูงสุด N + mg = mv²/r'; }
      else if (K.num) { l1.textContent = 'ใกล้ความเร็วต่ำสุดที่น้ำไม่หก'; l2.textContent = 'ที่จุดสูงสุด N + mg = mv²/r'; }
      else { l1.textContent = 'ช้าลง → N ที่จุดสูงสุดน้อยลง'; l2.textContent = 'ถ้า N ต้องติดลบ น้ำจะหล่น'; }
    }
    return K.go(step, draw);
  }

  // c13: a conical pendulum turned at ω (slider). In the turning frame θ'' = ω² sinθ cosθ − (g/L) sinθ (− a little damping),
  // so it settles where cosθ = g/(ω²L) (or hangs straight if ω²L < g). data: l (m), w (start ω), px py lpx
  function cone(g, d) {
    const K = kit(g);
    const G = 10, Lm = +d.l, px = 260, py = 80, L = 220, w0 = +d.w, sq = .16;
    const eq = (w) => (w * w * Lm > G ? Math.acos(G / (w * w * Lm)) : 0);
    const S = K.slider({ min: 0, max: w0 * 1.6, v: w0, title: 'ลากเปลี่ยนความเร็วการหมุน', tick: false,
      marks: [[0, 'ไม่หมุน', C.grey, 'start'], [w0 * 1.6, 'เร็ว', C.red, 'end']], onChange: (w) => { if (!K.run) { th = eq(w); tw = 0; } } });
    let th = eq(w0), tw = 0, ps = .5;
    add(K.scene, 'rect', { x: 150, y: py - 14, width: 220, height: 14, fill: C.grey }); add(K.scene, 'circle', { cx: px, cy: py, r: 6, fill: C.ink });
    const path = add(K.scene, 'ellipse', { cx: px, fill: 'none', stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
    const axis = add(K.scene, 'line', { x1: px, y1: py, x2: px, stroke: C.grey, 'stroke-width': 2, 'stroke-dasharray': '4 6' });
    const str = add(K.scene, 'line', { x1: px, y1: py, stroke: C.ink, 'stroke-width': 3 });
    const bob = add(K.scene, 'circle', { r: 17, fill: C.peach, stroke: C.ink, 'stroke-width': 2 });
    const l1 = K.text(20, 404, 18, C.grey);
    function step(dt) {
      const w = S.v;
      for (let i = 0; i < 6; i++) { const h = dt / 6; tw += (w * w * Math.sin(th) * Math.cos(th) - G / Lm * Math.sin(th) - 1.5 * tw) * h; th += tw * h; }
      if (th < 0) { th = -th; tw = -tw; }
      ps += w * dt;
    }
    function draw() {
      const rr = L * Math.sin(th), cyy = py + L * Math.cos(th);
      path.setAttribute('cy', cyy); path.setAttribute('rx', rr); path.setAttribute('ry', rr * sq); axis.setAttribute('y2', cyy);
      const bx = px + rr * Math.cos(ps), by = cyy + rr * sq * Math.sin(ps);
      str.setAttribute('x2', bx); str.setAttribute('y2', by); bob.setAttribute('cx', bx); bob.setAttribute('cy', by);
      clear(K.fx);
      const T = Math.cos(th) + (Lm * tw * tw + Lm * S.v * S.v * Math.sin(th) ** 2) / G, dl = Math.hypot(px - bx, py - by);
      farrow(K.fx, bx + (px - bx) / dl * 18, by + (py - by) / dl * 18, (px - bx) / dl * 55 * T, (py - by) / dl * 55 * T, C.blue, 'T');
      farrow(K.fx, bx, by + 18, 0, 55, C.red, 'mg');
      l1.textContent = th < .03 ? 'หมุนช้า: เชือกยังห้อยตรง' : 'หมุนเร็วขึ้น → เชือกกางออก มุม θ มากขึ้น';
    }
    return K.go(step, draw);
  }

  // c14: a car on a smooth banked curve (cross-section). Along the slope (up +): a = (v²/r) cosθ − g sinθ, zero only at
  // tanθ = v²/(rg). Slower slides in, faster slides out. N = m(g cosθ + (v²/r) sinθ). data: r (m), deg, v0 (design speed)
  function bank(g, d) {
    const K = kit(g, { onPlay: (on) => { if (on && (s <= 40 || s >= 420)) { s = 250; u = 0; } } });
    const G = 10, r = +d.r, th = +d.deg * Math.PI / 180, x0 = 60, y0 = 420, v0 = Math.sqrt(G * r * Math.tan(th));
    let s = 250, u = 0, ang = 0;
    const S = K.slider({ min: 0, max: v0 * 1.6, v: v0 * .6, title: 'ลากเปลี่ยนความเร็วรถ', tick: false,
      marks: [[0, 'ช้า', C.grey, 'start'], [v0 * 1.6, 'เร็ว', C.red, 'end']], onChange: () => { u = 0; } });
    const car = add(K.scene, 'g');
    add(car, 'rect', { x: -55, y: -49, width: 110, height: 35, rx: 10, fill: C.blue });
    add(car, 'path', { d: 'M-31,-49 l11,-26 h37 l13,26Z', fill: C.blue, opacity: .85 });
    add(car, 'circle', { cx: -33, cy: -14, r: 13, fill: C.ink }); add(car, 'circle', { cx: 33, cy: -14, r: 13, fill: C.ink });
    const mini = add(K.scene, 'g');
    add(mini, 'rect', { x: -7, y: -13, width: 14, height: 27, rx: 4, fill: C.blue });
    const l1 = K.text(190, 112, 18, C.purple);
    K.drag(car, (p) => { K.set(false); s = Math.max(40, Math.min(420, (p.x - x0) * Math.cos(th) + (y0 - p.y) * Math.sin(th))); u = 0; });
    function step(dt) {
      const a = S.v * S.v / r * Math.cos(th) - G * Math.sin(th);
      u += a * 25 * dt; s += u * dt;                       // 25 px per m/s² in the picture
      if (s < 40) { s = 40; u = 0; } if (s > 420) { s = 420; u = 0; }
      ang += S.v / v0 * 2.4 * dt;
    }
    function draw() {
      const x = x0 + s * Math.cos(th), y = y0 - s * Math.sin(th);
      setT(car, x, y, -d.deg);
      setT(mini, 110 + 55 * Math.cos(ang), 140 - 55 * Math.sin(ang), -ang * 180 / Math.PI);
      clear(K.fx);
      const nx = -Math.sin(th), ny = -Math.cos(th), mx = x + nx * 32, my = y + ny * 32;
      const N = Math.cos(th) + S.v * S.v / (G * r) * Math.sin(th);
      farrow(K.fx, mx, my, nx * 70 * N, ny * 70 * N, C.blue, 'N');
      farrow(K.fx, mx, my + 6, 0, 70, C.red, 'mg');
      const q = S.v / v0;
      l1.textContent = q < .96 ? 'ช้าไป: ไถลลงด้านใน' : q > 1.04 ? 'เร็วไป: ไถลขึ้นด้านนอก' : 'พอดี: อยู่นิ่งบนทางเอียงได้';
    }
    return K.go(step, draw);
  }

  // c15: a ball let go on a smooth track: along the track a = g × (slope), N = m(g cosα + v²κ) (κ = curvature).
  // Drag the ball to where it starts. data: path (the track, two cubic Béziers), gpx (g in the picture)
  function track(g, d) {
    const K = kit(g, { onPlay: (on) => { if (on && (fly || Math.abs(u) < 1e-3 && s === s0)) { fly = null; s = s0; u = 0; } } });
    const nums = d.path.match(/-?\d+(\.\d+)?/g).map(Number), gp = +d.gpx || 700;
    const segs = [nums.slice(0, 8), [nums[6], nums[7], ...nums.slice(8, 14)]];
    const P = [];
    for (const [ax, ay, bx, by, cx2, cy2, ex, ey] of segs) for (let i = 0; i < 300; i++) {
      const t = i / 300, m = 1 - t;
      P.push([m * m * m * ax + 3 * m * m * t * bx + 3 * m * t * t * cx2 + t * t * t * ex, m * m * m * ay + 3 * m * m * t * by + 3 * m * t * t * cy2 + t * t * t * ey]);
    }
    P.push([nums[12], nums[13]]);
    const len = [0];
    for (let i = 1; i < P.length; i++) len.push(len[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const Ltot = len[len.length - 1];
    const at = (s) => {                                 // point, unit tangent, curvature vector at arc length s
      let i = 1; while (i < len.length - 1 && len[i] < s) i++;
      const j = Math.max(1, Math.min(P.length - 2, i));
      const tx = P[j + 1][0] - P[j - 1][0], ty = P[j + 1][1] - P[j - 1][1], tl = Math.hypot(tx, ty);
      const t0x = (P[j][0] - P[j - 1][0]), t0y = (P[j][1] - P[j - 1][1]), t1x = (P[j + 1][0] - P[j][0]), t1y = (P[j + 1][1] - P[j][1]);
      const l0 = Math.hypot(t0x, t0y), l1 = Math.hypot(t1x, t1y);
      const kx = (t1x / l1 - t0x / l0) / ((l0 + l1) / 2), ky = (t1y / l1 - t0y / l0) / ((l0 + l1) / 2);
      const f = (s - len[i - 1]) / Math.max(1e-6, len[i] - len[i - 1]);
      return { x: P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, y: P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f, tx: tx / tl, ty: ty / tl, kx, ky };
    };
    let s0 = 0, s = 0, u = 0, fly = null;
    const ball = add(K.scene, 'circle', { r: 15, fill: C.peach, stroke: C.ink, 'stroke-width': 2 });
    const l1 = K.text(20, 70, 17, C.grey);
    K.drag(ball, (p) => {
      K.set(false); fly = null; u = 0;
      let best = 0, bd = 1e9; for (let i = 0; i < P.length; i += 2) { const dd = Math.hypot(P[i][0] - p.x, P[i][1] - p.y); if (dd < bd) { bd = dd; best = len[i]; } }
      s = s0 = best;
    });
    const Nof = (q, uu) => { const nx = q.ty, ny = -q.tx; return { nx, ny, n: (gp * -ny + uu * uu * (q.kx * nx + q.ky * ny)) / gp }; };
    function step(dt) {
      for (let i = 0; i < 10; i++) {
        const h = dt / 10;
        if (fly) { fly.vy += gp * h; fly.x += fly.vx * h; fly.y += fly.vy * h; if (fly.y > 620 || fly.x > 640) { K.set(false); } continue; }
        const q = at(s);
        u += gp * q.ty * h; s += u * h;
        if (s < 0) { s = 0; u = 0; }
        const q2 = at(Math.min(s, Ltot));
        if (s >= Ltot || Nof(q2, u).n < 0) {             // past the end, or the track would have to pull: it flies off
          const nx = q2.ty, ny = -q2.tx;
          fly = { x: q2.x + nx * 15, y: q2.y + ny * 15, vx: u * q2.tx, vy: u * q2.ty };
        }
      }
    }
    function draw() {
      clear(K.fx);
      if (fly) { ball.setAttribute('cx', fly.x); ball.setAttribute('cy', fly.y); farrow(K.fx, fly.x, fly.y + 15, 0, 55, C.red, 'mg'); l1.textContent = 'หลุดจากรางแล้ว (กด ▶ ปล่อยใหม่)'; return; }
      const q = at(s), { nx, ny, n } = Nof(q, u), bx = q.x + nx * 15, by = q.y + ny * 15;
      ball.setAttribute('cx', bx); ball.setAttribute('cy', by);
      if (n > .02) farrow(K.fx, bx + nx * 15, by + ny * 15, nx * 50 * n, ny * 50 * n, C.blue, 'N');
      farrow(K.fx, bx, by + 15, 0, 50, C.red, 'mg');
      l1.textContent = K.run ? 'ต่ำลง → เร็วขึ้น · ก้นราง N มากกว่า mg' : 'ลากลูกบอลไปจุดปล่อย แล้วกด ▶';
    }
    return K.go(step, draw);
  }

  window.SC_ANIMS = {
    pages: {
      p02: [{ id: 'circ', x: .86, y: .31, t: 'วัตถุเคลื่อนที่เป็นวงกลม: v กับ ΣF' }, { id: 'cut', x: .86, y: .655, t: 'ถ้าเชือกขาด ลูกบอลไปทางไหน' }],
      p03: [{ id: 'ice', x: .93, y: .1, t: 'ถ้าถนนเป็นน้ำแข็ง' }],
      p06: [{ id: 'hill', x: .9, y: .45, t: 'ยอดเนินและก้นแอ่ง' }],
      p07: [{ id: 'vert', x: .9, y: .12, t: 'ลูกบอลแกว่งในแนวดิ่ง' }],
      p10: [{ id: 'cone', x: .9, y: .38, t: 'ลูกตุ้มกรวย' }],
      p14: [{ id: 'swing', x: .92, y: .4, t: 'ลูกตุ้มแกว่งจาก A ผ่าน B' }],
      p19: [{ id: 'press', x: .9, y: .2, t: 'ความดันรอบลูกบาศก์' }],
      p22: [{ id: 'sinkfloat', x: .88, y: .4, t: 'จม ลอย หรือปริ่ม' }],
      p25: [{ id: 'scales', x: .88, y: .3, t: 'เครื่องชั่งสปริงกับตาชั่ง' }],
      p28: [{ id: 'level', x: .88, y: .2, t: 'ระดับน้ำเปลี่ยน' }],
    },
    make: { circ, cut, ice, hill, vert, cone, swing, press, sinkfloat, scales, level },
    sims: { tilt, ring, pend, hill, bucket, cone, bank, track },
  };
})();
