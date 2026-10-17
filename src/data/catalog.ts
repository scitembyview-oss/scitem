// Everything on the site, one entry per tile. Pages filter this list, so a new lesson/check/sheet goes here only.
// Tile numbers follow this order, like atomic numbers.

export type Family = 'lessons' | 'students' | 'parents' | 'teacher';

export const families: Record<Family, { th: string; en: string; href: string; blurb: string }> = {
  lessons: { th: 'ชีทสอน', en: 'Lessons', href: '/lessons/', blurb: 'สไลด์และชีทที่ใช้สอน แยกตามคอร์ส' },
  students: { th: 'นักเรียน', en: 'Students', href: '/students/', blurb: 'เช็คพื้นฐานก่อนเรียน และ Answer Vault' },
  parents: { th: 'ผู้ปกครอง', en: 'Parents', href: '/parents/', blurb: 'ชีทสองภาษา มุมผู้ปกครอง และติดต่อครู' },
  teacher: { th: 'ครู', en: 'Teacher', href: '/teacher/', blurb: 'ตรวจรหัสนักเรียน ต้องใช้รหัสผ่าน' },
};

export type CourseId = 'p5-light' | 'physics-lower';

export const courses: Record<CourseId, { name: string; th: string; where: string }> = {
  'p5-light': { name: 'Light', th: 'แสงและเงา', where: 'EP Primary 5 · St. Gabriel' },
  'physics-lower': { name: 'ฟิสิกส์ ม.ต้น', th: 'แรง การเคลื่อนที่ ของไหล', where: 'Lower secondary physics' },
};

export interface Item {
  sym: string;
  en: string;
  th: string;
  family: Family;
  grade: string;
  /** small line at the bottom of the tile, like an element's mass */
  meta: string;
  href?: string;
  pdf?: string;
  course?: CourseId;
  note?: string;
}

export const items: Item[] = [
  { sym: 'Lt', en: 'Light Explorer · Mission 2', th: 'แสงเดินทางเป็นเส้นตรงและเงา', family: 'lessons', grade: 'P5',
    meta: 'สไลด์ 14 หน้า', href: '/light-p5/', course: 'p5-light',
    note: 'แตะรูปให้ขยับได้ ฉายแสงให้เกิดเงา พร้อมปากกาเขียนบนสไลด์' },
  { sym: 'Cm', en: 'Circular Motion', th: 'การเคลื่อนที่แบบวงกลม', family: 'lessons', grade: 'ม.ต้น',
    meta: 'สไลด์ 2 หน้า', href: '/demo/', course: 'physics-lower',
    note: 'ภาพเคลื่อนไหวปรับค่าได้ พร้อมปากกาเขียนบนสไลด์' },
  { sym: 'Ci', en: 'Circular Motion Check', th: 'เช็คพื้นฐาน วงกลม', family: 'students', grade: 'ม.ต้น',
    meta: '10 ข้อ', href: '/check/circular/', course: 'physics-lower', note: 'ทำก่อนเรียน' },
  { sym: 'Cg', en: 'Circular Motion Quiz', th: 'ทดสอบความรู้ วงกลม', family: 'students', grade: 'ม.ต้น',
    meta: '8 ข้อ', href: '/check/circular-gifted/', course: 'physics-lower', note: 'ตอบเป็น √ หรือ π ได้' },
  { sym: 'Bu', en: 'Buoyancy Check', th: 'เช็คพื้นฐาน แรงลอยตัว', family: 'students', grade: 'ม.ต้น',
    meta: '10 ข้อ', href: '/check/buoyancy/', course: 'physics-lower', note: 'ทำก่อนเรียน' },
  { sym: 'Av', en: 'Answer Vault', th: 'ปลดล็อกเฉลยชีท', family: 'students', grade: 'ทุกชั้น',
    meta: 'ใช้รหัส Code Breaker', href: '/vault/', note: 'ใส่รหัสจาก Code Breaker ท้ายชีทเพื่อเปิดเฉลย' },
  { sym: 'Ss', en: 'Solar System Vocabulary', th: 'ระบบสุริยะ', family: 'parents', grade: 'ป.6',
    meta: 'ศัพท์ 15 คำ', pdf: '/sheets/solar-system-p6.pdf', note: 'คำศัพท์ 15 คำ แบบฝึกหัด 3 ชุด และมุมผู้ปกครอง' },
  { sym: 'Rk', en: 'Rocks & the Rock Cycle', th: 'หินและวัฏจักรหิน', family: 'parents', grade: 'Y7',
    meta: 'English only', note: 'พร้อม Self-Check และ Code Breaker' },
  { sym: 'Te', en: 'Check Grader', th: 'ตรวจรหัสเช็ค', family: 'teacher', grade: 'ครู',
    meta: 'ใช้รหัสผ่าน', href: '/teacher/', note: 'วางรหัสจาก LINE แล้วเห็นคะแนนทั้งห้อง' },
];

export const numbered = items.map((it, i) => ({ ...it, n: i + 1 }));
export type NumberedItem = (typeof numbered)[number];

export const LINE_URL = 'https://lin.ee/NO52k1Y';
