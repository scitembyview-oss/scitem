# Design

scitem.net looks like an ordinary tutor website: a menu at the top and sections you scroll through. It has the feel of a **science notebook**. The aim is to get parents to message on LINE.

## Signatures
- The hero sits on graph paper (a 28px grid of `--grid` on `--tint`).
- The real lesson slide sits in an iPad frame. Tap "ลองแตะสไลด์จริง" and the poster image becomes the live `/light-p5/#p5` iframe, scaled to fit.
- Highlighter strokes (`.mark`) go under key words. English words carry a Thai gloss in `<ruby>`, which shows the bilingual idea itself.
- Sheet samples are a fanned stack of real question pages (`src/components/Pages.astro`). Tapping one opens `Viewer.astro`, a dialog with every page and a LINE button for the full sheet. Never show answer-key pages.

## Tokens (`src/layouts/Base.astro`)
paper `#fff` · tint `#f2f6fd` · grid `#e3eaf8` · ink `#14213d` · muted `#55607a` · blue `#2457d6` · marker `#ffe066` · LINE `#058a3d` (darkened so white text passes contrast) · rule `#dbe2ee` · radius 16px · pill buttons at least 48px tall (40px for the small header button).
Anuphan, self-hosted in `public/fonts/`, is used for everything.

## Pages
- `/` (Persuade): hero, the courses (two cards with slide covers), sheet samples, "what's in a sheet", about ครูวิว (shows `public/img/teacher.jpg` when that file exists), a 3-step "how to start" band in blue, and LINE.
- `/lessons/`: one row per course, with slide stacks and the checks.
- `/students/`: a list of checks and the Answer Vault.
- `/teacher/`: password, then the grader and share links.
- `/parents` redirects to `/`.
- Every LINE button goes to `LINE_URL` in `src/data/catalog.ts`.

## CI สำหรับรูป
รูปโปรโมต/ประกอบโพสต์ทุกรูปทำด้วย `node tools/make-image.mjs` (แม่แบบ `tools/image-shell.html`) ซึ่งดึงสีและฟอนต์จาก `src/layouts/Base.astro` ทุกครั้ง แก้สีที่เว็บแล้วรูปตามเอง ได้ PNG ที่ `public/img/promo/<ชื่อ>.png`

```
node tools/make-image.mjs --size ig|fb|line --title "เรื่อง*วงกลม π* ป.6" --sub "..." [--img public/img/xxx.jpg]
  [--zoom x,y,w,h] [--badge "ลด 10%"] [--cta "ทักไลน์ รับชีทฟรี"] <ชื่อไฟล์>
```
ตัวอย่างที่ใช้จริง: `public/img/promo/sample-ig.png` (ชีท+ป้ายโปร), `sample-fb.png` (รูปครู), `sample-line.png` (ชีทฟรี)
ขนาด: `ig` 1080×1080 · `fb` 1200×630 (ตัวหนังสือซ้าย รูปขวา) · `line` 1040×1040. ในหัวข้อ `*คำ*` = ขีดปากกาเน้น, `\n` = ขึ้นบรรทัดใหม่. ตัวหนังสือย่อเองให้พอดี ถ้ายาวจนย่อไม่ได้สคริปต์จะหยุดให้ตัดคำ

สูตรโพสต์ขาย (ให้คนไถฟีดหยุดดู)
- **หัวข้อ** = ปัญหาหรือผลลัพธ์ที่ผู้ปกครองสนใจ เช่น "ลูกเรียน EP แต่*ศัพท์วิทย์*ไม่แน่น?" ไม่ใช่แค่ชื่อชีท
- **รูป** = ส่วนที่น่าสนใจของชีทจริง ขยายด้วย `--zoom` (สัดส่วน 0–1 ของรูป: ซ้าย,บน,กว้าง,สูง) ให้อ่านออกบนมือถือ หรือรูปครูวิว
- **ป้าย** `--badge` = โปร/ราคา/ฟรี สั้นๆ ไม่เกิน 2 บรรทัด วงกลมเหลือง marker เอียง 8° ที่มุมขวาบนของรูป
- **ปุ่ม** `--cta` = สิ่งที่ให้ทำต่อ ("ทักไลน์ รับชีทฟรี", "ดูตัวอย่างฟรี") แถบ ink เต็มความกว้างด้านล่าง ปุ่มสีเขียว LINE ชื่อ scitem.net สีขาวด้านขวา
- รูปที่ไม่มี `--cta` (เช่นรูปประกอบบทความ) ไม่ต้องมีแถบ ชื่อ scitem.net อยู่มุมขวาล่างตามเดิม

- **สี**: พื้น tint `#f2f6fd` · ตัวหนังสือ ink `#14213d` · คำรอง muted `#55607a` · น้ำเงิน `#2457d6` (ใช้กับ "scitem" ในชื่อเว็บ) · ปากกาเน้น marker `#ffe066` ขีดใต้คำสำคัญ ทับตัวหนังสือช่วงล่าง 58–92% เหมือน `.mark` บนเว็บ · LINE `#058a3d` ใช้เฉพาะเมื่อพูดถึงไลน์
- **ฟอนต์**: Anuphan ตัวเดียว ทั้งไทยและอังกฤษ (`public/fonts/` ไฟล์ thai + latin) หัวข้อหนา 700 คำรอง 500 สคริปต์รอฟอนต์โหลดเสร็จก่อนถ่ายภาพ
- **พื้น**: กระดาษกราฟ เส้น grid `#e3eaf8` หนา 2px บน tint ช่องละ 36px (ที่ 1080) เส้นแรกตรงกับขอบระยะห่าง
- **ตำแหน่ง**: โลโก้ `logo-bar.png` มุมซ้ายบน · ชื่อ scitem.net มุมขวาล่างทุกรูป (บนพื้นกราฟ: **scitem** สีน้ำเงิน .net สี ink; ในแถบปุ่ม: สีขาว) · ระยะขอบ 84px (สี่เหลี่ยม) / 64px (fb)
- **รูปประกอบ**: หน้าชีทหรือภาพสไลด์จริงจาก `public/img/sheets/`, `public/img/slides/`, `public/img/shop/` วางบนการ์ดขาวขอบมน เงานุ่ม เอียง −1.5° เหมือนกระดาษวางบนสมุด

ห้ามทำ
- ห้ามใช้หน้าเฉลยหรือเห็นคำตอบในรูป (repo เป็น public) และห้ามโปร/ราคาที่หมดเวลาแล้ว
- ห้ามใช้ฟอนต์อื่น ไล่สี (gradient) เงาตัวหนังสือ หรือสีนอกรายการข้างบน
- ห้ามปากกาเน้นเกินหนึ่งช่วงต่อหัวข้อ และห้ามเน้นทั้งประโยค · ป้ายเหลืองไม่เกินหนึ่งอันต่อรูป · ปุ่มเดียวต่อรูป
- ห้ามวางตัวหนังสือทับรูปถ่าย ห้ามยืด/บีบโลโก้ ห้ามตัดชื่อ scitem.net ออก
- ห้ามรูปที่มีข้อมูลส่วนตัว (เบอร์โทร ชื่อเต็มนักเรียน หน้าเด็ก GPS ในรูปจากมือถือ)
- ห้ามแก้รูปใน `public/img/promo/` ด้วยมือ ให้แก้คำสั่งแล้วสร้างใหม่
