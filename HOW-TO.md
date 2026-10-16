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
  },
```

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
