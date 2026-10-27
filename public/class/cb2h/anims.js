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
  };
})();
