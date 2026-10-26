// Everything on the site. Pages filter this list, so a new lesson/check/sheet goes here only.

export type Kind = 'slides' | 'check' | 'sheet' | 'tool';

export const kinds: Record<Kind, string> = {
  slides: 'สไลด์สอน',
  check: 'เช็คพื้นฐาน',
  sheet: 'ชีทสองภาษา',
  tool: 'เครื่องมือ',
};

export type CourseId = 'p5-light' | 'physics-lower';

export const courses: Record<CourseId, { name: string; th: string; where: string; blurb: string; cover: string }> = {
  'p5-light': {
    name: 'Light Explorer', th: 'แสงและเงา', where: 'EP Primary 5 · St. Gabriel',
    blurb: 'แสงเดินทางเป็นเส้นตรง วัตถุโปร่งใส โปร่งแสง ทึบแสง และการเกิดเงา เรียนจากสไลด์ที่แตะไฟฉายแล้วเงาเกิดขึ้นจริง',
    cover: '/img/slides/light-thumb.jpg',
  },
  'physics-lower': {
    name: 'ฟิสิกส์ ม.ต้น', th: 'แรง การเคลื่อนที่ ของไหล', where: 'Lower secondary physics',
    blurb: 'การเคลื่อนที่แบบวงกลม แรงลอยตัว และพื้นฐานที่ต้องแม่นก่อนขึ้น ม.ปลาย มี Circular Motion เป็นเดโมสไลด์สอน และเช็คพื้นฐานก่อนเรียนทุกเรื่อง',
    cover: '/img/slides/demo-thumb.jpg',
  },
};

export interface Item {
  title: string;
  th: string;
  kind: Kind;
  grade: string;
  meta: string;
  href?: string;
  course?: CourseId;
  note?: string;
  /** page images shown as the sample (question pages only, never the answer key) */
  pages?: string[];
}

export const items: Item[] = [
  { title: 'Light Explorer · Mission 3', th: 'การมองเห็นและวัตถุโปร่งใส โปร่งแสง ทึบแสง', kind: 'slides', grade: 'P5',
    meta: '14 หน้า', href: '/light-p5-m3/', course: 'p5-light',
    note: 'เรามองเห็นได้อย่างไร แสงสะท้อน และวัสดุที่แสงผ่านได้ พร้อมปากกาเขียนบนสไลด์',
    pages: ['/img/slides/light-m3-1.jpg', '/img/slides/light-m3-9.jpg'] },
  { title: 'Light Explorer · Mission 2', th: 'แสงเดินทางเป็นเส้นตรงและเงา', kind: 'slides', grade: 'P5',
    meta: '14 หน้า', href: '/light-p5/', course: 'p5-light',
    note: 'แตะรูปให้ขยับได้ ฉายแสงให้เกิดเงา พร้อมปากกาเขียนบนสไลด์',
    pages: ['/img/slides/light-1.jpg', '/img/slides/light-5.jpg'] },
  { title: 'Circular Motion', th: 'การเคลื่อนที่แบบวงกลม', kind: 'slides', grade: 'ม.ต้น',
    meta: 'เดโมสไลด์สอน', href: '/demo/', course: 'physics-lower',
    note: 'ภาพเคลื่อนไหวปรับค่าได้ พร้อมปากกาเขียนบนสไลด์', pages: ['/img/slides/demo.jpg'] },
  { title: 'เช็คพื้นฐาน: วงกลม', th: 'การเคลื่อนที่แบบวงกลม', kind: 'check', grade: 'ม.ต้น',
    meta: '10 ข้อ', href: '/check/circular/', course: 'physics-lower', note: 'ทำก่อนเรียน' },
  { title: 'ทดสอบความรู้: วงกลม', th: 'การเคลื่อนที่แบบวงกลม', kind: 'check', grade: 'ม.ต้น',
    meta: '8 ข้อ', href: '/check/circular-gifted/', course: 'physics-lower', note: 'ตอบเป็น √ หรือ π ได้' },
  { title: 'ชีทเรียนสด: วงกลม + แรงลอยตัว', th: 'การเคลื่อนที่แบบวงกลม และแรงลอยตัว', kind: 'sheet', grade: 'ม.ต้น',
    meta: '48 หน้า · ช่องคำตอบทุกข้อ', href: '/class/cb2h/', course: 'physics-lower',
    note: 'เขียนทดบนชีทใน iPad ใส่คำตอบพร้อมหน่วย ครูตรวจและส่งคำใบ้กลับมาในคาบ' },
  { title: 'เช็คพื้นฐาน: แรงลอยตัว', th: 'แรงลอยตัว', kind: 'check', grade: 'ม.ต้น',
    meta: '10 ข้อ', href: '/check/buoyancy/', course: 'physics-lower', note: 'ทำก่อนเรียน' },
  { title: 'Maths Level Finder', th: 'สอบวัดระดับคณิต ม.1–2 (EP)', kind: 'check', grade: 'ม.1–2',
    meta: '10 หัวข้อ · 5 ระดับ', href: '/math-level/', note: 'ข้อสอบปรับระดับตามคำตอบ ผลส่งเข้าหน้าครู' },
  { title: 'Solar System Vocabulary', th: 'ระบบสุริยะ', kind: 'sheet', grade: 'ป.6',
    meta: 'ศัพท์ 15 คำ · แบบฝึก 3 ชุด',
    note: 'ศัพท์ 15 คำพร้อมคำแปลไทย แบบฝึกหัด 3 ชุด และมุมผู้ปกครอง',
    pages: ['/img/sheets/solar-1.jpg', '/img/sheets/solar-2.jpg', '/img/sheets/solar-3.jpg'] },
  { title: 'Rocks & the Rock Cycle', th: 'หินและวัฏจักรหิน', kind: 'sheet', grade: 'Year 7',
    meta: 'English only', note: 'พร้อม Self-Check และ Code Breaker' },
];

export const LINE_URL = 'https://lin.ee/NO52k1Y';

// Google Apps Script web app that stores "เช็คพื้นฐาน" results in the teacher's Google Sheet (setup: tools/check-sheet.gs).
// Empty = students get the old SC1- code to send on LINE instead.
export const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyq7E1RkdI8pARED-cN4XAHeqRNx9BlQMwoY5AYiXF1_MjdPVoosxA7oefBbxgHky0/exec';
// Live class pages (public/class/*) use their own Sheet, also running tools/check-sheet.gs
// Firebase Realtime Database for the live ink on those pages (hidden teacher screen #live). The web API key is meant to be public;
// tools/firebase-rules.json is what keeps the work private. Empty = no live screen. Rebuild with build-sheet-class.mjs --reshell.
export const FIREBASE = { key: 'AIzaSyClZhItG5C3aaz413ToeXPDKzh6Aw5y9CU', db: 'https://scitem-live-default-rtdb.asia-southeast1.firebasedatabase.app' };
export const CLASS_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzIaVMqROaTFaDN36SwCif7pWF_KEE7GroEUj2V5c9BM2gg4Y2v3wXbUOf-P4T0aBygnw/exec';
