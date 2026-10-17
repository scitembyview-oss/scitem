# scitem.net

เว็บชีทวิทย์สองภาษาของครูสอนพิเศษ (เด็ก EP/Inter ป.5–ม.3) ทำด้วย Astro + ไฟล์ HTML นิ่งๆ ใน `public/`
push ขึ้น `main` แล้ว GitHub Actions (`.github/workflows/deploy.yml`) เอาขึ้น GitHub Pages เองใน 1 นาที
คู่มือฉบับคนอ่านอยู่ที่ `HOW-TO.md` ไฟล์นี้คือฉบับย่อสำหรับ Claude อ่านก่อนเริ่มงาน ไม่ต้องสำรวจ repo ซ้ำ

## โครงสร้าง

| อะไร | ไฟล์ |
|---|---|
| หน้าแรก: รายการชีท (`sheets`) และลิงก์สไลด์/เช็ค (`classLinks`) | `src/pages/index.astro` |
| เมนู, footer, สี, ฟอนต์ | `src/layouts/Base.astro` |
| ชีท PDF | `public/sheets/*.pdf` |
| สไลด์เดโมการเคลื่อนที่แบบวงกลม (canvas, ปากกา) | `public/demo/index.html` (เขียนมือ ไฟล์เดียว) |
| สไลด์ Light Explorer · Mission 2 (14 หน้า) | `public/light-m2/index.html` **สร้างจากสคริปต์ ห้ามแก้ตรง** |
| เช็คพื้นฐานก่อนเรียน | `src/pages/check/*.astro` + `src/components/BasicCheck.astro` + `src/lib/check-code.js` |
| เฉลยเช็ค (เข้ารหัส) | `src/data/check-keys.json` ← `node tools/encrypt-check-keys.mjs <keys.json> <รหัสผ่าน>` |
| Answer Vault | `src/pages/vault.astro` (รายการ `VAULT` เข้ารหัสแล้ว) |

## สไลด์บทเรียนจากชีท (แบบ light-m2)

- `tools/build-light-m2.py` = เนื้อหา รูป SVG CSS และอนิเมชั่นแตะของแต่ละหน้า ดัดแปลงจากสคริปต์ที่ครูใช้สร้างชีท PDF (เวอร์ชันนักเรียน)
- `tools/light-m2-shell.html` = แถบเครื่องมือ ปากกา/ยางลบ/กันฝ่ามือ (เหมือน `/demo/`), เปลี่ยนหน้า ◀ ▶ ←/→ ปัดข้าง, ระบบแตะ
- แก้แล้วรัน `python3 tools/build-light-m2.py` แล้ว commit ทั้งสคริปต์และ `public/light-m2/index.html`
- อนิเมชั่นแตะ: ใส่ `class="tap" data-act="ชื่อ"` ในสคริปต์ แล้วเพิ่มฟังก์ชันชื่อเดียวกันใน `ACT` ของ shell; `play(el, ms)` เล่น CSS animation ครั้งเดียว
- ฉายแสงเป็นเงา: `cast_svg(...)` ในสคริปต์ (ตำแหน่งแหล่งแสง, จุดขอบวัตถุ, พื้น `g` หรือผนัง `wall`) + `cast()` ใน shell; แหล่งแสงใช้ `data-act="cast"`
- โหมด ✏️ แตะสั้นๆ บนรูป = เล่นอนิเมชั่น (ไม่เป็นหมึก); โหมด 👆 = แตะ/เลื่อนอย่างเดียว; ลากได้ใช้ `class="drag"`
- บทเรียนใหม่: คัดลอกคู่ไฟล์นี้เป็น `tools/build-<ชื่อ>.py` + ใช้ shell เดิมได้ แล้วเพิ่มลิงก์ใน `classLinks`

## กติกา

- repo นี้เป็น public: **ห้ามมีเฉลย** ในไฟล์ที่ commit (ทั้งหน้าเว็บและสคริปต์) เฉลยต้องเข้ารหัสแบบ check-keys / vault เท่านั้น ห้าม commit รหัสผ่านหรือไฟล์เฉลยตัวจริง
- ห้ามลบ `public/CNAME` และ `.github/workflows/deploy.yml`
- ไม่เพิ่ม library ใหม่ ใช้ CSS + vanilla JS
- ใช้งานจริงบน iPad แนวนอน + Apple Pencil, ครูเปิดตรวจในมือถือ/คอม
- ตอบผู้ใช้เป็นภาษาไทย สั้นๆ

## ประหยัดโทเคน

- อ่านไฟล์นี้แล้วไปที่ไฟล์ที่เกี่ยวข้องเลย ไม่ต้องสำรวจ repo ทั้งหมด
- ไม่ต้องขอ PDF: อ่านจากสคริปต์สร้างชีท หรือ `pdftotext` ถ้าจำเป็น
- ทดสอบใน browser และถ่ายภาพหน้าจอเฉพาะเมื่อผู้ใช้ขอ หรืองานกระทบหน้าตา/การแตะ และดูเฉพาะหน้าที่แก้

## ทดสอบในเครื่อง

```
npm ci && npm run build                       # เช็คว่า build ผ่าน
python3 -m http.server 8765 -d public         # แล้วเปิด http://localhost:8765/light-m2/#p5
```
Playwright อยู่ที่ `/opt/node-tools/node_modules/playwright` (ใช้ `devices['iPad Pro 11 landscape']`)
