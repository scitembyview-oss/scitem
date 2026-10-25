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
| ทำรูปโปรโมต/ประกอบ (ig 1080², fb 1200×630, line 1040²) ตาม DESIGN.md "CI สำหรับรูป" | `node tools/make-image.mjs --size ig\|fb\|line --title "..." --sub "..." [--img public/img/xxx.jpg] [--zoom x,y,w,h] [--badge "ลด 10%"] [--cta "ทักไลน์ รับชีทฟรี"] <ชื่อ>` → `public/img/promo/<ชื่อ>.png` (แม่แบบ `tools/image-shell.html`, `*คำ*` = ปากกาเน้น) |
| เมนู, footer, สี, ฟอนต์ | `src/layouts/Base.astro` |
| ชีท PDF | `public/sheets/*.pdf` |
| สไลด์เดโมการเคลื่อนที่แบบวงกลม (canvas, ปากกา) | `public/demo/index.html` (เขียนมือ ไฟล์เดียว) |
| สไลด์ Light Explorer · Mission 2 (14 หน้า) | `public/light-p5/index.html` **สร้างจากสคริปต์ ห้ามแก้ตรง** |
| สไลด์ Light Explorer · Mission 3 (14 หน้า) | `public/light-p5-m3/index.html` **สร้างจาก** `tools/build-light-p5-m3.py` (ใช้ helper + CSS จาก build-light-p5.py และ shell เดิม; หน้า 5, 8, 9, 14 แตะแหล่งแสงเพื่อโชว์/ซ่อนทางเดินแสงสีแดง `ray()` + `EXTRA_ACT.ray` ครูขอเอง 25 ต.ค.) ห้ามแก้ตรง |
| เช็คพื้นฐานก่อนเรียน | โจทย์ `src/data/checks.ts` + `src/pages/check/*.astro` + `src/components/BasicCheck.astro`; ผลส่งเข้า Google Sheet ผ่าน `tools/check-sheet.gs` (URL = `SHEET_URL` ใน catalog.ts) สำรองด้วยรหัส `src/lib/check-code.js` |
| สอบวัดระดับคณิต ม.1–2 (10 หัวข้อ เลือกได้, ปรับระดับตามคำตอบ) | `public/math-level/index.html` (ไฟล์เดียว ตรวจด้วย hash ส่งรหัส LF1- เป็นชิ้นเข้าชีทชื่อชุด `math-r2`); หน้าครูอ่านด้วย `src/lib/math-level.ts`; คลังข้อ+เฉลยเข้ารหัสใน `src/data/math-keys.json` (`node tools/encrypt-check-keys.mjs <keys.json> <รหัสผ่าน> src/data/math-keys.json`) |
| เฉลยเช็ค (เข้ารหัส) | `src/data/check-keys.json` ← `node tools/encrypt-check-keys.mjs <keys.json> <รหัสผ่าน>` |
| สไลด์ Y7 Particles in Action (14 หน้า) / Elements in Our World (19 หน้า) — **ซ่อน** ไม่อยู่ใน catalog | `public/y7-particles/`, `public/y7-elements/` **สร้างจาก** `tools/build-y7-*.py` + `tools/y7kit.py` (ใช้ shell เดียวกับ light-p5; แตะ: gas, vib, diffuse, brown, trace, grow) ห้ามแก้ตรง |
| ห้องเรียนออนไลน์ บทที่ 3 (13 ชุด 114 ข้อ): เส้นจำนวน 3 โหมด (ดูภาพ/ลากแล้วทาย/ตอบ) + โหมดสอบ (โจทย์+ทด+คำตอบ) + กระดาษทด, ส่งเข้าชีทแยก (`CLASS_SHEET_URL` ใน catalog.ts) แท็บ "คาบสด" ตอนเลื่อนข้อ (`cput/cget/rput/rget` ใน `tools/check-sheet.gs`), ครูเปิด `#teacher` ด้วยรหัสครู เห็นที่ทด + ปากกาแดงส่งกลับ, เซฟ PDF — ไม่อยู่ใน catalog แต่มีลิงก์นักเรียน/ครูในหน้าแรก (`index.astro` กล่อง "เรียนสด"); เนื้อหา+เฉลยเข้ารหัส 2 ชุด: รหัสน้อง / รหัสครู (ห้าม commit รหัสหรือไฟล์ json) | `public/class/l3/index.html` **สร้างจาก** `python3 tools/build-class-l3.py <kit>/worksheets/worksheet-src /tmp/l3.json` (อ่านสคริปต์ชีทในชุด math kit ของครู ต้องมี sympy) แล้ว `node tools/build-class.mjs /tmp/l3.json <รหัสน้อง> <รหัสครู> public/class/l3/index.html l3` (หน้าตา `tools/class-shell.html`, `--local` = เก็บในเบราว์เซอร์อย่างเดียว) ห้ามแก้ตรง |
| ห้องเรียนสดจากชีท PDF (วิทย์คาบ 3 Living Things and Weather, 19 หน้า + Extension 3 หน้า = 22): จอน้อง (ใส่ชื่อ เขียนบนหน้าชีท กดส่งทีละหน้า ไม่เห็นหมึกครู) / `#show` จอครูแชร์ให้น้องดู (ไม่มีเฉลย เขียนได้ ปุ่ม "งานน้อง") (จอ `#teacher` เลิกใช้แล้ว ครูสั่ง 22 ต.ค. ครูตรวจเอง ลิงก์ #teacher เก่าจะเปิดเป็น #show) — ส่งเข้าชีทเดียวกับ l3 (`CLASS_SHEET_URL` แท็บ "คาบสด" id หน้า p01…); รูปหน้าชีทน้องเปิดได้ เฉลย (`key.json`) เข้ารหัสด้วยรหัสครู (ห้าม commit รหัสหรือ PDF เฉลย) | `public/class/sci3/`, `public/class/heat4/` (ม.1 ความร้อนรวบยอด 32 หน้า, key.pdf จาก `keybuild.py` ในโฟลเดอร์งานครู) **สร้างจาก** `node tools/build-sheet-class.mjs <student.pdf> <key.pdf> "<ชื่อ>" <รหัสครู> public/class/sci3 sci3` (หน้าตา `tools/sheet-class-shell.html`; key.pdf = ชีทน้องที่มีเฉลย หน้าตรงกันทุกหน้า สร้างจาก `build4.py` ในโฟลเดอร์งานครู `l3-key.html`; `--local` = ทดลองในเบราว์เซอร์เดียว) ห้ามแก้ตรง |
| Signs Check − (−) ของเปียโน (10 ข้อ, เขียนด้วย Apple Pencil ในช่อง → เป็นตัวพิมพ์, ตรวจทีละบรรทัดแล้วไปต่อเอง, จับเวลา) — **ซ่อน** ไม่อยู่ใน catalog, noindex | `public/signs-check/index.html` (ไฟล์เดียว เฉลยเป็น hash `sc1:<ข้อ>:<r/a/b><ค่า>`) ส่งบรรทัดรายงานเข้าชีทชุด `signs-1` (`SHEET_URL`) หน้าครูแสดงเป็นข้อความ |
| **คอร์สขาย** (Y7 Particles in Action นำร่อง, noindex ไม่ลิงก์): รหัสน้องรายผู้ซื้อ → สไลด์เขียนได้ (หมึกเก็บในเครื่อง) + ปุ่มเช็คคำตอบทีละหน้า (กดถูก/ยังไม่ถูกเอง) → Quiz ตรวจเองทำข้อผิดซ้ำ → ข้อที่ต้องแก้; ทุกอย่างหลังประตูเข้ารหัสใน `data.json`, `keys.json` = กุญแจห่อด้วยรหัสน้องแต่ละคน (รหัสครูเปิดได้ด้วย) | `public/course/<id>/` **สร้างจาก** `node tools/build-course.mjs build <course.json> <รหัสครู>` (หน้าตา `tools/course-shell.html`; course.json = path สไลด์ + เฉลยรายหน้า + quiz เก็บนอก repo ใน project files `course-y7/`), รหัสน้องเพิ่ม `node tools/build-course.mjs codes public/course/<id> <รหัสครู> <จำนวน> [codes.csv]`, ยกเลิก `... revoke public/course/<id> <รหัส>` แล้ว commit `keys.json`; build ใหม่ด้วยรหัสครูเดิม รหัสน้องเดิมใช้ต่อได้ ห้ามแก้ตรง |
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
