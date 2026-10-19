// Builds a live-class page (student + teacher #teacher) from tools/class-shell.html.
// The questions are encrypted twice: with the student code (student screen) and with the teacher code (#teacher),
// so the page shows nothing until the right code is typed, and the student code does not open the teacher screen.
// Usage: node tools/build-class.mjs <content.json> <student code> <teacher code> <out.html> [class id]
//   e.g. node tools/build-class.mjs tools/class-demo.json <student code> <teacher code> public/class-demo/index.html demo
// Never commit either code.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { webcrypto as crypto } from 'node:crypto';

const [file, sCode, tCode, out, id = 'demo'] = process.argv.slice(2);
if (!file || !sCode || !tCode || !out) {
  console.error('usage: node tools/build-class.mjs <content.json> <student code> <teacher code> <out.html> [class id]');
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
const html = shell.replace('/*__DATA__*/null', blob).replace('/*__CLASS__*/"demo"', JSON.stringify(id));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log('wrote ' + out);
