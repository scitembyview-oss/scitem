# วิธีแก้เว็บ scitem.net (สำหรับใช้กับ Cursor)

เว็บนี้สร้างด้วย Astro และขึ้นเว็บอัตโนมัติผ่าน GitHub Pages
ทุกครั้งที่ push ขึ้น branch `main` เว็บจริงจะอัปเดตเองภายในไม่กี่นาที

## ไฟล์สำคัญ

| อยากแก้อะไร | ไฟล์ |
|---|---|
| รายการชีท สไลด์ เช็ค ทุกอย่างบนเว็บ | `src/data/catalog.ts` |
| เมนูด้านบน, footer, สี, ฟอนต์ | `src/layouts/Base.astro` |
| รูปภาพ, ไฟล์ PDF | ใส่ในโฟลเดอร์ `public/` |

## เพิ่มชีท สไลด์ หรือเช็คใหม่

รายการทั้งหมดอยู่ใน `src/data/catalog.ts` ในรายการ `items` เพิ่มอีกหนึ่งก้อน (อย่าลืมจุลภาค `,`):

```js
  { title: 'Electricity Vocabulary', th: 'ไฟฟ้า', kind: 'sheet', grade: 'ม.2',
    meta: 'ศัพท์ 15 คำ', note: 'คำศัพท์ 15 คำ แบบฝึกหัด 3 ชุด',
    pages: ['/img/sheets/elec-1.jpg', '/img/sheets/elec-2.jpg'] },
```

- `kind`: `sheet` ชีท (ขึ้นในส่วนตัวอย่างชีทหน้าแรก), `slides` สไลด์, `check` เช็คพื้นฐาน
- `course`: ใส่ถ้าอยากให้ขึ้นในหน้าบทเรียน `p5-light` หรือ `physics-lower` (เพิ่มคอร์สใหม่ใน `courses`)
- `pages`: รูปตัวอย่าง **เฉพาะหน้าโจทย์ ห้ามใส่หน้าเฉลย**
- รูปครูอยู่ที่ `public/img/teacher.jpg` ถ้ามีไฟล์นี้ จะขึ้นในส่วน "เกี่ยวกับครู" เอง

ตัวอย่างคำสั่งที่พิมพ์ให้ Claude ได้เลย:
> เพิ่มชีท ม.2 เรื่อง Electricity ใน catalog พร้อมทำรูปตัวอย่างจาก public/sheets/electricity-m2.pdf หน้า 1–2

## ดูเว็บในเครื่องก่อน push

```
npm install      # ครั้งแรกครั้งเดียว
npm run dev      # แล้วเปิด http://localhost:4321
```

## ห้ามลบ

- `public/CNAME` (ทำให้ scitem.net ชี้มาที่เว็บนี้)
- `.github/workflows/deploy.yml` (ตัวที่เอาเว็บขึ้นอัตโนมัติ)

## Answer Vault (หน้าปลดล็อกเฉลย)

หน้า `src/pages/vault.astro` (เปิดที่ scitem.net/vault) เก็บเฉลยแบบเข้ารหัสไว้ในรายการ `VAULT`
การเพิ่มเฉลยของชีทใหม่ต้องเข้ารหัสก่อน ให้ขอ Claude ทำให้ (ส่งเฉลยกับรหัส Code Breaker ไป) แล้วเอาข้อความที่ได้มาเพิ่มเป็นบรรทัดใหม่ในรายการ `VAULT`
รหัสปัจจุบัน: `LAYERS` = Year 7 Rocks

## เช็คพื้นฐานก่อนเรียน (scitem.net/check/...)

- หน้านักเรียน: `src/pages/check/circular.astro`, `src/pages/check/buoyancy.astro` (มีแต่โจทย์ ไม่มีเฉลย)
- ชุดวงกลมระดับ gifted 8 ข้อ (circular-2) อยู่ที่ `/check/circular-gifted/` ส่วน `/check/circular/` เป็นชุดแรก 10 ข้อ (circular-1) ชุด gifted มีปุ่ม √ π π² ให้กด (ใส่ `symbols` ใน `<BasicCheck>`) หน้าครูตรวจคำตอบแบบ 2√10, 20π², 3/2 หรือทศนิยมที่ใกล้เคียงได้
- นักเรียนทำเสร็จจะได้รหัส `SC1-...` ส่งให้ครูทาง LINE
- หน้าครู: scitem.net/teacher/ (ลิงก์เก่า /check/teacher/ ยังใช้ได้) ใส่รหัสผ่านครู แล้ววางรหัสนักเรียน เพื่อดูคะแนน เวลาต่อข้อ และเฉลย มีปุ่มคัดลอกลิงก์ส่งนักเรียนด้วย
- เฉลยเก็บแบบเข้ารหัสใน `src/data/check-keys.json` ไฟล์เฉลยตัวจริงกับรหัสผ่านอยู่นอก repo นี้ (ในไฟล์โปรเจกต์ของ Claude)
  เพิ่มหรือแก้ชุดใหม่ ให้ขอ Claude ทำให้ แล้วเข้ารหัสใหม่ด้วย `node tools/encrypt-check-keys.mjs <keys.json> <รหัสผ่าน>`

## สไลด์ Light Explorer · Mission 2 (scitem.net/light-p5/)

หน้าเว็บ `public/light-p5/index.html` สร้างจากสคริปต์ ห้ามแก้ไฟล์นี้ตรงๆ
- เนื้อหา รูป และอนิเมชั่นแตะ: `tools/build-light-p5.py`
- แถบเครื่องมือ ปากกา และการเปลี่ยนหน้า: `tools/light-p5-shell.html`

แก้เสร็จแล้วรัน `python3 tools/build-light-p5.py` เพื่อสร้างหน้าเว็บใหม่
ใช้งาน: โหมด ✏️ เขียนได้ และแตะสั้นๆ บนรูปเพื่อเล่นอนิเมชั่น · โหมด 👆 แตะอย่างเดียว ไม่เขียน · ปุ่ม ◀ ▶ หรือลูกศรซ้าย/ขวาเพื่อเปลี่ยนหน้า
