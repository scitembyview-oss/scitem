// ทำรูปโปรโมต/ประกอบตาม CI ของเว็บ (DESIGN.md "CI สำหรับรูป") เป็น PNG ใน public/img/promo/
// node tools/make-image.mjs --size ig|fb|line --title "..." --sub "..." [--img public/img/xxx.jpg] <ชื่อไฟล์>
//   [--zoom x,y,w,h] ตัดส่วนของรูป (0–1) · [--badge "ลด 10%"] ป้ายวงกลมเหลือง · [--cta "ทักไลน์ รับชีทฟรี"] แถบปุ่มด้านล่าง
// ในหัวข้อ *คำ* = ขีดปากกาเน้น, \n = ขึ้นบรรทัดใหม่
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SIZES = { ig: [1080, 1080], fb: [1200, 630], line: [1040, 1040] };
const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };

const usage = 'ใช้: node tools/make-image.mjs --size ig|fb|line --title "..." [--sub "..."] [--img public/img/xxx.jpg] [--zoom x,y,w,h] [--badge "..."] [--cta "..."] <ชื่อไฟล์>';
const opts = {};
let name;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) opts[argv[i].slice(2)] = argv[++i];
  else name = argv[i];
}
const size = SIZES[opts.size];
if (!size || !opts.title || !name) { console.error(usage); process.exit(1); }

// รูปต้องอยู่ใน public/ จะได้เปิดด้วย path เดียวกับเว็บ
let img;
if (opts.img) {
  const abs = resolve(opts.img);
  const pub = join(ROOT, 'public');
  if (!existsSync(abs) || !abs.startsWith(pub + '/')) { console.error('--img ต้องเป็นไฟล์ใน public/ เช่น public/img/slides/light-5.jpg'); process.exit(1); }
  img = '/' + abs.slice(pub.length + 1).split('/').map(encodeURIComponent).join('/');
}

// สีและฟอนต์เอามาจาก Base.astro ตรงๆ แก้ที่เดียวแล้วรูปตาม
const base = readFileSync(join(ROOT, 'src/layouts/Base.astro'), 'utf8');
const css = [...base.matchAll(/@font-face\s*{[^}]*}/g), base.match(/:root\s*{[^}]*}/)].map((m) => m[0]).join('\n');
const shell = readFileSync(join(ROOT, 'tools/image-shell.html'), 'utf8').replace('/*BASE*/', css);

const file = name.replace(/\.png$/i, '') + '.png';
const out = join(ROOT, 'public/img/promo', file);
mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 1 });
  // ไม่ต้องเปิดเซิร์ฟเวอร์: ส่งไฟล์จาก public/ ให้หน้าแม่แบบเอง
  await page.route('http://scitem.local/**', (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    if (path === '/') return route.fulfill({ body: shell, contentType: 'text/html; charset=utf-8' });
    const f = join(ROOT, 'public', path);
    if (!f.startsWith(join(ROOT, 'public') + '/') || !existsSync(f)) return route.fulfill({ status: 404 });
    route.fulfill({ body: readFileSync(f), contentType: TYPES[extname(f).toLowerCase()] || 'application/octet-stream' });
  });
  await page.goto('http://scitem.local/');
  const nl = (t) => (t || '').replace(/\\n/g, '\n');
  await page.evaluate((o) => window.render(o), {
    w: size[0], h: size[1], img, zoom: opts.zoom,
    title: nl(opts.title), sub: nl(opts.sub), badge: nl(opts.badge), cta: opts.cta,
  });
  await page.screenshot({ path: out });
  console.log(`public/img/promo/${file} (${size[0]}x${size[1]})`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
