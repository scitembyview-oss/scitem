// Encrypts the answer keys + solutions for the "เช็คพื้นฐานก่อนเรียน" quizzes with the teacher password.
// Usage: node tools/encrypt-check-keys.mjs <keys.json> <password>
// Writes src/data/check-keys.json (ciphertext only). Keep keys.json and the password OUT of this repo.
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const [file, password] = process.argv.slice(2);
if (!file || !password) {
  console.error('usage: node tools/encrypt-check-keys.mjs <keys.json> <password>');
  process.exit(1);
}
const plain = new TextEncoder().encode(JSON.stringify(JSON.parse(readFileSync(file, 'utf8'))));
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const iter = 200000;
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
const b64 = (u) => Buffer.from(u).toString('base64');
writeFileSync('src/data/check-keys.json', JSON.stringify({ iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) }) + '\n');
console.log('wrote src/data/check-keys.json');
