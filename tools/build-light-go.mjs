// Build a phone lesson (Duolingo style) from a content file kept OUTSIDE this public repo.
//   node tools/build-light-go.mjs <content.mjs> public/light-m4-go/index.html <key password>
// key password = what the hidden screen (#watch) asks for to show the answer key; keep it outside the repo.
// The content file has the answers. The page gets only salted hashes of the right answer
// and the "why" text encrypted with a key made from the right answer (AES-GCM),
// so nothing in the committed page says which option is right.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const [src, out, keyPw] = process.argv.slice(2);
if (!src || !out || !keyPw) { console.error('usage: node tools/build-light-go.mjs <content.mjs> <out.html> <key password>'); process.exit(1); }
const content = (await import(pathToFileURL(resolve(src)).href)).default;
const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();
const hex = (b) => Buffer.from(b).toString('hex');
const sha = (s) => subtle.digest('SHA-256', enc.encode(s));
const hashOf = async (id, canon) => hex(await sha(`m4go:${id}:${canon}`)).slice(0, 20);
async function lock(id, canon, text) {
  const key = await subtle.importKey('raw', await sha(`m4key:${id}:${canon}`), 'AES-GCM', false, ['encrypt']);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  return Buffer.from(iv).toString('base64') + '.' + Buffer.from(ct).toString('base64');
}
const byText = (a, b) => String(a).localeCompare(String(b));

const lessons = [], key = {};
for (const [li, L] of content.lessons.entries()) {
  const cards = [];
  for (const [ci, c] of L.cards.entries()) {
    const id = `${li}-${ci}`;
    if (c.type === 'teach') { cards.push(c); continue; }
    let canon, pub;
    if (c.type === 'choice') {
      const keys = c.opts.map((o) => (typeof o === 'object' ? o.k : o));
      if (!keys.includes(c.ans)) throw new Error(`${id}: ans is not one of the options`);
      canon = c.ans;
      pub = { opts: [...c.opts].sort((a, b) => byText(a.k ?? a, b.k ?? b)) };
    } else if (c.type === 'order') {
      canon = c.tiles.join('|');
      pub = { tiles: [...c.tiles].sort(byText) };
    } else if (c.type === 'match') {
      canon = c.pairs.map(([l, r]) => `${l}=${r}`).join('|');
      pub = { lefts: c.pairs.map((p) => p[0]), rights: c.pairs.map((p) => p[1]).sort(byText) };
    } else throw new Error(`${id}: unknown type ${c.type}`);
    key[id] = { k: canon, why: c.why };
    if (!c.hint || !c.why || !c.tag) throw new Error(`${id}: needs tag, hint and why`);
    cards.push({ type: c.type, tag: c.tag, q: c.q, pic: c.pic, boss: c.boss, hint: c.hint, ...pub, h: await hashOf(id, canon), x: await lock(id, canon, c.why) });
  }
  lessons.push({ title: L.title, color: L.color, cards });
}
// answer key for #watch: AES-GCM, key from the password with PBKDF2 (same numbers as openKey() in the shell)
async function lockKey(obj, pw) {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16)), iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const base = await subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
  const k = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, k, enc.encode(JSON.stringify(obj)));
  return [salt, iv, new Uint8Array(ct)].map((b) => Buffer.from(b).toString('base64')).join('.');
}
const data = { id: content.id, title: content.title, sub: content.sub, badge: content.badge, unit: content.unit, mascot: content.mascot, lessons, key: await lockKey(key, keyPw) };
const shell = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'light-go-shell.html'), 'utf8');
const html = shell.replace('/*DATA*/null', JSON.stringify(data)).replace('<!--TITLE-->', content.title);
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(out, html);
console.log('wrote', out, lessons.map((l) => l.cards.length).join('+'), 'cards');
