// Google Apps Script: stores "เช็คพื้นฐานก่อนเรียน" results in a Google Sheet and hands them to the teacher page.
// Setup (once): see HOW-TO.md → "เก็บผลเช็คใน Google Sheet".
// Paste this whole file into Extensions → Apps Script of the sheet, put the teacher password below
// (only in the Apps Script editor, never in the repo), then Deploy → Web app (Execute as: Me, Who has access: Anyone).

const TEACHER_PASSWORD = 'ใส่รหัสผ่านครูตรงนี้';
const TAB = 'ผลเช็ค';
const HEAD = ['เวลาส่ง', 'ชุด', 'ชื่อ', 'คำตอบ', 'วินาทีต่อข้อ', 'id'];
const MAX_ROWS = 1000; // newest rows sent to the teacher page

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return out({ ok: false });
  }
  return d.action === 'list' ? list(d) : submit(d);
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
