# วิธีแก้เว็บ scitem.net (สำหรับใช้กับ Cursor)

เว็บนี้สร้างด้วย Astro และขึ้นเว็บอัตโนมัติผ่าน GitHub Pages
ทุกครั้งที่ push ขึ้น branch `main` เว็บจริงจะอัปเดตเองภายในไม่กี่นาที

## ไฟล์สำคัญ

| อยากแก้อะไร | ไฟล์ |
|---|---|
| ข้อความหน้าแรก, รายการชีท | `src/pages/index.astro` |
| เมนูด้านบน, footer, สี, ฟอนต์ | `src/layouts/Base.astro` |
| รูปภาพ, ไฟล์ PDF | ใส่ในโฟลเดอร์ `public/` |

## เพิ่มชีทใหม่ในหน้าแรก

เปิด `src/pages/index.astro` หารายการ `const sheets = [ ... ]` ด้านบนสุด
แล้วเพิ่มอีกหนึ่งก้อนแบบนี้ (อย่าลืมจุลภาค `,` คั่นระหว่างก้อน):

```js
  {
    level: 'ม.2 / Grade 8',
    title: 'Electricity Vocabulary',
    th: 'ไฟฟ้า',
    note: 'คำศัพท์ 15 คำ แบบฝึกหัด 3 ชุด',
    pdf: '/sheets/electricity-m2.pdf',
  },
```

`pdf` ใส่หรือไม่ใส่ก็ได้ ถ้าใส่ จะมีปุ่ม "เปิดดูชีท" กับ "โหลด PDF" ขึ้นที่การ์ดชีท
วางไฟล์ PDF ไว้ในโฟลเดอร์ `public/sheets/` แล้วใส่ชื่อไฟล์ตามตัวอย่าง (ตั้งชื่อเป็นภาษาอังกฤษ ไม่มีเว้นวรรค)

ตัวอย่างคำสั่งที่พิมพ์ให้ Cursor ได้เลย:
> เพิ่มชีท ม.2 เรื่อง Electricity (ไฟฟ้า) ในรายการ sheets ของ src/pages/index.astro ตามรูปแบบเดิม

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
- หน้าครู: scitem.net/check/teacher/ ใส่รหัสผ่านครู แล้ววางรหัสนักเรียน เพื่อดูคะแนน เวลาต่อข้อ และเฉลย
- เฉลยเก็บแบบเข้ารหัสใน `src/data/check-keys.json` ไฟล์เฉลยตัวจริงกับรหัสผ่านอยู่นอก repo นี้ (ในไฟล์โปรเจกต์ของ Claude)
  เพิ่มหรือแก้ชุดใหม่ ให้ขอ Claude ทำให้ แล้วเข้ารหัสใหม่ด้วย `node tools/encrypt-check-keys.mjs <keys.json> <รหัสผ่าน>`
