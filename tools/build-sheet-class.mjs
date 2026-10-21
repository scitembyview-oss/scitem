// Builds a worksheet live class (student / #show / #teacher) from two PDFs and tools/sheet-class-shell.html.
// The student PDF becomes page images anyone can see (no answers in it). The answer-key PDF — the same pages, page for page,
// with the answers filled in — is encrypted with the teacher code into key.json, so only the teacher screens can open it.
// Work goes to the Google Sheet at CLASS_SHEET_URL in src/data/catalog.ts (tools/check-sheet.gs, tab "คาบสด");
// add --local to keep it in the browser instead (try-out: student and #teacher in two tabs of one browser).
// Usage: node tools/build-sheet-class.mjs <student.pdf> <key.pdf> <title> <teacher code> <out dir> <class id> [--local]
//   e.g. node tools/build-sheet-class.mjs lesson3-student.pdf lesson3-key.pdf "Living Things and Weather" <code> public/class/sci3 sci3
// Needs pdftoppm (poppler). Keep the key PDF out of the repo, and never commit the teacher code.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { webcrypto as crypto } from 'node:crypto';

const args = process.argv.slice(2);
const local = args.includes('--local');
const [stuPdf, keyPdf, title, tCode, out, id] = args.filter((a) => a !== '--local');
if (!stuPdf || !keyPdf || !title || !tCode || !out || !id) {
  console.error('usage: node tools/build-sheet-class.mjs <student.pdf> <key.pdf> <title> <teacher code> <out dir> <class id> [--local]');
  process.exit(1);
}
const render = (pdf, dir) => {
  execFileSync('pdftoppm', ['-jpeg', '-jpegopt', 'quality=78', '-scale-to-x', '1400', '-scale-to-y', '-1', pdf, join(dir, 'x')]);
  return readdirSync(dir).filter((f) => f.startsWith('x-')).sort();
};
mkdirSync(join(out, 'p'), { recursive: true });
for (const f of readdirSync(join(out, 'p'))) rmSync(join(out, 'p', f));
const tmpS = mkdtempSync(join(tmpdir(), 'sc-s-')), tmpK = mkdtempSync(join(tmpdir(), 'sc-k-'));
const sp = render(stuPdf, tmpS), kp = render(keyPdf, tmpK);
if (sp.length !== kp.length) throw new Error(`the key has ${kp.length} pages, the student sheet ${sp.length}: they must match page for page`);
sp.forEach((f, i) => renameSync(join(tmpS, f), join(out, 'p', 'p' + String(i + 1).padStart(2, '0') + '.jpg')));
const plain = new TextEncoder().encode(JSON.stringify({ pages: kp.map((f) => readFileSync(join(tmpK, f)).toString('base64')) }));
rmSync(tmpS, { recursive: true }); rmSync(tmpK, { recursive: true });

const b64 = (u) => Buffer.from(u).toString('base64');
const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), iter = 200000;
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(tCode), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
writeFileSync(join(out, 'key.json'), JSON.stringify({ iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) }));

const sheet = local ? null : /CLASS_SHEET_URL\s*=\s*'([^']*)'/.exec(readFileSync(new URL('../src/data/catalog.ts', import.meta.url), 'utf8'))[1];
if (!local && !sheet) throw new Error('CLASS_SHEET_URL is empty in src/data/catalog.ts (or build with --local)');
const cfg = { id, title, pages: sp.length, sheet };
const shell = readFileSync(new URL('./sheet-class-shell.html', import.meta.url), 'utf8');
writeFileSync(join(out, 'index.html'), shell.replace(/\/\*__CFG__\*\/\{[^\n]*?\}(?=;)/, JSON.stringify(cfg)).replace('<title>Scitem Class</title>', `<title>${title}</title>`));
console.log(`wrote ${out}: ${sp.length} pages`);
