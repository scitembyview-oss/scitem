# scitem.net

เว็บชีทวิทย์สองภาษาของครูสอนพิเศษ (เด็ก EP/Inter ป.5–ม.3) ทำด้วย Astro + ไฟล์ HTML นิ่งๆ ใน `public/`
push ขึ้น `main` แล้ว GitHub Actions (`.github/workflows/deploy.yml`) เอาขึ้น GitHub Pages เองใน 1 นาที
คู่มือฉบับคนอ่านอยู่ที่ `HOW-TO.md` ไฟล์นี้คือฉบับย่อสำหรับ Claude อ่านก่อนเริ่มงาน ไม่ต้องสำรวจ repo ซ้ำ

## โครงสร้าง

| อะไร | ไฟล์ |
|---|---|
| **รายการทุกอย่างบนเว็บ** (สไลด์ เช็ค ชีท) + คอร์ส + ลิงก์ LINE | `src/data/catalog.ts` |
| หน้าแรก (ขายผู้ปกครอง ดึงคนทักไลน์) / บทเรียน (แยกคอร์ส) / นักเรียน / ครู (รหัสผ่าน + ตรวจรหัส) | `src/pages/index.astro`, `lessons.astro`, `students.astro`, `teacher.astro` |
| ตัวอย่างชีทแบบกองกระดาษ + หน้าต่างดูทีละหน้า | `src/components/Pages.astro`, `Viewer.astro` |
| รูปตัวอย่าง: หน้าชีท `public/img/sheets/`, ภาพสไลด์ `public/img/slides/`, รูปครู `public/img/วิวถือไมค์.jpeg` (ชื่ออื่นที่รับ: teacher.jpg/png) — รูปจากมือถือต้องลบ GPS และย่อก่อน commit | `pdftoppm -f 1 -l 3 -jpeg -scale-to 1000 <pdf> public/img/sheets/<ชื่อ>` (ห้ามรวมหน้าเฉลย) |
| หน้าตา (สมุดวิทย์: กระดาษกราฟ, ปากกาเน้น, iPad สไลด์จริง) | `DESIGN.md` |
| เมนู, footer, สี, ฟอนต์ | `src/layouts/Base.astro` |
| ชีท PDF | `public/sheets/*.pdf` |
| สไลด์เดโมการเคลื่อนที่แบบวงกลม (canvas, ปากกา) | `public/demo/index.html` (เขียนมือ ไฟล์เดียว) |
| สไลด์ Light Explorer · Mission 2 (14 หน้า) | `public/light-p5/index.html` **สร้างจากสคริปต์ ห้ามแก้ตรง** |
| เช็คพื้นฐานก่อนเรียน | โจทย์ `src/data/checks.ts` + `src/pages/check/*.astro` + `src/components/BasicCheck.astro`; ผลส่งเข้า Google Sheet ผ่าน `tools/check-sheet.gs` (URL = `SHEET_URL` ใน catalog.ts) สำรองด้วยรหัส `src/lib/check-code.js` |
| สอบวัดระดับคณิต ม.1–2 (10 หัวข้อ เลือกได้, ปรับระดับตามคำตอบ) | `public/math-level/index.html` (ไฟล์เดียว ตรวจด้วย hash ส่งรหัส LF1- เป็นชิ้นเข้าชีทชื่อชุด `math-r2`); หน้าครูอ่านด้วย `src/lib/math-level.ts`; คลังข้อ+เฉลยเข้ารหัสใน `src/data/math-keys.json` (`node tools/encrypt-check-keys.mjs <keys.json> <รหัสผ่าน> src/data/math-keys.json`) |
| เฉลยเช็ค (เข้ารหัส) | `src/data/check-keys.json` ← `node tools/encrypt-check-keys.mjs <keys.json> <รหัสผ่าน>` |
| สไลด์ Y7 Particles in Action (14 หน้า) / Elements in Our World (19 หน้า) — **ซ่อน** ไม่อยู่ใน catalog | `public/y7-particles/`, `public/y7-elements/` **สร้างจาก** `tools/build-y7-*.py` + `tools/y7kit.py` (ใช้ shell เดียวกับ light-p5; แตะ: gas, vib, diffuse, brown, trace, grow) ห้ามแก้ตรง |
| Answer Vault (**ซ่อนอยู่** ไม่ build ไม่ลิงก์ ห้ามพูดถึงบนเว็บจนกว่าครูสั่ง) | `src/pages/_vault.astro` (รายการ `VAULT` เข้ารหัสแล้ว; เปิดใช้ = เปลี่ยนชื่อกลับเป็น `vault.astro`) |

## สไลด์บทเรียนจากชีท (แบบ light-p5)

- `tools/build-light-p5.py` = เนื้อหา รูป SVG CSS และอนิเมชั่นแตะของแต่ละหน้า ดัดแปลงจากสคริปต์ที่ครูใช้สร้างชีท PDF (เวอร์ชันนักเรียน)
- `tools/light-p5-shell.html` = แถบเครื่องมือ ปากกา/ยางลบ/กันฝ่ามือ (เหมือน `/demo/`), เปลี่ยนหน้า ◀ ▶ ←/→ ปัดข้าง, ระบบแตะ
- แก้แล้วรัน `python3 tools/build-light-p5.py` แล้ว commit ทั้งสคริปต์และ `public/light-p5/index.html`
- อนิเมชั่นแตะ: ใส่ `class="tap" data-act="ชื่อ"` ในสคริปต์ แล้วเพิ่มฟังก์ชันชื่อเดียวกันใน `ACT` ของ shell; `play(el, ms)` เล่น CSS animation ครั้งเดียว
- ฉายแสงเป็นเงา: `cast_svg(...)` ในสคริปต์ (ตำแหน่งแหล่งแสง, จุดขอบวัตถุ, พื้น `g` หรือผนัง `wall`) + `cast()` ใน shell; แหล่งแสงใช้ `data-act="cast"`
- โหมด ✏️ แตะสั้นๆ บนรูป = เล่นอนิเมชั่น (ไม่เป็นหมึก); โหมด 👆 = แตะ/เลื่อนอย่างเดียว; ลากได้ใช้ `class="drag"`
- บทเรียนใหม่: คัดลอกคู่ไฟล์นี้เป็น `tools/build-<ชื่อ>.py` + ใช้ shell เดิมได้ แล้วเพิ่มรายการใน `src/data/catalog.ts` (ใส่ `course`)

## กติกา

- repo นี้เป็น public: **ห้ามมีเฉลย** ในไฟล์ที่ commit (ทั้งหน้าเว็บและสคริปต์) เฉลยต้องเข้ารหัสแบบ check-keys / vault เท่านั้น ห้าม commit รหัสผ่านหรือไฟล์เฉลยตัวจริง
- ห้ามลบ `public/CNAME` และ `.github/workflows/deploy.yml`
- ไม่เพิ่ม library ใหม่ ใช้ CSS + vanilla JS
- ใช้งานจริงบน iPad แนวนอน + Apple Pencil, ครูเปิดตรวจในมือถือ/คอม
- ตอบผู้ใช้เป็นภาษาไทย สั้นๆ

## ประหยัดโทเคน

- อ่านไฟล์นี้แล้วไปที่ไฟล์ที่เกี่ยวข้องเลย ไม่ต้องสำรวจ repo ทั้งหมด
- ไม่ต้องขอ PDF: อ่านจากสคริปต์สร้างชีท หรือ `pdftotext` ถ้าจำเป็น
- ไม่ต้องถ่ายภาพหน้าจอหรือทำรูปตัวอย่าง: แก้แล้ว build ให้ผ่าน แล้ว push ขึ้นเว็บเลย ครูเปิดเช็คเองบน iPad (ถ่ายภาพเฉพาะเมื่อผู้ใช้ขอ)

## ทดสอบในเครื่อง

```
npm ci && npm run build                       # เช็คว่า build ผ่าน
python3 -m http.server 8765 -d public         # แล้วเปิด http://localhost:8765/light-p5/#p5
```
Playwright อยู่ที่ `/opt/node-tools/node_modules/playwright` (ใช้ `devices['iPad Pro 11 landscape']`)
