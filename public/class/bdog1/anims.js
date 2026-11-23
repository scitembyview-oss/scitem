/* ลูกโป่งยกหมา (bdog1): the drawings (also used to print the sheet) and the lift animation after a student sends an answer.
   Public file: only the given data of the class (the data bar shows it too), no answers.
   SC_ANIMS.quest(box, {stage, v}) draws the animal under the balloons the student answered and lets it rise as the physics says:
   not lifting, hovering, slow, fast; the boss: the ride to the ceiling up to the time she answered. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  // the given data (same as the data bar)
  const V = 0.015, RA = 1.2, RH = 0.2, RT = 0.9, MR = 0.003, G = 10;
  const ANIMAL = { dog: 7.5, cat: 4.2 };
  const STAGE = {
    1: { who: "dog", gas: RH },
    2: { who: "cat", gas: RH },
    3: { who: "dog", gas: RT },
    4: { who: "dog", gas: RH, n: 1250, h: 10, boss: 1 },
  };

  /* ---------- drawings ---------- */
  let uid = 0;
  function defs(id) {
    return `<defs>
      <radialGradient id="${id}fur" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#e2a56a"/><stop offset=".55" stop-color="#c9864a"/><stop offset="1" stop-color="#8f5a2e"/></radialGradient>
      <radialGradient id="${id}furL" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#fff7ec"/><stop offset="1" stop-color="#efdcc4"/></radialGradient>
      <radialGradient id="${id}cat" cx="40%" cy="30%" r="85%"><stop offset="0" stop-color="#b9c0c9"/><stop offset=".6" stop-color="#8d96a3"/><stop offset="1" stop-color="#5f6874"/></radialGradient>
      <linearGradient id="${id}sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    </defs>`;
  }
  // a Shiba-like dog, side view facing left, about 230 x 150, origin at its feet centre
  function dog(id) {
    return `<g>
      <ellipse cx="0" cy="2" rx="95" ry="9" fill="#000" opacity=".12"/>
      <path d="M78-62c22-18 34-44 22-60-8-10-22-4-20 8 2 10 10 14 6 28-3 10-12 16-18 20z" fill="url(#${id}fur)" stroke="#7a4a24" stroke-width="1.5"/>
      <path d="M88-112c6 6 6 14 2 20" stroke="#fff3e2" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M50-6c4 0 8-2 8-8V-40H40v26c0 6 4 8 10 8z" fill="#a86a38"/>
      <path d="M68-4c5 0 9-2 9-8v-34H58v34c0 6 4 8 10 8z" fill="url(#${id}fur)" stroke="#7a4a24" stroke-width="1.2"/>
      <ellipse cx="68" cy="-3" rx="11" ry="5" fill="#fff3e2"/>
      <path d="M-62 -6c4 0 8-2 8-8v-30h-18v28c0 6 4 10 10 10z" fill="#a86a38"/>
      <path d="M-44-4c5 0 9-2 9-8v-36h-19v36c0 6 4 8 10 8z" fill="url(#${id}fur)" stroke="#7a4a24" stroke-width="1.2"/>
      <ellipse cx="-44" cy="-3" rx="11" ry="5" fill="#fff3e2"/>
      <path d="M-70-58c-6-24 18-44 70-44s86 14 86 42c0 22-20 34-72 34S-62-30-70-58z" fill="url(#${id}fur)" stroke="#7a4a24" stroke-width="1.5"/>
      <path d="M-58-40c14 14 50 16 72 12-20 10-58 8-72-12z" fill="url(#${id}furL)"/>
      <path d="M-40-96c10-6 26-8 40-6" stroke="#8f5a2e" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M-30-98c-2 30 0 52 4 70" stroke="#e5484d" stroke-width="7" fill="none"/>
      <path d="M-30-98c40 4 60 10 70 34" stroke="#e5484d" stroke-width="5" fill="none"/>
      <circle cx="-22" cy="-102" r="5" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
      <path d="M-62-82c-24-6-40-28-36-52 4-20 24-30 46-26 22 4 34 22 30 42-4 18-20 40-40 36z" fill="url(#${id}fur)" stroke="#7a4a24" stroke-width="1.5"/>
      <path d="M-74-142l-6-32 24 18zM-44-146l10-30 10 30z" fill="url(#${id}fur)" stroke="#7a4a24" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M-72-146l-3-18 12 10zM-40-148l6-18 5 17z" fill="#f3b8a0"/>
      <path d="M-98-110c-14 2-22 10-20 18 2 10 16 14 36 12 18-2 26-8 26-14" fill="url(#${id}furL)" stroke="#7a4a24" stroke-width="1.3"/>
      <path d="M-74-84c10 10 30 12 44 2" fill="url(#${id}furL)"/>
      <ellipse cx="-116" cy="-104" rx="7" ry="5.5" fill="#1f2430"/><ellipse cx="-118" cy="-106" rx="2" ry="1.4" fill="#fff" opacity=".7"/>
      <path d="M-108-90c6 4 14 4 18 0" stroke="#3b2a1c" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="-74" cy="-118" rx="6.5" ry="7" fill="#1f2430"/><circle cx="-76" cy="-121" r="2.2" fill="#fff"/>
      <path d="M-84-128c4-3 10-3 14 0" stroke="#7a4a24" stroke-width="1.6" fill="none"/>
    </g>`;
  }
  // a sitting cat, side view facing left
  function cat(id) {
    return `<g>
      <ellipse cx="0" cy="2" rx="70" ry="8" fill="#000" opacity=".12"/>
      <path d="M44-10c40 6 56-14 46-40-6-14-22-12-20 0 2 10 8 14 2 24-4 8-16 10-28 10z" fill="url(#${id}cat)" stroke="#4b5563" stroke-width="1.4"/>
      <path d="M-40-4c-8-30-4-74 30-90 30-12 60 6 64 40 4 30-4 50-14 50z" fill="url(#${id}cat)" stroke="#4b5563" stroke-width="1.5"/>
      <path d="M-18-70c10 4 22 4 32 0M-10-52c10 4 22 4 30 0M0-34c8 3 16 3 24 0" stroke="#5f6874" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
      <path d="M-36-4c-2-16 0-34 6-46h16c-4 14-6 30-4 46z" fill="url(#${id}cat)" stroke="#4b5563" stroke-width="1.3"/>
      <ellipse cx="-24" cy="-3" rx="13" ry="5" fill="#e5e7eb"/>
      <g transform="translate(24 16)">
      <path d="M-44-96c-26-2-42-20-38-42 4-20 22-30 42-26 20 4 32 22 28 40-4 18-14 30-32 28z" fill="url(#${id}cat)" stroke="#4b5563" stroke-width="1.5"/>
      <path d="M-74-146l-4-28 22 14zM-40-156l14-24 6 30z" fill="url(#${id}cat)" stroke="#4b5563" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M-72-148l-2-16 10 9zM-36-156l8-14 3 16z" fill="#f4b6c2"/>
      <path d="M-60-138c6-6 14-8 20-6M-50-148c4-6 10-8 16-6" stroke="#5f6874" stroke-width="3" fill="none" opacity=".6"/>
      <ellipse cx="-68" cy="-118" rx="5.5" ry="7.5" fill="#c9e265"/><ellipse cx="-68" cy="-118" rx="2" ry="6" fill="#1f2430"/><circle cx="-70" cy="-121" r="1.6" fill="#fff"/>
      <path d="M-84-104l5 4 5-4z" fill="#f08aa0"/>
      <path d="M-79-100c-2 5-6 7-10 5M-79-100c2 5 6 7 10 5" stroke="#4b5563" stroke-width="1.4" fill="none"/>
      <path d="M-86-104l-30-6M-86-100l-30 2M-74-104l26-8M-74-100l26 0" stroke="#e5e7eb" stroke-width="1.2" opacity=".9"/>
      </g>
      <path d="M-14-62c-6 8-18 12-30 10" stroke="#e5484d" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>`;
  }
  const HE = ["#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#a78bfa", "#f87171", "#38bdf8", "#fb923c", "#4ade80"];
  const HOT = ["#f59e0b", "#ea580c", "#fbbf24", "#f97316", "#fb923c", "#dc2626", "#facc15"];
  function balloon(x, y, c, r = 21, id) {
    return `<g><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.22}" fill="${c}"/>
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.22}" fill="url(#${id}bl)"/>
      <ellipse cx="${x - r * .35}" cy="${y - r * .45}" rx="${r * .22}" ry="${r * .36}" fill="#fff" opacity=".55" transform="rotate(-20 ${x - r * .35} ${y - r * .45})"/>
      <path d="M${x - 4} ${y + r * 1.22}h8l-4 6z" fill="${c}"/></g>`;
  }
  // a bunch of k balloons above (kx, ky) whose strings meet at the knot
  function bunch(k, kx, ky, cols, id, seed = 1, len = 70, gap = 20) {
    let rnd = seed;const R = () => ((rnd = (rnd * 9301 + 49297) % 233280) / 233280);
    const Rm = gap * Math.sqrt(k), cy = ky - len - Rm * .8;
    const pts = [];
    for (let i = 0; i < k; i++) { const r = gap * Math.sqrt(i + .5), th = i * 2.39996 + R() * .3; pts.push([kx + r * Math.cos(th) * 1.15, cy + r * Math.sin(th) * .8]); }
    pts.sort((a, b) => a[1] - b[1]);bunch.top = pts[0][1] - 19 * 1.22;
    let s = `<defs><radialGradient id="${id}bl" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient></defs>`;
    for (const [x, y] of pts) s += `<path d="M${x} ${y + 24} Q${(x + kx) / 2 + 4} ${(y + ky) / 2 + 14} ${kx} ${ky}" stroke="#94a3b8" stroke-width="1.2" fill="none"/>`;
    pts.forEach(([x, y], i) => { s += balloon(x, y, cols[(i * 5 + seed) % cols.length], 19, id); });
    return s;
  }
  // a whole picture (the sheet uses this): stage 0..4, width 380 x height 330
  function art(stage) {
    const id = "a" + (++uid);const S = STAGE[stage] || STAGE[0] || { who: "dog", gas: RH };
    const who = stage === 2 ? "cat" : "dog", hot = stage === 3, boss = stage === 4;
    let s = `<svg viewBox="0 0 380 330" xmlns="${NS}">${defs(id)}`;
    const bs = boss ? bunch(8, 190, 210, HE, id, 7, 60) : bunch(9, 190, 196, hot ? HOT : HE, id, stage + 3), top = bunch.top;
    if (boss) s += `<rect x="10" y="0" width="360" height="14" fill="#cbd5e1"/><path d="M10 14h360" stroke="#475569" stroke-width="2"/>
      <defs><marker id="${id}ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#c2410c"/></marker></defs>
      <path d="M230 16V${top - 2}" stroke="#c2410c" stroke-dasharray="4 3" stroke-width="2" marker-end="url(#${id}ar)" marker-start="url(#${id}ar)"/><text x="238" y="${(top + 16) / 2 + 5}" font-size="14" fill="#c2410c" font-weight="700">10 m</text>`;
    s += bs;
    if (!boss) s += `<text x="292" y="48" font-size="15" fill="#5b6478">${hot ? "อากาศร้อน" : "ฮีเลียม"}</text>`;
    else s += `<text x="24" y="140" font-size="15" fill="#5b6478">× 1250 ลูก</text>`;
    s += `<path d="M190 ${boss ? 210 : 196} L${who === "cat" ? 178 : 168} ${who === "cat" ? 232 : 228}" stroke="#64748b" stroke-width="2"/>`;
    s += `<g transform="translate(${who === "cat" ? 200 : 200} 322) scale(.78)">${who === "cat" ? cat(id) : dog(id)}</g>`;
    return s + "</svg>";
  }

  /* ---------- the lift after an answer ---------- */
  const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  function physics(S, n) {
    const up = n * RA * V * G, gas = n * S.gas * V * G, rub = n * MR * G, w = ANIMAL[S.who] * G;
    const F = up - gas - rub - w, m = ANIMAL[S.who] + n * (S.gas * V + MR);
    return { F: near(up - gas - rub, w) ? 0 : F, m, a: near(up - gas - rub, w) ? 0 : F / m };
  }
  function quest(box, o) {
    const S = STAGE[o.stage];if (!S) return null;
    const id = "q" + (++uid), boss = !!S.boss;
    let n = boss ? S.n : Math.round(+o.v);
    if (!boss && !(n >= 0)) n = 0;
    const P = physics(S, n);
    const W = 600, H = 520, top = boss ? 40 : 30, ground = H - 40;
    // metres to pixels: the boss shows the 10 m to the ceiling; otherwise 10 m of sky
    let px = (ground - 230 - top) / 10;
    const k = Math.max(1, Math.min(boss ? 14 : 16, Math.round(Math.sqrt(Math.max(n, 1)) / 1.8)));
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="${NS}" style="background:linear-gradient(#cfe8ff,#f3f9ff 70%,#e9f5e1);font-family:Sarabun,'Noto Sans Thai',system-ui,sans-serif">${defs(id)}
      ${boss ? `<rect x="0" y="0" width="${W}" height="${top}" fill="#cbd5e1"/><path d="M0 ${top}h${W}" stroke="#475569" stroke-width="3"/>` : `<g opacity=".8"><ellipse cx="90" cy="70" rx="46" ry="16" fill="#fff"/><ellipse cx="480" cy="110" rx="60" ry="18" fill="#fff"/></g>`}
      <rect x="0" y="${ground}" width="${W}" height="${H - ground}" fill="#a3d39c"/><path d="M0 ${ground}h${W}" stroke="#6fae6a" stroke-width="3"/>
      <g id="${id}rig">${bunch(k, 300, ground - 160, S.gas === RT ? HOT : HE, id, n % 97 + 5)}
        <path d="M300 ${ground - 160} L${S.who === "cat" ? 290 : 280} ${ground - 120}" stroke="#64748b" stroke-width="2"/>
        <g transform="translate(310 ${ground}) scale(.85)">${S.who === "cat" ? cat(id) : dog(id)}</g></g>
      <text x="20" y="${H - 12}" font-size="18" font-weight="700" fill="#1f3a2a">ลูกโป่ง ${n.toLocaleString("en-US")} ลูก</text>
      <text id="${id}t" x="${W - 20}" y="${H - 12}" font-size="18" font-weight="700" fill="#1f3a2a" text-anchor="end"></text>
      <g id="${id}msg"></g></svg>`;
    const svg = box.querySelector("svg"), rig = svg.getElementById(id + "rig"), tt = svg.getElementById(id + "t"), msg = svg.getElementById(id + "msg");
    const my = boss ? H - 150 : 30;   // the boss ends at the ceiling: its message goes low
    const say = (t, c) => { msg.innerHTML = `<rect x="${W / 2 - 230}" y="${my}" width="460" height="54" rx="14" fill="#fff" opacity=".93"/><text x="${W / 2}" y="${my + 35}" font-size="22" font-weight="800" fill="${c}" text-anchor="middle">${t}</text>`; };
    const tEnd = boss ? Math.max(0, +o.v || 0) : 3.2;
    const reach = bunch.top - top;   // pixels from the balloon top to the ceiling = the 10 m
    if (boss) px = reach / S.h;
    let t0 = null, raf = 0, done = false;
    const step = (now) => {
      if (t0 === null) t0 = now;const t = Math.min((now - t0) / 1000, tEnd);
      let y = 0, wob = 0;
      if (P.a > 0) y = .5 * P.a * t * t;
      else if (P.a === 0) wob = Math.sin(t * 3) * 3;
      else wob = Math.sin(t * 9) * 4;
      let ypx = y * px;
      if (boss && ypx >= reach) ypx = reach;
      if (!boss && ypx > ground) ypx = ground + 400;
      rig.setAttribute("transform", P.a < 0 ? `rotate(${wob / 3} 300 ${ground})` : `translate(0 ${-ypx + wob})`);
      tt.textContent = boss ? "t = " + t.toFixed(1) + " s" : "";
      if (t >= tEnd && !done) {
        done = true;
        if (boss) {
          const yEnd = .5 * P.a * tEnd * tEnd;
          if (Math.abs(yEnd - S.h) <= .02 * S.h) say("ชนเพดานพอดีที่ " + tEnd + " s!", "#2f7a4f");
          else if (yEnd > S.h) say("ชนเพดานก่อนถึงเวลาที่ตอบ!", "#c2410c");
          else say("ที่ " + tEnd + " s ยังไม่ถึงเพดาน (ขึ้นมา " + (.5 * P.a * tEnd * tEnd).toFixed(1) + " m)", "#1f5fa8");
        } else if (P.a < 0) say("ไม่ลอย! แรงยกน้อยกว่าน้ำหนัก", "#b03a2e");
        else if (P.a === 0) say("ลอยนิ่งพอดี แรงยกเท่ากับน้ำหนัก", "#2f7a4f");
        else if (P.a < 1) say("ลอยขึ้นช้าๆ", "#1f5fa8");
        else say(P.a < 5 ? "ลอยขึ้น!" : "พุ่งขึ้นเร็วมาก!", "#1f5fa8");
      }
      if (t < tEnd || (P.a === 0 && !boss) || (P.a < 0)) raf = requestAnimationFrame(step);
    };
    if (boss && !(tEnd > 0)) { say("ใส่เวลาเป็นวินาที", "#b03a2e"); return null; }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }
  window.SC_ANIMS = Object.assign(window.SC_ANIMS || {}, { pages: {}, make: {}, art, quest,
    // the sheet's own titles for the lift window
    questTitle: (st) => (STAGE[st] ? (STAGE[st].boss ? "ลองดูการเคลื่อนที่" : "ลองผูกลูกโป่งตามคำตอบ") : "") });
})();
