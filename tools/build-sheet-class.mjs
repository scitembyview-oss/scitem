// Builds a worksheet live class (student / #show / #teacher) from two PDFs and tools/sheet-class-shell.html.
// The student PDF becomes page images anyone can see (no answers in it). The answer-key PDF — the same pages, page for page,
// with the answers filled in — is encrypted with the teacher code into key.json, so only the teacher screens can open it.
// Work goes to the Google Sheet at CLASS_SHEET_URL in src/data/catalog.ts (tools/check-sheet.gs, tab "คาบสด");
// add --local to keep it in the browser instead (try-out: student and #teacher in two tabs of one browser).
// FIREBASE in catalog.ts (when filled in) also streams every stroke live to the hidden #live screen (rules: tools/firebase-rules.json).
// Answer boxes: --answers <answers.json> (kept OUT of the repo, e.g. project files) = {q: [{id, page, name, parts: [{l, v, u, tol?} | {l, c: [choices], a} | {l, t: 1}]}]}.
// The labels and choices go into the page; the values (v, u, a) only into key.json. Use "-" as key.pdf for a class without key pages.
// Usage: node tools/build-sheet-class.mjs <student.pdf> <key.pdf|-> <title> <teacher code> <out dir> <class id> [--local] [--answers <file>]
//   e.g. node tools/build-sheet-class.mjs lesson3-student.pdf lesson3-key.pdf "Living Things and Weather" <code> public/class/sci3 sci3
//   or: node tools/build-sheet-class.mjs --reshell public/class/sci3   (after editing the shell only)
//   or: node tools/build-sheet-class.mjs --hints public/class/cb2h <hints.json> <code>   (drawn Hint 1 / Hint 2 per question)
// Needs pdftoppm (poppler). Keep the key PDF out of the repo, and never commit the teacher code.
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { webcrypto as crypto } from 'node:crypto';

const args = process.argv.slice(2);
// --reshell <out dir>: rebuild index.html from the current shell only (pages and key.json stay as they are; no PDFs or code needed)
if (args[0] === '--reshell') {
  const html = readFileSync(join(args[1], 'index.html'), 'utf8');
  const cfg = JSON.parse(/const CFG=(\{[^\n]*?\});/.exec(html)[1]);
  if (cfg.sheet) cfg.fb = firebase();
  if (existsSync(join(args[1], 'anims.js'))) cfg.anims = Date.now() % 1e8; else delete cfg.anims;   // page animations (cache-busting stamp)
  const shell = readFileSync(new URL('./sheet-class-shell.html', import.meta.url), 'utf8');
  writeFileSync(join(args[1], 'index.html'), shell.replace(/\/\*__CFG__\*\/\{[^\n]*?\}(?=;)/, () => JSON.stringify(cfg)).replace('<title>Scitem Class</title>', () => `<title>${cfg.title}</title>`));
  console.log(`reshelled ${args[1]}`);
  process.exit(0);
}
// --hints <out dir> <hints.json> <teacher code>: put the drawn hints ({qid: [hint 1 svg, hint 2 svg]}, made by a tools/hints-*.py
// script kept out of the repo) into key.json, re-encrypted with the same code. Nothing else changes.
if (args[0] === '--hints') {
  const [, dir, file, code] = args;
  const B = JSON.parse(readFileSync(join(dir, 'key.json'), 'utf8')), ub = (s) => Buffer.from(s, 'base64');
  const k0 = await derive(code, ub(B.salt), B.iter, 'decrypt');
  const plain = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub(B.iv) }, k0, ub(B.ct))));
  plain.hints = JSON.parse(readFileSync(file, 'utf8'));
  writeFileSync(join(dir, 'key.json'), JSON.stringify(await seal(code, new TextEncoder().encode(JSON.stringify(plain)))));
  console.log(`${dir}/key.json: hints for ${Object.keys(plain.hints).join(' ')}`);
  process.exit(0);
}
async function derive(code, salt, iter, use) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, [use]);
}
async function seal(code, plain) {
  const b64 = (u) => Buffer.from(u).toString('base64');
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), iter = 200000;
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await derive(code, salt, iter, 'encrypt'), plain));
  return { iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}
function firebase() {
  const m = /FIREBASE\s*=\s*\{\s*key:\s*'([^']*)',\s*db:\s*'([^']*)'/.exec(readFileSync(new URL('../src/data/catalog.ts', import.meta.url), 'utf8'));
  return m && m[1] && m[2] ? { key: m[1], db: m[2] } : null;
}
const local = args.includes('--local');
const ai = args.indexOf('--answers'), ansFile = ai >= 0 ? args[ai + 1] : null;
const [stuPdf, keyPdf, title, tCode, out, id] = args.filter((a, i) => a !== '--local' && i !== ai && i !== ai + 1);
if (!stuPdf || !keyPdf || !title || !tCode || !out || !id) {
  console.error('usage: node tools/build-sheet-class.mjs <student.pdf> <key.pdf> <title> <teacher code> <out dir> <class id> [--local]');
  process.exit(1);
}
const render = (pdf, dir, q = 78, w = 1400) => {   // the key pages are smaller: they come down in one encrypted file
  execFileSync('pdftoppm', ['-jpeg', '-jpegopt', `quality=${q}`, '-scale-to-x', String(w), '-scale-to-y', '-1', pdf, join(dir, 'x')]);
  return readdirSync(dir).filter((f) => f.startsWith('x-')).sort();
};
mkdirSync(join(out, 'p'), { recursive: true });
for (const f of readdirSync(join(out, 'p'))) rmSync(join(out, 'p', f));
const tmpS = mkdtempSync(join(tmpdir(), 'sc-s-')), tmpK = mkdtempSync(join(tmpdir(), 'sc-k-'));
const sp = render(stuPdf, tmpS), kp = keyPdf === '-' ? [] : render(keyPdf, tmpK, 70, 1100);
const ansQ = ansFile ? JSON.parse(readFileSync(ansFile, 'utf8')).q : [];
const kpaged = ansQ.length && ansQ.every((q) => q.kpage);   // a tutor sheet laid out its own way: each question says its key page
if (kp.length && !kpaged && sp.length !== kp.length) throw new Error(`the key has ${kp.length} pages, the student sheet ${sp.length}: they must match page for page`);
sp.forEach((f, i) => renameSync(join(tmpS, f), join(out, 'p', 'p' + String(i + 1).padStart(2, '0') + '.jpg')));
const qs = {}, answers = {};
const kq = {}, kh = {}, kmap = [];
for (const q of ansQ) {
  if (!(q.page >= 1 && q.page <= sp.length)) throw new Error(`${q.id}: page ${q.page} is not in the sheet`);
  const pid = 'p' + String(q.page).padStart(2, '0');
  (qs[pid] ||= []).push({ id: q.id, name: q.name, parts: q.parts.map((p) => (p.c ? { l: p.l, c: p.c } : { l: p.l })) });
  if (q.kpage) kq[q.id] = q.kpage - 1;
  if (q.hint) kh[q.id] = q.hint;                    // [top, bottom] of its worked-solution box on the key page, 0..1
  answers[q.id] = q.parts.map((p) => (p.c ? { c: 1, a: p.a } : p.t ? { t: 1 } : { v: p.v, u: p.u ?? '', ...(p.tol ? { tol: p.tol } : {}) }));
}
// kmap[student page] = the key page to open for it (the first question on that page, else the page before's)
if (kpaged) for (let i = 0, last = 0; i < sp.length; i++) { const q = ansQ.find((x) => x.page === i + 1); if (q) last = q.kpage - 1; kmap.push(last); }
const plain = new TextEncoder().encode(JSON.stringify({ pages: kp.map((f) => readFileSync(join(tmpK, f)).toString('base64')), answers, ...(kpaged ? { kmap, kq, kh } : {}) }));
rmSync(tmpS, { recursive: true }); rmSync(tmpK, { recursive: true });

writeFileSync(join(out, 'key.json'), JSON.stringify(await seal(tCode, plain)));

const sheet = local ? null : /CLASS_SHEET_URL\s*=\s*'([^']*)'/.exec(readFileSync(new URL('../src/data/catalog.ts', import.meta.url), 'utf8'))[1];
if (!local && !sheet) throw new Error('CLASS_SHEET_URL is empty in src/data/catalog.ts (or build with --local)');
const cfg = { id, title, pages: sp.length, sheet, fb: local ? null : firebase(), ...(ansFile ? { qs } : {}) };
const shell = readFileSync(new URL('./sheet-class-shell.html', import.meta.url), 'utf8');
writeFileSync(join(out, 'index.html'), shell.replace(/\/\*__CFG__\*\/\{[^\n]*?\}(?=;)/, JSON.stringify(cfg)).replace('<title>Scitem Class</title>', `<title>${title}</title>`));
console.log(`wrote ${out}: ${sp.length} pages`);
