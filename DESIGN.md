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
