// Builds a live-class page (student + teacher #teacher) from tools/class-shell.html.
// The questions are encrypted twice: with the student code (student screen) and with the teacher code (#teacher),
// so the page shows nothing until the right code is typed, and the student code does not open the teacher screen.
// Work goes to the Google Sheet at CLASS_SHEET_URL in src/data/catalog.ts (tools/check-sheet.gs); add --local to keep it in
// the browser instead (try-out: open the student and #teacher pages in two tabs of one browser).
// Usage: node tools/build-class.mjs <content.json> <student code> <teacher code> <out.html> <class id> [--local]
//   e.g. python3 tools/build-class-l3.py <kit>/worksheets/worksheet-src /tmp/l3.json
//        node tools/build-class.mjs /tmp/l3.json <student code> <teacher password> public/class/l3/index.html l3
// The content holds the answers: keep the .json out of the repo, and never commit either code.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { webcrypto as crypto } from 'node:crypto';

const args = process.argv.slice(2);
const local = args.includes('--local');
const [file, sCode, tCode, out, id] = args.filter((a) => a !== '--local');
if (!file || !sCode || !tCode || !out || !id) {
  console.error('usage: node tools/build-class.mjs <content.json> <student code> <teacher code> <out.html> <class id> [--local]');
  process.exit(1);
}
const plain = new TextEncoder().encode(JSON.stringify(JSON.parse(readFileSync(file, 'utf8'))));
const b64 = (u) => Buffer.from(u).toString('base64');
async function seal(code) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iter = 200000;
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  return { iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}
const blob = JSON.stringify({ s: await seal(sCode), t: await seal(tCode) });
const shell = readFileSync(new URL('./class-shell.html', import.meta.url), 'utf8');
const sheet = local ? null : /CLASS_SHEET_URL\s*=\s*'([^']*)'/.exec(readFileSync(new URL('../src/data/catalog.ts', import.meta.url), 'utf8'))[1];
if (!local && !sheet) throw new Error('CLASS_SHEET_URL is empty in src/data/catalog.ts (or build with --local)');
const html = shell.replace('/*__DATA__*/null', blob).replace('/*__CLASS__*/"demo"', JSON.stringify(id)).replace('/*__SHEET__*/null', JSON.stringify(sheet));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log('wrote ' + out);
