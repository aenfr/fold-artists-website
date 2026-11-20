# DESIGN.md — Fold Artists website (2026 overhaul)

> Scientific instrumentation for music: ink on near-black, one signal colour, one beam of spectral light.

Source brief: Asana project "Fold AI Music Co" › section "Foldmgt.com website" (Eric Reithler-Barros, 2026-11-19/20):
"general design / implementation direction", "homepage SEO", "content for pages" (Home, AI Attribution Technology, Applications, People, Contact, logos/photos).
Workflow: `web-design` skill (spec first, code second). Brand base: `brand-guidelines.md` (Inter / JetBrains Mono, Void→Graphite foundation, Lumina Blue for CTAs).

Site-wide headline: **"Which musical works influenced this output, and by how much?"**

---

## 0. Composition rules (non-negotiable)

These three rules decide every layout. When in doubt, re-read them.

### Rule 1 — Three planes
Every hero (and the big statement sections) is built in three stacked planes that overlap:
1. **Back plane (z 0)** — huge display type. On Home it is the H1 itself; on LUMINA it is the ghost word "LUMINA™".
2. **Middle plane (z 1)** — the subject: the *Influence Field* canvas (corpus → threads → output waveform). Its threads cross *over* the back-plane letters (`mix-blend-mode: screen`), which is what creates depth.
3. **Front plane (z 2)** — everything actionable or factual: tiny eyebrow, short body, CTAs, spec badges ("Patent pending", "One influence ranking", "Measured inside the model").

Overlap is intentional: the subject must sit across the type, and the buttons must sit across the subject's edge. A hero where the three planes don't touch is wrong.

### Rule 2 — One signal colour
`--signal` (Lumina Blue family, from the brand) means **"you can click this" and nothing else**: primary buttons, text links, the active nav marker, focus rings, the selected form option.
Everything else is ink and paper: near-black, graphite, warm white, greys.
- Spectral light exists only *inside the subject* (the canvas / its static fallback) and the logo artwork. It is never used for UI chrome, hairlines, icons, or text.
- No other blue, cyan, orange or crimson anywhere in the UI.

### Rule 3 — Skip the middle sizes
Two families of size, nothing in between:
- **Huge**: display type (H1, H2, ghost words, the headline question) — Inter 800, ≥ 2.75rem on mobile, up to 9rem on desktop.
- **Tiny**: everything else — body 15px, metadata/labels 11–12px mono, nav 13px.
No 18–28px "lead" paragraphs, no 20px card titles. Card titles are tiny-bold (15px, 600) or mono labels. Per screen, exactly one element is the huge one.

---

## 1. Visual Theme & Atmosphere

**Style**: Dark Editorial × Lab Instrument
**Keywords**: precise, quiet, measured, proprietary, institutional, luminous, assertive
**Tone**: Bloomberg terminal meets a concert-hall programme — NOT generic AI, NOT crypto, NOT neon
**Feel**: A darkened lab where one calibrated beam of light passes through a prism and reads out a measurement.

**Interaction Tier**: L2 (reveals, nav state, pointer spotlight) + ONE bespoke canvas per page
**Dependencies**: none. Vanilla HTML/CSS/JS. Effects inspired by Magic UI / Aceternity (dot grid, border beam, bento spotlight, text reveal) are re-implemented in plain CSS/JS — no React, Tailwind or Motion runtime.

Disclosure controls (from the brief): no algorithm names, gradient/kernel maths, architecture, parameters, patent numbers, unpublished benchmarks, third-party logos, or numerical attribution demos. No stock AI imagery or invented product screenshots. Graphics stay conceptual.

## 2. Color Palette & Roles

```css
:root {
  /* Paper (brand dark foundation) */
  --bg: #0A0A0F;              /* Void */
  --surface: #111118;         /* Obsidian — panels */
  --surface-alt: #15151D;     /* band between Obsidian and Graphite */
  --surface-hover: #1A1A24;   /* Graphite */
  --line: rgba(242,237,228,0.08);
  --line-strong: rgba(242,237,228,0.18);

  /* Ink (warm white family, per Eric) */
  --ink: #F2EDE4;
  --ink-2: #B4AFA6;           /* body */
  --ink-3: #75716B;           /* metadata */
  --ink-ghost: rgba(242,237,228,0.06);  /* back-plane ghost type */

  /* Signal — the only "tap this" colour (brand Lumina Blue, lifted for AA on Void) */
  --signal: #7FA2FF;
  --signal-hover: #A9C0FF;
  --signal-ink: #0A0A0F;      /* text on signal */
  --signal-rgb: 127,162,255;

  /* Spectrum — subject only (canvas + its SVG fallback) */
  --spectrum: linear-gradient(90deg,#E8820C,#F2C14E,#9BE3C3,#8FB0FF,#B79BFF);

  /* Form feedback */
  --error: #F08A7A;
  --success: #9BE3C3;
}
```

## 3. Typography Rules

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Role | Font | Size | Weight | LH | Tracking |
|------|------|------|--------|----|----------|
| H1 / ghost (HUGE) | Inter | clamp(2.9rem, 9vw, 9rem) | 800 | 0.92 | -0.055em |
| H2 / statement (HUGE) | Inter | clamp(2.4rem, 6vw, 5.5rem) | 800 | 0.95 | -0.045em |
| Body (tiny) | Inter | 0.9375rem | 400 | 1.65 | — |
| Card title (tiny) | Inter | 0.9375rem | 600 | 1.4 | -0.005em |
| Label / meta (tiny) | JetBrains Mono | 0.6875–0.75rem | 500 | 1.4 | 0.14em, uppercase |
| Nav (tiny) | Inter | 0.8125rem | 500 | 1 | 0.01em |

- One H1 per page; H2 per section; H3 for cards (styled tiny). No skipped levels.
- Emphasis inside huge type = second clause in `--ink-3`, never colour.
- NEVER: serif display faces, Space Grotesk/Orbitron, gradient-filled text, text glow.

## 4. Component Stylings

- **Primary button**: `--signal` bg, `--signal-ink` text, pill, 48px tall, 13px/600 label + arrow. Hover `--signal-hover` + arrow nudge 3px. Active: no lift. Focus-visible: 2px `--signal` outline offset 3px. Disabled: 40% opacity.
- **Secondary action**: text link with arrow in `--signal` (no ghost buttons — anything clickable shows the signal colour).
- **Text links**: `--signal`, underline 1px offset 3px, hover `--signal-hover`.
- **Nav**: fixed, 64px; transparent → Void 85% + blur(12px) + bottom line after 24px scroll. Links `--ink-2`, hover `--ink`, current page `--ink` + 6px signal dot. "Request a briefing" = small primary button. < 860px: menu sheet, links huge (Rule 3), Esc closes, focus trapped.
- **Panels**: `--surface`, 1px `--line`, radius 16px, pointer spotlight (ink, not signal, 5% alpha). Hover: `--line-strong`, `--surface-hover`. Non-clickable panels never turn signal.
- **Spec badges** (front plane): 1px `--line-strong` pill, mono 11px, `--ink-2`. Not clickable → no signal.
- **Person card**: grayscale portrait or monogram plate (huge initials in `--ink-ghost` on `--surface-alt` — Rule 1 in miniature), name tiny-bold, role/city mono, `<details>` "Read bio" in signal.
- **Form**: inputs `--surface`, 1px `--line`, 48px, radius 10px; focus `--signal` border + 3px `rgba(var(--signal-rgb),.22)` ring. Inquiry type = segmented radio chips (selected chip = signal). `?inquiry=lumina` preselects "LUMINA Technical Evaluation". Backend: mailto fallback (one constant to swap).

## 5. Layout Principles
- Container 1240px, side padding clamp(16px, 4vw, 48px). Text column ≤ 34rem (tiny body wants short lines).
- Section rhythm clamp(96px, 13vw, 176px). Spacing scale 4·8·12·16·24·32·48·64·96·128.
- Huge type may break the container (bleed to viewport edge); tiny type never does.
- Routes: `/` · `/lumina/` · `/applications/` · `/people/` · `/contact/` + `sitemap.xml`, `robots.txt`.

## 6. Depth & Elevation
Depth comes from the three planes, not shadows. Only shadow: `--lift: 0 30px 80px -40px rgba(0,0,0,.9)` on the front-plane CTA cluster and the mobile menu sheet. Background texture: faint dot grid (`--line`, 28px pitch) masked to fade at edges, on hero only.

## 7. Animation & Interaction
- **Influence Field** (subject): ~520 faint ink points (corpus) drift on the left; one calibrated waveform (output) on the right; every ~5 s a handful of points resolve and spectral threads connect them to the waveform, width/brightness ∝ an illustrative weight, then fade. No numbers. Canvas 2D, DPR ≤ 2, paused off-screen and on hidden tab; < 760px → 180 points; `prefers-reduced-motion` → one static frame; no-JS → inline SVG still.
- Hero H1: per-line mask reveal (clip-path, 900ms, 90ms stagger).
- H2/statement: rise 16px + fade on enter, once.
- Meta labels: type-on of the mono label (steps, 500ms).
- Panels: pointer spotlight (rAF-throttled); signal border-beam on the primary CTA panel only.
- Easing cubic-bezier(.2,.7,.2,1). `prefers-reduced-motion`: everything instant.

## 8. Do's and Don'ts
**Do**: one huge thing per screen · overlap the three planes · use signal only for clickable things · lead with the question · keep core copy in plain HTML · route every CTA to /contact (LUMINA ones with `?inquiry=lumina`) · track CTA/form events without content.
**Don't**: name methods/maths/patent numbers · show attribution-looking numbers · stock AI imagery · third-party logos · middle-size type (18–28px) · signal colour on non-clickable things · spectral colour outside the subject · blur on moving elements · funding/valuation on the public site · unapproved home cities.

## 9. Responsive Behavior
Breakpoints 1240 · 1024 · 860 (nav) · 760 (1-col, light canvas) · 480. Touch ≥ 44px. Mobile hero: H1 still huge (≥ 2.9rem) with the field behind/under it, CTAs below. No horizontal overflow at 360px (huge type uses `overflow-wrap` + clamp).

---

## Page map
| Route | Huge thing | Content source |
|---|---|---|
| `/` | H1 "Music shapes AI. We measure how." | Eric's Home copy |
| `/lumina/` | ghost "LUMINA™" behind H1 "The science of musical influence." | Eric's LUMINA copy + SEO brief |
| `/applications/` | H1 "Where influence becomes value." (draft) | drafted from Home + LUMINA copy — needs Eric's review |
| `/people/` | H1 "The people behind Fold." | Asana People subtasks |
| `/contact/` | H1 "Let's talk." | Home closing copy + form spec |

## Open items
Applications copy (draft) · Ánfer's role/city · Rob/Ulf bios not marked approved · Silvia Montello bio missing · keep Avery Wang & Phil Wiser? · real photos (monograms until then) · contact email (placeholder info@foldartists.com) · production domain for sitemap (placeholder https://foldmgt.com) · gate on ⇒ pages carry `noindex` until it comes off.
