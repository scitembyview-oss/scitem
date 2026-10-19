// Google Apps Script: stores "เช็คพื้นฐานก่อนเรียน" results in a Google Sheet and hands them to the teacher page.
// Setup (once): see HOW-TO.md → "เก็บผลเช็คใน Google Sheet".
// Paste this whole file into Extensions → Apps Script of the sheet, put the teacher password below
// (only in the Apps Script editor, never in the repo), then Deploy → Web app (Execute as: Me, Who has access: Anyone).

const TEACHER_PASSWORD = 'ใส่รหัสผ่านครูตรงนี้';
const TAB = 'ผลเช็ค';
const HEAD = ['เวลาส่ง', 'ชุด', 'ชื่อ', 'คำตอบ', 'วินาทีต่อข้อ', 'id'];
const MAX_ROWS = 1000; // newest rows sent to the teacher page
const NOTIFY = true; // email the sheet owner each time a student finishes (Gmail app on the phone shows it as a notification)
const QUIZ_NAMES = { 'math-r2': 'สอบวัดระดับคณิต', 'circular-1': 'เช็ควงกลม', 'circular-2': 'ทดสอบวงกลม', 'buoyancy-1': 'เช็คแรงลอยตัว' };

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return out({ ok: false });
  }
  if (d.action === 'list') return list(d);
  if (d.action === 'cput') return classPut(d);
  if (d.action === 'cget') return classGet(d);
  if (d.action === 'rput') return redPut(d);
  if (d.action === 'rget') return redGet(d);
  return submit(d);
}

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
  }
  return sh;
}

// A leading = + - @ would make Sheets read a name as a formula
const text = (v, n) => String(v == null ? '' : v).slice(0, n).replace(/^[=+\-@]/, "'$&");

function submit(d) {
  const answers = (Array.isArray(d.answers) ? d.answers : []).slice(0, 60).map((a) => String(a).slice(0, 100));
  const secs = (Array.isArray(d.secs) ? d.secs : []).slice(0, 60).map((s) => Math.max(0, Math.round(Number(s) || 0)));
  const id = text(d.id, 20);
  if (!d.quiz || !d.name) return out({ ok: false });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet();
    const last = sh.getLastRow();
    // The student's "ลองส่งอีกครั้ง" may resend a result that already arrived
    if (id && last > 1) {
      const from = Math.max(2, last - 49);
      const ids = sh.getRange(from, 6, last - from + 1, 1).getValues().flat();
      if (ids.indexOf(id) >= 0) return out({ ok: true });
    }
    sh.appendRow([new Date(), text(d.quiz, 40), text(d.name, 30), JSON.stringify(answers), JSON.stringify(secs), id]);
  } finally {
    lock.releaseLock();
  }
  if (NOTIFY) {
    try {
      const quiz = QUIZ_NAMES[d.quiz] || String(d.quiz);
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), `scitem: ${text(d.name, 30)} ทำ${quiz}เสร็จแล้ว`,
        `${text(d.name, 30)} ส่งผล ${quiz} เมื่อ ${new Date().toLocaleString('th-TH')}\nดูผลที่ https://scitem.net/teacher/`);
    } catch (err) {} // a mail quota hiccup must not lose the result
  }
  return out({ ok: true });
}

function list(d) {
  if (d.pw !== TEACHER_PASSWORD) return out({ ok: false, error: 'pw' });
  const sh = sheet();
  const last = sh.getLastRow();
  if (last < 2) return out({ ok: true, rows: [] });
  const from = Math.max(2, last - MAX_ROWS + 1);
  const rows = sh.getRange(from, 1, last - from + 1, 6).getValues().map((r) => ({
    at: new Date(r[0]).getTime(),
    quiz: String(r[1]),
    name: String(r[2]),
    answers: parse(r[3]),
    secs: parse(r[4]),
  }));
  return out({ ok: true, rows });
}

function parse(v) {
  try {
    const a = JSON.parse(v);
    return Array.isArray(a) ? a : [];
  } catch (err) {
    return [];
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- live class (public/class/*): one row per class × student × question, overwritten when the student
// sends that question again. Big working-out is split over several cells (a cell holds 50,000 characters).
// No email for these: they arrive every time the student moves to the next question.
const CLASS_TAB = 'คาบสด';
const CLASS_HEAD = ['เวลา', 'ห้อง', 'ชื่อ', 'ข้อ', 'เวลาหมึกครู'];
const PART = 45000, DATA_COLS = 8, RED_COLS = 4; // columns F.. = student's data, then the teacher's red ink

function classSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CLASS_TAB);
  if (!sh) {
    sh = ss.insertSheet(CLASS_TAB);
    sh.appendRow(CLASS_HEAD.concat(['ข้อมูล']));
    sh.setFrozenRows(1);
  }
  return sh;
}

function classRow(sh, cls, name, id, make) {
  const last = sh.getLastRow();
  if (last > 1) {
    const keys = sh.getRange(2, 2, last - 1, 3).getValues();
    for (let i = keys.length - 1; i >= 0; i--) {
      if (String(keys[i][0]) === cls && String(keys[i][1]) === name && String(keys[i][2]) === id) return i + 2;
    }
  }
  if (!make) return 0;
  sh.appendRow([0, text(cls, 40), text(name, 30), text(id, 20), 0]);
  return sh.getLastRow();
}

function putParts(sh, row, col, n, str) {
  const parts = [];
  for (let i = 0; i < n; i++) parts.push(str.slice(i * PART, (i + 1) * PART));
  sh.getRange(row, col, 1, n).setNumberFormat('@').setValues([parts]);
}

function classPut(d) {
  const data = String(d.data || '');
  if (!d.cls || !d.name || !d.id || data.length > PART * DATA_COLS) return out({ ok: false });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = classSheet();
    const row = classRow(sh, String(d.cls), String(d.name).slice(0, 30), String(d.id), true);
    putParts(sh, row, 6, DATA_COLS, data);
    sh.getRange(row, 1).setValue(Date.now());
  } finally {
    lock.releaseLock();
  }
  return out({ ok: true });
}

function classGet(d) {
  if (d.pw !== TEACHER_PASSWORD) return out({ ok: false, error: 'pw' });
  const sh = classSheet();
  const last = sh.getLastRow();
  if (last < 2) return out({ ok: true, rows: [] });
  const since = Number(d.since) || 0;
  const vals = sh.getRange(2, 1, last - 1, 5 + DATA_COLS + RED_COLS).getValues();
  const rows = [];
  for (const r of vals) {
    if (String(r[1]) !== String(d.cls) || !(Number(r[0]) > since)) continue;
    rows.push({ at: Number(r[0]), name: String(r[2]), id: String(r[3]), data: r.slice(5, 5 + DATA_COLS).join(''),
      red: since ? null : r.slice(5 + DATA_COLS).join('') });
  }
  return out({ ok: true, rows });
}

function redPut(d) {
  if (d.pw !== TEACHER_PASSWORD) return out({ ok: false, error: 'pw' });
  const red = String(d.red || '');
  if (!d.cls || !d.name || !d.id || red.length > PART * RED_COLS) return out({ ok: false });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = classSheet();
    const row = classRow(sh, String(d.cls), String(d.name), String(d.id), false);
    if (!row) return out({ ok: false });
    putParts(sh, row, 6 + DATA_COLS, RED_COLS, red);
    sh.getRange(row, 5).setValue(Date.now());
  } finally {
    lock.releaseLock();
  }
  return out({ ok: true });
}

function redGet(d) {
  const sh = classSheet();
  const row = classRow(sh, String(d.cls), String(d.name), String(d.id), false);
  if (!row) return out({ ok: true, red: '' });
  return out({ ok: true, red: sh.getRange(row, 6 + DATA_COLS, 1, RED_COLS).getValues()[0].join('') });
}
