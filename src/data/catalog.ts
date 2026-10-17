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
  { title: 'เช็คพื้นฐาน: แรงลอยตัว', th: 'แรงลอยตัว', kind: 'check', grade: 'ม.ต้น',
    meta: '10 ข้อ', href: '/check/buoyancy/', course: 'physics-lower', note: 'ทำก่อนเรียน' },
  { title: 'Solar System Vocabulary', th: 'ระบบสุริยะ', kind: 'sheet', grade: 'ป.6',
    meta: 'ศัพท์ 15 คำ · แบบฝึก 3 ชุด',
    note: 'ศัพท์ 15 คำพร้อมคำแปลไทย แบบฝึกหัด 3 ชุด และมุมผู้ปกครอง',
    pages: ['/img/sheets/solar-1.jpg', '/img/sheets/solar-2.jpg', '/img/sheets/solar-3.jpg'] },
  { title: 'Rocks & the Rock Cycle', th: 'หินและวัฏจักรหิน', kind: 'sheet', grade: 'Year 7',
    meta: 'English only', note: 'พร้อม Self-Check และ Code Breaker' },
  { title: 'Answer Vault', th: 'ปลดล็อกเฉลยชีท', kind: 'tool', grade: 'ทุกชั้น',
    meta: 'ใช้รหัส Code Breaker', href: '/vault/', note: 'ใส่รหัสจาก Code Breaker ท้ายชีทเพื่อเปิดเฉลย' },
];

export const LINE_URL = 'https://lin.ee/NO52k1Y';

// Google Apps Script web app that stores "เช็คพื้นฐาน" results in the teacher's Google Sheet (setup: tools/check-sheet.gs).
// Empty = students get the old SC1- code to send on LINE instead.
export const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyq7E1RkdI8pARED-cN4XAHeqRNx9BlQMwoY5AYiXF1_MjdPVoosxA7oefBbxgHky0/exec';
