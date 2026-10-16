// Shared by the student page (encode) and the teacher page (decode).
// A code is "SC1-" + base64url of the JSON payload, lightly scrambled, with a checksum so typos or edits are caught.
// Payload: [version, quizId, name, answers[], secondsPerQuestion[], submittedAtEpochMinutes]

const MASK = new TextEncoder().encode('scitem-check');

function scramble(bytes) {
  return bytes.map((b, i) => b ^ MASK[i % MASK.length] ^ ((i * 13) & 255));
}

function toB64url(bytes) {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

export function encodeCheck(payload) {
  const plain = new TextEncoder().encode(JSON.stringify(payload));
  let sum = 0;
  plain.forEach((b) => (sum = (sum * 31 + b) & 0xffff));
  const out = new Uint8Array(plain.length + 2);
  out.set(scramble(plain));
  out[plain.length] = sum >> 8;
  out[plain.length + 1] = sum & 255;
  return 'SC1-' + toB64url(out);
}

/** Returns the payload, or null if the code is damaged. */
export function decodeCheck(code) {
  try {
    const raw = fromB64url(code.replace(/^SC1-/, ''));
    const plain = scramble(raw.slice(0, -2));
    let sum = 0;
    plain.forEach((b) => (sum = (sum * 31 + b) & 0xffff));
    if (raw[raw.length - 2] !== sum >> 8 || raw[raw.length - 1] !== (sum & 255)) return null;
    const p = JSON.parse(new TextDecoder().decode(plain));
    return Array.isArray(p) && p[0] === 1 ? p : null;
  } catch (e) {
    return null;
  }
}
