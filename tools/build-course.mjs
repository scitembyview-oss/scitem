// Builds a paid web course (/course/<id>/): the lesson deck to write on, the answer key page by page, and a review quiz,
// all locked behind a code. Each buyer gets their own code; the teacher password opens it too.
// The course file (deck path, answers, quiz) and the teacher password stay OUT of this repo: only ciphertext is committed.
//
//   node tools/build-course.mjs build  <course.json> <teacher password> [out dir]     -> public/course/<id>/ (index.html, data.json, keys.json)
//   node tools/build-course.mjs codes  <out dir> <teacher password> <how many> [codes.csv]  -> new buyer codes, printed and added to codes.csv
//                                                                                    (default course-codes-<id>.csv, git-ignored)
//   node tools/build-course.mjs revoke <out dir> <code>                                -> that code stops working (e.g. it was shared)
//
// Rebuilding with the same teacher password keeps every buyer code working. Commit the out dir after each command.
// course.json: { id, title, th, deck: "public/<deck>/index.html", shop: "/shop/#y7",
//   key: { "<page>": [{ q: "1.1", a: "<html>" }, ...] }, quiz: [{ q: "<html>", c: ["..", ..], a: <index>, why: ".." }] }
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { webcrypto as crypto } from 'node:crypto';

const enc = new TextEncoder();
const b64 = (u) => Buffer.from(u).toString('base64');
const unb64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));
const T_ITER = 200000, C_ITER = 100000;
const ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';   // no 0/O, 1/I: codes get read out and typed on an iPad

async function teacherKey(pw, keys) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(keys.t.salt), iterations: T_ITER, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}
async function seal(key, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return { iv: b64(iv), ct: b64(new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes))) };
}
// the same steps run in the course page: code -> 8-byte id (where to look) + the key that opens the course key
export const norm = (code) => code.toUpperCase().replace(/[^0-9A-Z]/g, '');
async function codeBits(code, keys) {
  const base = await crypto.subtle.importKey('raw', enc.encode(norm(code)), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: unb64(keys.c), iterations: C_ITER, hash: 'SHA-256' }, base, 384));
  const id = Buffer.from(bits.slice(0, 8)).toString('hex');
  const wrap = await crypto.subtle.importKey('raw', bits.slice(16, 48), 'AES-GCM', false, ['encrypt', 'decrypt']);
  return { id, wrap };
}
async function checkTeacher(pw, keys) {
  const k = await teacherKey(pw, keys);
  try { await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(keys.t.iv) }, k, unb64(keys.t.ct)); }
  catch { throw new Error('wrong teacher password for this course (use the one it was first built with)'); }
  return k;
}
const readKeys = (dir) => JSON.parse(readFileSync(join(dir, 'keys.json'), 'utf8'));
const writeKeys = (dir, keys) => writeFileSync(join(dir, 'keys.json'), JSON.stringify(keys, null, 1) + '\n');

const [cmd, ...a] = process.argv.slice(2);
if (cmd === 'build') {
  const [file, pw, outArg] = a;
  if (!file || !pw) throw new Error('usage: node tools/build-course.mjs build <course.json> <teacher password> [out dir]');
  const c = JSON.parse(readFileSync(file, 'utf8'));
  const out = outArg || join('public', 'course', c.id);
  mkdirSync(out, { recursive: true });
  let keys, k;
  if (existsSync(join(out, 'keys.json'))) { keys = readKeys(out); k = await checkTeacher(pw, keys); }
  else {
    keys = { t: { salt: b64(crypto.getRandomValues(new Uint8Array(16))) }, c: b64(crypto.getRandomValues(new Uint8Array(16))), codes: {} };
    k = await teacherKey(pw, keys);
    Object.assign(keys.t, await seal(k, enc.encode('scitem')));
  }
  const deck = readFileSync(c.deck, 'utf8');
  const pages = (deck.match(/<div class="sheet">/g) || []).length;
  for (const p of Object.keys(c.key || {})) if (+p < 1 || +p > pages) throw new Error(`key for page ${p}, but the deck has ${pages} pages`);
  (c.quiz || []).forEach((q, i) => { if (!(q.a >= 0 && q.a < q.c.length)) throw new Error(`quiz ${i + 1}: answer index out of range`); });
  const bundle = { title: c.title, th: c.th, deck, pages, key: c.key || {}, quiz: c.quiz || [] };
  writeFileSync(join(out, 'data.json'), JSON.stringify(await seal(k, enc.encode(JSON.stringify(bundle)))));
  writeKeys(out, keys);
  const cfg = { id: c.id, title: c.title, th: c.th || '', shop: c.shop || '/shop/' };
  const shell = readFileSync(new URL('./course-shell.html', import.meta.url), 'utf8');
  writeFileSync(join(out, 'index.html'), shell.replace(/\/\*__CFG__\*\/\{[^\n]*?\}(?=;)/, JSON.stringify(cfg)).replace('<title>Scitem Course</title>', `<title>${c.title} · scitem</title>`));
  console.log(`wrote ${out}: ${pages} pages, answers for ${Object.keys(bundle.key).length} pages, ${bundle.quiz.length} quiz questions, ${Object.keys(keys.codes).length} buyer codes`);
} else if (cmd === 'codes') {
  const [out, pw, nArg, csvArg] = a;
  const n = parseInt(nArg, 10);
  if (!out || !pw || !(n > 0)) throw new Error('usage: node tools/build-course.mjs codes <out dir> <teacher password> <how many> [codes.csv]');
  const keys = readKeys(out), k = await checkTeacher(pw, keys);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', k));
  const id = out.split(/[\\/]/).filter(Boolean).pop(), prefix = norm(id).slice(0, 3);
  const csv = csvArg || `course-codes-${id}.csv`;   // .gitignore keeps these out of the repo
  const made = [];
  while (made.length < n) {
    const r = crypto.getRandomValues(new Uint8Array(8));
    const body = [...r].map((x) => ALPHA[x & 31]).join('');
    const code = `${prefix}-${body.slice(0, 4)}-${body.slice(4)}`;
    const { id, wrap } = await codeBits(code, keys);
    if (keys.codes[id]) continue;
    keys.codes[id] = await seal(wrap, raw);
    made.push(code);
  }
  writeKeys(out, keys);
  const day = new Date().toISOString().slice(0, 10);
  if (!existsSync(csv)) writeFileSync(csv, 'code,made,buyer\n');
  appendFileSync(csv, made.map((c) => `${c},${day},`).join('\n') + '\n');
  console.log(made.join('\n'));
  console.log(`${made.length} new codes in ${join(out, 'keys.json')} (commit it) and ${csv} (keep it private)`);
} else if (cmd === 'revoke') {
  const [out, code] = a;
  if (!out || !code) throw new Error('usage: node tools/build-course.mjs revoke <out dir> <code>');
  const keys = readKeys(out), { id } = await codeBits(code, keys);
  if (!keys.codes[id]) throw new Error('no such code in this course');
  delete keys.codes[id];
  writeKeys(out, keys);
  console.log(`${code} no longer opens ${out} (commit keys.json)`);
} else {
  console.error('usage: node tools/build-course.mjs build|codes|revoke ... (see the top of this file)');
  process.exit(1);
}
