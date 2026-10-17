# Design

scitem.net is a **periodic table of the tutor's material**. Every lesson, check, sheet and tool is one element tile, and the site never falls back to a hero with three icon cards.

## Tile (`src/components/Tile.astro`)
- 2px ink border (`--ink #161b26`), radius 6px, aspect 1 : 1.08, filled with the family colour.
- Top-left: number in catalog order, like an atomic number. Top-right: grade. Middle: a big two-letter symbol (36cqi, 700). Then the English name (700), the Thai name (400), and a meta line under a rule, like an element's mass.
- A tile with no link is dimmed and reads "เร็วๆ นี้". A dashed ghost tile with "?" marks something not made yet.
- Hover or focus lifts the tile 3px with a soft offset shadow.

## Families (`[data-f]` in `src/layouts/Base.astro`)
| family | page | fill | ink | deep (links on white) |
|---|---|---|---|---|
| lessons ชีทสอน | /lessons/ | #2c6be0 | #fff | #1f54b8 |
| students นักเรียน | /students/ | #ffc93c | #1d1a12 | #8a5a00 |
| parents ผู้ปกครอง | /parents/ | #ff7657 | #1d1210 | #b23d22 |
| teacher ครู | /teacher/ | #5b3fa8 | #fff | #4a3190 |

Pass `family` to `<Base>` to colour the page. `--brand` becomes that family's deep colour, and the menu marks the page as current.

## Ground and type
- Cool poster ground `#e9edf1`, white surfaces, ink `#161b26`, muted `#4f5a6b`, soft rule `#a9b2bf`. Light only, because it is used in daylight classrooms and on phones.
- Anuphan (variable, self-hosted at `public/fonts/`, with Thai and Latin subsets) for everything.
- Buttons are ink-filled with radius 6px and at least 44–48px tall. LINE is green `#06c755` with dark text.
- No eyebrow labels, emoji icons or pill shapes.

## Layout
- Home is a 6-column table. The gap at the top middle (columns 2–5, rows 1–2) holds the key: the title, the LINE action, and four family links. Pointing at a family dims every other tile.
- Below 700px the table switches to 3 columns, with the key across the top.
- Family pages start with `.fam-head`: a big family tile next to the h1.
- `/lessons/` gives one "period" row per course: a numbered label on the left and tiles with notes.
