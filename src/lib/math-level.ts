// Teacher side of the Maths Level Finder (public/math-level/). The student page sends its "LF1-" result code
// to the sheet in 100-character pieces as the answers of quiz "math-r2"; the bank with answers is in
// src/data/math-keys.json, encrypted with the teacher password (tools/encrypt-check-keys.mjs ... src/data/math-keys.json).

export const MATH_QUIZ = 'math-r2';

type Item = { s: string; L: number; t: 'num' | 'mc' | 'pair'; q: string; o?: string[]; a: string | number | string[]; u?: string };
export type MathKeys = { title: string; bank: Item[] };
// log entry: [topic, level, bank index, given, ok 1/0, seconds]
type Entry = [string, number, number, string | number | string[] | null, number, number];
export type Result = { name: string; started: string; ended?: string; chosen: string[]; ceil: Record<string, number>; start?: Record<string, number>; log: Entry[] };

const SNAME: Record<string, string> = {
  int: 'Integers & Fractions', exp: 'Exponents', real: 'Real Numbers', eq: 'Equations', pct: 'Ratio & Percent',
  lin: 'Linear Graphs', poly: 'Polynomials', meas: 'Shapes & Measurement', pyth: 'Pythagoras', trans: 'Transformations',
};
const LNAME = ['ยังไม่ถึง L1', 'ม.1 พื้นฐาน', 'ม.2 ในโรงเรียน', 'ม.2 ยาก', 'สอบเข้า', 'สอบเข้า ยาก'];

const XK = 'SCItem-LevelFinder';
const xor = (t: string) => [...t].map((c, k) => String.fromCharCode(c.charCodeAt(0) ^ XK.charCodeAt(k % XK.length))).join('');

/** Returns the result, or null if the code is damaged. */
export function decodeLF(code: string): Result | null {
  try {
    const bin = xor(atob(code.replace(/\s+/g, '').replace(/^LF1-/, '')));
    const r = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    return r && r.v === 1 && Array.isArray(r.log) ? r : null;
  } catch {
    return null;
  }
}

export const mathScore = (r: Result) => `${r.log.filter((e) => e[4]).length}/${r.log.length}`;

const esc = (s: unknown) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const frac = (s: string) => s.replace('-', '−');
const level = (r: Result, k: string) => {
  const c = r.ceil[k] ?? 0, st = r.start?.[k] ?? 2;
  return c === 0 && st > 2 ? `ต่ำกว่า L${st}` : `L${c}`;
};

function given(q: Item, g: Entry[3]) {
  if (g == null) return '—';
  if (q.t === 'mc') return q.o![g as number];
  if (q.t === 'pair') return `(${esc((g as string[])[0])}, ${esc((g as string[])[1])})`;
  return esc(g);
}
function key(q: Item) {
  if (q.t === 'mc') return q.o![q.a as number];
  if (q.t === 'pair') return `(${frac((q.a as string[])[0])}, ${frac((q.a as string[])[1])})`;
  return frac(q.a as string) + (q.u ? ' ' + esc(q.u) : '');
}

export function mathReport(r: Result, keys: MathKeys) {
  const secs = r.log.reduce((a, e) => a + e[5], 0);
  const lv = r.chosen.map((k) => `<li><b>${level(r, k)}</b> ${esc(SNAME[k] ?? k)}<small>${LNAME[r.ceil[k] ?? 0]}</small></li>`).join('');
  const rows = r.log.map((e, j) => {
    const q = keys.bank[e[2]];
    const ok = !!e[4];
    return `<div class="qa ${ok ? 'ok' : 'no'}">
      <p class="qh"><span class="mk">${ok ? '✓' : '✗'}</span> ข้อ ${j + 1} · ${esc(SNAME[e[0]] ?? e[0])} · L${e[1]} <small class="${e[5] > 180 ? 'slow' : ''}">${mmss(e[5])}</small></p>
      <p class="qt">${q.q}</p>
      <p class="you">นักเรียนตอบ: ${e[3] == null ? 'ไม่รู้ (ข้าม)' : given(q, e[3])}</p><p class="key">เฉลย: ${key(q)}</p></div>`;
  }).join('');
  return `<h2>${esc(r.name || 'No name')} <span class="cnt">${mathScore(r)} · ${mmss(secs)}</span></h2>
    <p class="hint">${esc(keys.title)} · ${new Date(r.ended || r.started).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} · ข้อที่ใช้เวลาเกิน 3 นาทีเวลาเป็นสีส้ม</p>
    <ul class="lv">${lv}</ul>${rows}`;
}
