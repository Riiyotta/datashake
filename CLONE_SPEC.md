Source: Datashake marketing site (live source, recon capture)

> Measured live via Playwright (Chromium) at 1920/1440/1280/960/767/479/390/320px viewports, cross-referenced against the locally saved snapshot `Social & Review Data Infrastructure _ Datashake.html` and its `Social & Review Data Infrastructure _ Datashake_files/` folder (Webflow export, site built on Webflow with a "Client-First"-style utility class system). All values below are computed-style measurements, not visual estimates, unless explicitly flagged as unmeasurable.
>
> This is a single-page marketing site (one route: `/`). Everything in this spec covers that one page.

---

## 0. Tech-stack facts Build needs up front

- **Framework of origin:** Webflow (class naming: `padding-global`, `container-large`, `text-size-*`, `heading-style-*`, `w-*` = Webflow's own runtime classes). Do not try to reproduce Webflow's own `w-*` plumbing classes verbatim in React/Tailwind — reproduce the **visual effect** they produce (documented below).
- **No CSS framework** (no Bootstrap/Tailwind on the original) — this is hand-built utility CSS. We are re-implementing it in Tailwind v3; class names will not match 1:1, only computed output must match.
- **Fonts:** Google-hosted **Inter** (variable, loaded via `fonts.googleapis.com` css2 endpoint, weights 400/500/600 confirmed in the local `css2` file) is used for the *default fallback* Inter stack, but the actual live site's Inter glyphs are served from **Webflow's own CDN**, not Google Fonts:
  - `Inter` weight 400 → `https://cdn.prod.website-files.com/69385e16d68663814109c132/69385f0223fa90c59e74df4e_Inter-Regular.woff2`
  - `Inter` weight 500 → `https://cdn.prod.website-files.com/69385e16d68663814109c132/69385f028bda5c4bd75a1c17_Inter-Medium.woff2`
  - Headings use a **paid/custom display font**, "Altriviera", self-hosted on Webflow's CDN, weight 400 only, family name in CSS is the obfuscated string `"Altriviera Bf 6527666 De 181 E"`:
    - `https://cdn.prod.website-files.com/69385e16d68663814109c132/69385f025765e26054a8a824_ALTRiviera-Regular-BF6527666de181e.woff2`
  - **None of these three woff2 files exist in the local `_files` folder** (only the Google Fonts `css2` stylesheet text file was saved, and it only covers Inter, not Altriviera). **Build must download these 3 woff2 files fresh** from the URLs above (or use Google Fonts' hosted Inter as a close substitute for body text — visually near-identical; there is no public alternative for Altriviera, it must be self-hosted from the CDN URL above or the clone will fall back to Arial/sans-serif, which is visibly different from the original headings).
  - Rename suggestion for the clone's `@font-face`: call it `"Altriviera"` locally instead of reproducing Webflow's mangled family name.
- **Animation libraries loaded:** GSAP 3.x (`gsap.min.js`) and ScrollTrigger (`ScrollTrigger.min.js`) are loaded and `gsap.registerPlugin(ScrollTrigger)` is called — **but `ScrollTrigger.getAll()` returns 0 registered triggers on the live page**. There is no scroll-triggered reveal/parallax animation anywhere on this page today, despite the libraries being present. See §7 Motion for what actually animates (Lottie illustrations, a CSS/GSAP `timeline` word-carousel, Webflow-native tab/accordion transitions, and `typed.js`). **Do not build ScrollTrigger-based reveal-on-scroll effects — none exist on the real site.**
- **Root font-size is fluid** (critical for pixel accuracy) — see §2 Typography → "Fluid rem scaling" below. All `rem`-based spacing/type sizes in this spec scale continuously with viewport width per that formula; the px numbers quoted for "desktop" assume viewport ≥ 1440px, where `html { font-size: 16px }` exactly.
- **Border-radius is 0px everywhere** on this page (buttons, cards, tabs, FAQ items, testimonial links) — confirmed by evaluating `borderRadius` on all interactive/card-like elements; the only rounded shape is the WhatsApp floating widget circle button (`border-radius: 50%`) and its bubble (`10px`), which is unrelated to the main page and injected by third-party script — not part of the design system to replicate exactly, but flag it for parity if desired (see §8).
- **Box-shadows are minimal.** Only the WhatsApp widget (`0 4px 20px rgba(0,0,0,0.12)` on the bubble, `0 4px 16px rgba(37,211,102,.35)` on the button) and one consent-related outline use a shadow. No cards/sections in the main design use shadows.

---

## 1. Breakpoints

Standard Webflow breakpoints, confirmed via `@media` queries in the saved CSS:

| Breakpoint | max-width | Notes |
|---|---|---|
| Desktop | (no upper bound) | ≥ 992px |
| Tablet | 991px | |
| Mobile landscape | 767px | |
| Mobile portrait | 479px | |

Additionally there are **fluid-typography breakpoints** at 1440px and 960px (separate from the layout breakpoints above) — see below.

---

## 2. Typography

### 2a. Fluid rem scaling (root font-size) — measure this exactly, it drives every `rem` value on the page

The page does **not** use a fixed 16px root. Instead there's an inline `<style>` block computing `html { font-size }` via CSS custom properties, linearly interpolating between a "from" and "to" px value across a viewport-width range:

```css
:root {
  --font-from: 16;
  --font-to: 16;
  --vw-from: calc(1440 / 100);
  --vw-to: calc(1920 / 100);
  --coefficient: calc((var(--font-to) - var(--font-from)) / (var(--vw-to) - var(--vw-from)));
  --base: calc((var(--font-from) - var(--vw-from) * var(--coefficient)) / 16);
}
html { font-size: calc(var(--base) * 1rem + var(--coefficient) * 1vw); }

@media screen and (max-width: 1440px) {
  :root { --font-from: 13; --font-to: 16; --vw-from: calc(960 / 100); --vw-to: calc(1440 / 100); }
}
@media screen and (max-width: 960px) {
  :root { --font-from: 12; --font-to: 16; --vw-from: calc(479 / 100); --vw-to: calc(960 / 100); }
}
@media screen and (max-width: 479px) {
  :root { --font-from: 12; --font-to: 16; --vw-from: calc(1 / 100); --vw-to: calc(479 / 100); }
}
```

Verified computed `html` font-size at real widths (Chromium):

| viewport width | computed root font-size |
|---|---|
| 1920px | 16px |
| 1440px | 16px |
| 1280px | 15px |
| 960px | 16px |
| 767px | 14.395px |
| 479px | 16px |
| 390px | 15.2552px |
| 320px | 14.6695px |

**Implementation guidance for Build:** reproduce this exact CSS (custom properties + `calc()`), not a hard-coded rem value, and not Tailwind's default 16px root — otherwise every `rem`-sized spacing/type value in the rest of this spec will be off by several percent at in-between viewport widths. This is the single highest-leverage fix for "why does it look almost-but-not-quite right" pixel mismatches.

### 2b. Type roles (values below are the **rem values** from CSS; multiply by the computed root font-size above for actual px — the desktop px column assumes 1440–1920px viewport where root = 16px)

| Role / class | Font family | Weight | Size (rem → px @16px root) | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|---|
| `.heading-style-h1` (hero H1, is-48px variant used site-wide) | Altriviera, Arial, sans-serif | 400 | 3.5rem / 56px base class; `.is-48px` override → 48px | 1.1 (base) / 1.2 (`.is-48px`) | -0.02em (base) / measured live: **-0.96px** at 48px (~-2%) | `#0d0d0d` (var `--black`) |
| `.heading-style-h2` (section H2) | Altriviera, Arial, sans-serif | 400 | measured live 48px | 57.6px (1.2) | -0.72px | `#0d0d0d` |
| `.heading-style-h3` (sub-section H3, `.is-32px`/`.is-24px` variants exist) | Altriviera, Arial, sans-serif | 400 | base 2.5rem/40px; measured live section H3 = 40px | 48px (1.2) | -0.5px | `#0d0d0d` |
| Nav links / body copy (`.text-size-regular`) | Inter, Arial, sans-serif | 400 | 1rem/16px | 24px (via body 1.5 default, block display) | -0.01em | `#0d0d0d` for primary, `#666` (`--grey-v2`) for muted, `#2d62ff` for links |
| `.text-size-medium` | Inter, Arial, sans-serif | 400 (500 with `.text-weight-medium`) | 1.125rem/18px | inherits (~1.5) | -0.015em | `#0d0d0d` |
| `.text-size-large` | Inter, Arial, sans-serif | 400/500 | 1.25rem–1.5rem depending on variant, `.is-24px` = 24px, `.is-32px` (testimonial quote) = 32px | ~1.25–1.5 | -0.015em to -0.02em | varies by section (blue/orange/purple/yellow on testimonial cards, see §5) |
| Buttons (`.button`) | Inter, Arial, sans-serif | 500 | 1.125rem/18px | 1 (single line, `white-space: nowrap`) | -0.02em | `#0d0d0d` on green button; `#666` on secondary/outline |
| Nav menu links (`.nav_menu_link`) | Inter, Arial, sans-serif | 500 | measured 16px | 24px | -0.6px (fixed px, not em) | `#666` default → `#0d0d0d` on hover/current (`transition: color .3s`) |
| Eyebrow pill (small label chip above hero, e.g. "The Social Data Coverage Report 2026 is here ⚡") | system-ui fallback stack (**not** Inter — confirmed via computed style, this element did not inherit the Inter override) | 400 | 16px | 24px | normal | `#000` text on `#fafafa` background pill, `padding: 6px 12px`, `border-radius: 0` |

Global fallback stack used anywhere Inter/Altriviera aren't explicitly applied (`body` default): `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`.

Base (un-utility-classed) heading tag sizes if Build ever needs semantic-tag fallbacks (from Webflow's base reset, before class overrides): `h1` 4rem/700, `h2` 3rem/700, `h3` 2rem/700, `h4` 1.5rem/700, `h5` 1.25rem/700, `h6` 1rem/700 — **these are overridden everywhere on the live page by the `.heading-style-h*` utility classes above**, which use weight 400 + the Altriviera font instead. Use the utility-class values as source of truth.

`p` tag base: `letter-spacing: -.015em`.

---

## 3. Color tokens

All values below are hex or rgb pulled from either the CSS `:root` custom properties or live `getComputedStyle` (both cross-checked and consistent):

```
--black:        #0d0d0d      /* primary text / dark backgrounds */
--grey-v2:      #666666      /* secondary/muted text */
--border:       #d9d9d9      /* hairline borders (0.5px), used with border-style: dashed in FAQ */
--dark-green:   #103a11      /* dark green accent bg (e.g. testimonial dark variant) */
--green:        #3fe844      /* primary CTA button background */
--red:          #c0392b
--purple:       #a72bff
--blue:         #3981ff      /* button "is-blue" variant background */
--orange:       #ff930f      /* button "is-orange" variant background */
--yellow:       #ffd521
--light-orange: #fff4e7      /* testimonial-link orange tab bg */
--light-green:  #ecfdec
--light-blue:   #ebf2ff      /* testimonial-link blue/active tab bg + active tab content bg */
--light-purple: #f6eaff      /* testimonial-link purple tab bg */
--light-yellow: #fffbe9      /* testimonial-link yellow tab bg */
--grey-v1:      #fafafa      /* eyebrow pill bg, dropdown bg */
link/brand blue: #2d62ff     /* rgb(45, 98, 255) — nav link color, footer link color, "PlatformExplore Datashake" style links, testimonial-link active text color across ALL tab variants */
```

Live computed background colors found across the page (deduped, from a full-page walk):
`#ffffff`, `#dddddd` (dropdown bg), `#fafafa`, `#0d0d0d` (dark sections/nav mobile), `#3fe844` (CTA green), `#d9d9d9`, `#fffbe9` (yellow tab), `rgba(221,221,221,0)`, `#ebf2ff` (blue tab), `#fff4e7` (orange tab), `#f6eaff` (purple tab), `#103a11` (dark green), `rgba(255,255,255,.03)`, `#ecfdec`, `#e0e0e0`, `#25d366` (WhatsApp green, third-party), `rgba(0,0,0,.7)` (overlay/scrim).

Live computed text colors found (deduped): `#000000`, `#333333`, `#666666`, `#2d62ff`, `#0d0d0d`, `#ffffff`, `#3fe844`, `#3981ff`, `#ff930f`, `#a72bff`, `#ffd521`, `#e51520`, `#1a1a1a`.

**Important nuance on testimonial tabs:** all 4 testimonial-link tab variants (blue/active, orange, purple, yellow) render their **label text in the same blue `#2d62ff`**, only the pill/tab **background** color changes per variant (light-blue/light-orange/light-purple/light-yellow from the palette above). Don't accidentally make the label text match the tab's accent color — measured live, it's always `rgb(45, 98, 255)`.

---

## 4. Spacing grid, containers, layout primitives

### Containers
- `.padding-global`: horizontal page gutter. Desktop (≥1440px): `padding: 0 2.5rem` (0 40px @16px root). Tablet (768px): computed `0 18px` (scales with fluid root). Mobile (390px): computed `0 11.44px`. Formula: always `0 2.5rem`, it's the *root font-size* that shrinks, not the rem multiplier.
- `.container-large`: `width: 100%; max-width: 90rem` (1440px @16px root); `margin: 0 auto`. Measured live desktop content width inside padding-global at 1440px viewport = **1360px** (1440 − 2×40 gutter). A `.side-border` modifier adds `0.5px solid var(--border)` hairlines on left+right; `.bottom-border` adds a `0.5px solid` hairline below the section only.
  - A narrower `.container-large.side-border._w-70rem` modifier caps at `max-width: 70rem` (1120px) for narrower content blocks (e.g. FAQ, some centered sections).

### Spacer utility scale (explicit spacer `<div>` elements, not margin — measured live heights)
```
.spacer-tiny:   16px
.spacer-xsmall:  8px
.spacer-small:  32px
.spacer-medium: 72px
```
(These are fixed px in the CSS as rem values that also ride the fluid root-font-size scale, e.g. spacer-medium = 4.5rem.)

### Grid patterns
- Hero content area: CSS Grid `.grid-2col` → `grid-template-columns: 1fr 1fr` (measured live: `679px 679px` at 1360px container, i.e. an even 2-column split with no gap), left column text, right column Lottie illustration.
- `.flex-v.gap-full.min-gap-6rem.mobile-2rem`: vertical flex stack, `gap: 96px` desktop (6rem @16px), collapsing to `2rem` (32px-ish, scaled) on mobile.
- Nav: `.nav_menu` is `display:flex; gap:20px` housing a `.flex-h.is-menu` (dropdown group) + `.button-group.is-mobile` (Login / Book a call CTAs).
- FAQ: `.faq-question` uses `display:flex` inside a CSS grid template `1fr 80px` (question text column + fixed 80px icon column), `.faq-icon` is `width: 5rem` (80px) with a `border-left: .5px dashed var(--border)`.

### Border style
Hairline borders throughout use `border-width: .5px` (sub-pixel), mostly `solid`, but FAQ items use `border-style: dashed` specifically on the question/answer divider lines. Border color is always `var(--border)` = `#d9d9d9`.

---

## 5. Section-by-section inventory (DOM order, desktop 1440×900, measured `top`/`height` in live scroll-space)

| # | top(px) | height(px) | Section class | Heading (verbatim) |
|---|---|---|---|---|
| 1 | 0 | 754 | `hero-section bottom-border` | "One API. One schema. Cleaned, normalized." (+ rotating-word H1, see §7) |
| 2 | 754 | 228 | `logo-section` | (none — logo marquee, "Powering data intelligence for leading platforms & global brands") |
| 3 | 982 | 74 | `divider-section` | (none — thin decorative divider) |
| 4 | 1055 | 1080 | `section-regular-padding` | "You're making decisions on incomplete data foundations" |
| 5 | 1440 | 695 | `divider-section` (variant) | (none) |
| 6 | 2136 | 1490 | `section-regular-padding` | "Get the most complete data to power your insights" |
| 7 | 3700 | 430 | `section-regular-padding` | "What would you build with unlimited access to public conversation data" |
| 8 | 4204 | 701 | `section-regular-padding` | "Your most reliable source of social & review data at scale" |
| 9 | 4979 | 819 | `section-regular-padding` | "Get answers in seconds" (Benefits — Webflow native tabs component, `.tabs-benefits.w-tabs`) |
| 10 | 5872 | 631 | `section-regular-padding` | "Test your use case with Datashake — for free." |
| 11 | 6577 | 1890 | `section-regular-padding` | "What global companies use Datashake for" (industry icon grid — Customer/Retail/Social/Pharmaceutical/Reputation/Finance/Marketing/Agencies) |
| 12 | 6837 | 1551 | `divider-section` (variant, overlaps #11 in scroll-space due to negative margin/overlap layout) | (none) |
| 13 | 8542 | 500 | `section-regular-padding` | (none — testimonial tab carousel, see §5a) |
| 14 | 9115 | 1147 | `section-regular-padding` | "Your questions, answered" (FAQ accordion) |
| 15 | 10336 | 550 | `section-regular-padding` | "Book a call with one of our data experts" (final CTA) |
| 16 | 10960 | 790 | `footer-section` | (none — footer) |

### 5a. Hero section (`.hero-section.bottom-border`)
Structure (measured, desktop): `.padding-global` → `.container-large.side-border` → `.spacer-medium` (72px top spacer) → `.grid-2col` (679px + 679px columns):
- **Left column**: `.text-wrapper.padding-3rem` (48px padding all sides) containing `.flex-v.gap-full.min-gap-6rem.mobile-2rem` (96px gap):
  - Eyebrow pill: "The Social Data Coverage Report 2026 is here ⚡" — `#fafafa` bg, black text, `padding: 6px 12px`, 16px/24px Inter regular, no border-radius.
  - H1 with an inline **rotating word carousel** (see §7 Motion) reading "One API. One schema. Cleaned, normalized. Search and filter across **[rotating word]**" — Altriviera 48px/57.6px/-0.96px, `#0d0d0d`.
  - Button group: primary green button (`.button`, `#3fe844` bg, black text, 18px/500 Inter) + secondary outline button "Explore the platform" (`.button.is-secondary`, transparent bg, `.5px` border, `#666` text).
- **Right column**: `.image-wrapper.border-left.z-index-1` (`.5px` left border) → `.lottie-wrapper` (bg `#fafafa`) containing a **Lottie SVG-rendered illustration** (`data-src` = hero JSON animation, `data-autoplay="0"`, `data-loop="0"` — see §7), sized 678×657/681 (near-square, fills column height).

### 5b. Logo section (`.logo-section`)
`.container-large.bottom-border` wrapping a horizontal row of grayscale partner/industry logos (Qualtrics, Yext, Home Depot("Home-Grey"), Talkwalker, Epicor, Bright, plus a generic "Logo-item" placeholder) each in a `.logo-item` block. Hover state: `.logo-item:hover` cross-fades a grayscale image to a colored version (`.image-auto.is-active { transition: opacity 300ms }`) and background-color transitions `300ms`; an `.arrow-link` fades/translates in on hover (`opacity 300ms, transform 300ms`).

### 5c. "You're making decisions on incomplete data foundations" section
H2 (48px Altriviera) + supporting illustrations (SVG assets `Crisis-Illustration.svg`, `Deals-Illustration.svg`, `Competitive-Illustration.svg`, `Compliance-Illustration.svg`, `Benefit-Illustration.svg` — confirmed present locally) laid out as benefit/problem cards.

### 5d. Benefits tabs section ("Get answers in seconds")
Webflow **native tabs widget** (`.tabs-benefits.w-tabs` → `.tabs-benefits-menu.w-tab-menu` (103px tall tab bar) → `.tabs-benefits-content.w-tab-content` (716px tall panel)). This is a standard click-to-switch tab component, not scroll-driven. Reproduce as a controlled React tab component (click sets active index, only active panel visible/mounted or `display:block` vs `none`).

### 5e. Industry use-case grid ("What global companies use Datashake for")
Grid of 8 industry icons with labels: Customer(.svg), Retail, Social, Pharmaceutical, Reputation, Finance, Marketing, Agencies — each icon is a dedicated locally-saved SVG (`695f76*` filenames, confirmed present).

### 5f. Testimonial carousel (unlabeled section before FAQ, top≈8542px)
4 testimonial "tabs" (`.testimonial-link`, one per person) that switch a shared `.tab-content` panel via click (jQuery handler in inline script #14 — **desktop only**, gated behind `window.matchMedia("(min-width: 992px)")`; on mobile all 4 are presumably stacked/visible or use a different pattern — confirm exact mobile fallback in Build if pixel parity on mobile testimonials matters):
```js
$(document).ready(function () {
  if (window.matchMedia("(min-width: 992px)").matches) {
    $(".testimonial-link").on("click", function () {
      $(".testimonial-link, .tab-content").removeClass("active")... // (add active to clicked + matching panel)
    });
  }
});
```
- 4 people: "Tech Lead" (Review Management Services) — blue/active by default; "Arkadiusz, Software Engineering Manager" — orange; "Founder & Product Lead" (Review Management) — purple; "Senior Technical Partner Manager" (Brand ...) — yellow.
- Each `.testimonial-link` tab pill: distinct pastel bg per variant (`--light-blue/orange/purple/yellow`), **but label text color is always `#2d62ff`** (see §3 note).
- Active tab content panel bg matches the active tab's pastel color (e.g. `#ebf2ff` for the default/blue "Tech Lead" testimonial), contains: large pull-quote (`.text-size-large.is-32px.text-color-blue`), a decorative background SVG (`Testimonial-Background.svg` / `-Orange-BG.svg` / `-Purple-BG.svg` / `-Yellow-BG.svg`, all confirmed present locally), and a name/title block (`.text-size-large` bold name + `.text-size-medium` title, both in the tab's accent color).
- CSS transitions confirmed: `.testimonial-link`, `.testimonial-link.active/.is-orange/.is-purple/.is-yellow` all use `transition: 0.8s` (implicitly `all`, unspecified property = default `all 0.8s ease`); `.tab-content` and its variants use `transition: height 0.8s, width 0.8s`.

### 5g. FAQ section ("Your questions, answered")
`.faq-container` (flex column, no gap) of `.faq-item` rows, each `.faq-question` (flex, grid `1fr 80px`, `.5px dashed` bottom border) + `.faq-icon` (80px wide, `.5px dashed` left border, centered +/− icon) + collapsible `.faq-answer` (padding `0 1.5rem`, `overflow:hidden`, animates `height` from `0`/`1px` to content's natural height on click — see §7 for measured timing). FAQ content sourced from an embedded `FAQPage` JSON-LD schema block (4+ Q&A pairs visible in source, e.g. "What types of data does Datashake collect?", "How is Datashake different from other social listening tools?").

### 5h. Final CTA ("Book a call with one of our data experts")
Simple centered CTA block, transparent/inherited section background, single primary button.

### 5i. Footer (`.footer-section`)
Transparent background (inherits page white), link color `#2d62ff`. Two-column link structure confirmed live: one column is mostly CTA ("Book a demo"), the other is a long flat list mixing solution links (Customer Experience Tools, Social Listening, Reputation & Review Management, Marketing Automation, Retail, Pharmaceutical, Finance, Agencies), product links (Platform, Enterprise, Why Datashake, Status), and company/legal links (About, Blog, Book a Demo, Contact, Terms of Service, Privacy Policy) — likely organized into more visual sub-columns/headings than the flat DOM text-content dump shows; **Build should re-inspect the live footer DOM headings directly (screenshot) if exact column groupings matter**, since the automated extraction returned link text without reliably captured `<h4>`-style column headers for the second column.

---

## 6. Navigation bar

Structure: `.nav_menu.w-nav-menu` (`display:flex; gap:20px`) containing:
1. `.flex-h.is-menu` — 4 dropdown triggers (`.dropdown.w-dropdown` → `.dropdown-toggle` text + hidden `.dropdown-list` panel, `bg: #dddddd` outer / `#fafafa` inner container, `padding:10px`):
   - **Product** → Platform ("Explore Datashake"), Enterprise ("Built for scale and compliance"), Why Datashake ("See why teams choose us")
   - **Solutions** → Customer Experience Tools, Retail, Social Listening, Pharmaceutical, Reputation & Review Management, Finance, Marketing Automation, Agencies (each with a one-line description sub-text)
   - **Resources** → Blog, Dashboard template library, "2026 Social Data Coverage Report", Datasets
   - **Company** → About, Contact
2. `.button-group.is-mobile` — "Login" (`.button.is-secondary`, links to the live dashboard sign-in page) + "Book a call" (`.button.is-secondary` black variant, links to `/demo`).

Nav link hover: `.nav_menu_link` is Inter 500, `letter-spacing:-0.6px`, default color `#666`, `transition: color .3s`, hovers/active (`.w--current`) to `#0d0d0d`.

Logo: `693864b3bf7cdd4a83615647_Datashake-logo.svg` (confirmed present locally).

**Mobile nav (<991px, measured live at 390px):** hamburger button `.nav_button.w-nav-button` toggles `.nav_menu` from `display:none` to `display:block` with `transition: all, transform 0.4s` (slide/fade panel), and a `.w-nav-overlay` full-height scrim element is inserted (`fs-scrolldisable-element="preserve"` — page scroll is locked while menu is open, via the `scrolldisable.js` script already present locally). Mobile CTA row uses a `.mobile-32px` sizing modifier on the "Book a call" button.

---

## 7. Motion (the actual, verified behavior — not assumed GSAP/ScrollTrigger reveals)

**Ground truth check performed live:** `window.gsap` and `window.ScrollTrigger` both exist (loaded from `cdn.prod.website-files.com/gsap/3.15.0/...` per Network tab, plus a redundant `cdnjs.cloudflare.com/.../gsap/3.11.3/gsap.min.js` also loads), and `gsap.registerPlugin(ScrollTrigger)` runs — but calling `ScrollTrigger.getAll()` on the live, fully-scrolled, fully-loaded page returns **an empty array (0 triggers)**. There is no scroll-scrubbed animation, no fade/slide-up-on-scroll reveal, and no pinning anywhere on this page today. **Do not implement ScrollTrigger reveal animations in the clone** — it would not match the source, however tempting given the library imports suggest it.

What *does* animate, confirmed by direct interaction/inspection:

1. **Hero rotating-word carousel** (`.rotate-absolute` / `.rotate-list` / `.rotate-item`) — a GSAP `timeline` (confirmed inline script, uses `gsap.timeline({ repeat: -1 })` and `gsap.set`), infinite loop, cycles through 8 words: "customer conversations", "social media", "review sites", "app stores", "forums", "e-commerce platforms", "ratings directories", "150+ sources" (then repeats — the list is duplicated in the DOM for a seamless loop-back).
   - Each step: `tl.to(track, { y: -(index+1) * itemHeight, duration: 1, ease: "expo.inOut", delay: 1 })` — i.e. **1s hold on each word implied by the `delay:1` before the next `.to()` fires**, animated over **1s with `expo.inOut` easing**, moving the whole list up by one item's height (`translateY`).
   - `itemHeight` is responsive: 53px desktop (>768px), 48px tablet landscape / 38px tablet portrait (≤768px), 36px at ≤480px (measured via the source's own `getItemHeight()` breakpoints, matching the layout breakpoints in §1 closely but not identically — uses `window.innerWidth <= 480/768` checks, and an `isLandscape` check via `width > height`).
   - On window resize (debounced 250ms), the timeline is killed and rebuilt with the new item height.
   - This exact word list appears to be the rotating clause after "Search and filter across" in the hero H1 (confirmed the words are customer/data-source nouns matching that sentence).

2. **Typed.js hero sub-headline** (`.typed-words`, inside `.type-text`) — uses `typed.min.js` with:
   ```js
   new Typed(".typed-words", {
     strings: ["Real-time crisis detection system", "Competitive intelligence dashboard", "Customer sentiment tracker", "Trend forecasting engine", "Brand health m[onitor?]", ...]
   });
   ```
   Standard Typed.js type/delete/retype loop through that string list (default Typed.js timing — the full options object wasn't fully captured; Build should use Typed.js defaults — ~40ms/char type speed, ~2000ms back-delay — unless a live re-check of the options object is done, since the saved inline script was truncated in this pass at ~680 chars).

3. **Lottie illustrations** — 8 distinct Lottie JSON animations rendered as inline SVG (`data-renderer="svg"`), one per illustration slot (hero, "problem" section, "solution" section, plus more found via network requests: `970 01 BGa2`, `970 27`, `970 02`, `970 04`, `970 15 BGs`, `970 16`, `970 17`, `970 18`). All have `data-autoplay="0"` and `data-loop="0"` in the DOM attributes, and a small inline script explicitly **pauses Lottie players at start and only plays them after page load** (`document.addEventListener('DOMContentLoaded', ...) // pause then start`). **These do not autoplay/loop continuously** — they appear to play once (or be manually driven) rather than loop. **None of the 8 Lottie JSON files are saved locally** — Build must fetch them fresh from:
   - `https://cdn.prod.website-files.com/69385e16d68663814109c132/696a8c18bb5e32c024ab3933_970%2001%20BGa2.json` (hero)
   - `https://cdn.prod.website-files.com/69385e16d68663814109c132/696e2008c36915c99df29c73_970%2027.json` (problem section)
   - `https://cdn.prod.website-files.com/69385e16d68663814109c132/6979d00e00698ff2f4735b37_970%2002.json` (solution section)
   - `https://cdn.prod.website-files.com/69385e16d68663814109c132/6979cfb36d4b9fc339404334_970%2004.json`
   - `https://cdn.prod.website-files.com/69385e16d68663814109c132/696a41dafd8cb083ec1b61f7_970%2015%20BGs.json`
   - `https://cdn.prod.website-files.com/69385e16d68663814109c132/696e2148e3ed09dbc4bf5caa_970%2016.json`
   - `https://cdn.prod.website-files.com/69385e16d68663814109c132/696e2223dc911cd0de7ccf2e_970%2017.json`
   - `https://cdn.prod.website-files.com/69385e16d68663814109c132/696e22ebe10c2764a91943b4_970%2018.json`
   - (See asset manifest file for the full de-duplicated list with suggested local filenames.)

4. **FAQ accordion** — click-to-expand, Webflow-native (IX2) interaction, not custom JS. Measured live: closed `.faq-answer` computed `height: 1px`; immediately after click (150ms later) mid-transition height was `~62px`; settled (1s later) at the content's natural height (`121px` for that item). Opacity stays `1` throughout (only height animates, no fade). No explicit CSS `transition` property was found directly on `.faq-answer` in the stylesheet (the animation is driven by Webflow's IX2 JS setting inline `height` styles across animation frames) — treat this as a standard **height auto-expand accordion, ~400–500ms, ease-out** (Webflow IX2 default timing) in the rebuild; exact IX2 duration/easing constants are stored in a Webflow-internal JSON blob not present in the saved static HTML export, so this is the closest measurable approximation. Icon (+/−) presumably rotates/swaps on open — not conclusively captured; a simple 200ms rotate or icon-swap is a safe-enough default.

5. **Nav dropdown menus** (Product/Solutions/Resources/Company) — standard Webflow dropdown `w-dropdown`, appears on hover/click, background `#fafafa` inner panel on `#dddddd` outer, `padding:10px`, `.dropdown-item:hover { transition: background-color 0.3s }`.

6. **Mobile nav panel** — `.nav_menu` toggles `display:none → display:block`, `transition: all, transform 0.4s` (slide-style reveal); background scroll is locked (`fs-scrolldisable-element`) while open.

7. **Logo marquee hover swap** (§5b) — `opacity 300ms` cross-fade grayscale→color, `background-color 300ms`, arrow icon `opacity 300ms, transform 300ms`.

8. **Testimonial tab switch** (§5f) — `0.8s` transition on tab pill state + `.tab-content` `height 0.8s, width 0.8s` — no easing function was specified in the stylesheet (defaults to `ease`).

9. **`prefers-reduced-motion` fallback: none exists.** Grepped both the saved stylesheet and inline `<style>`/`<script>` blocks for `prefers-reduced-motion` — zero matches. The original site does not reduce or disable any of the above motion for users with that OS preference. (Recommendation for Build, optional and not required for parity: consider adding a reduced-motion guard around the GSAP word-carousel and Typed.js loop as a11y improvement, since the source site doesn't bother — flag this as a deliberate deviation if implemented, not a parity requirement.)

10. **CSS transition inventory (global, all confirmed via computed stylesheet walk):**
    - `.nav_menu_link` → `color 0.3s`
    - `.footer-link` → `color 0.2s`
    - `.testimonial-link*` → `0.8s` (all-property default)
    - `.tab-content*` → `height 0.8s, width 0.8s`
    - `.dropdown-item` → `background-color 0.3s`
    - `.logo-item` / `.logo-item .image-auto.is-active` / `.logo-item .arrow-link` → `300ms` (bg/opacity/transform respectively)
    - `.w-slider-dot` → `background-color 0.1s, color 0.1s` (present in base CSS, not observed in use on this page's actual content)
    - `.w-lightbox-control` → `0.3s` (present in base CSS, no lightbox observed in use on this page)

---

## 8. Third-party / non-brand widgets (present but likely out of scope for "pixel-perfect clone of the design" — flag to product owner)

- A **WhatsApp chat bubble** widget is injected client-side via inline script (fixed bottom-right, `#25D366` circular button, white label tooltip with dismiss ×, fades in over `0.5s ease`). This is a marketing/business tool, not part of the Datashake visual design system — confirm with stakeholders whether to include it.
- **HubSpot form** embed scripts (`hs-form-island-...`) and **Cookiebot** consent scripts are present; these are backend/compliance integrations, not layout-relevant, and can be omitted or stubbed unless the clone needs working forms.
- **GTM / Plausible analytics** — omit unless analytics parity is required.

---

## 9. Assets

See companion file `CLONE_SPEC_ASSETS.md` (in this same directory) for the full de-duplicated asset manifest: which of the 95 `<img>` assets are already downloaded locally (all 95 are — confirmed 0 missing), which of the 8 Lottie JSON animation files are missing and need fresh download (all 8 are missing), and the 3 missing font `.woff2` files (Inter-Regular, Inter-Medium, Altriviera-Regular) that also need fresh download from Webflow's CDN.

Key local asset folder: `/Users/riyaghosh/V2 cloned/datashake/Social & Review Data Infrastructure _ Datashake_files/` — contains all SVG/WebP illustration and icon assets referenced in §5, plus the two Webflow CSS files (`datashake-staging.webflow.69385e18d68663814109c1d2.4ed07c329.opt.css` = page-specific styles, `datashake-staging.webflow.shared.da4fed70c.css` = shared/reset styles + `@font-face` declarations) that were the primary source for the CSS values in this spec, and the GSAP/ScrollTrigger/jQuery/Typed.js/Webflow runtime JS bundles (all present, though as established in §7 ScrollTrigger is unused at runtime).

---

## 10. Known gaps / things this spec could not measure

- Exact Typed.js configuration options (typing speed, back-delay, cursor character) beyond the `strings` array — the inline script was long and only the `strings` array was reliably captured in this pass; re-extract the full `new Typed(...)` options object if exact typing cadence matters for parity.
- Exact Webflow IX2 accordion timing constants (duration/easing) for the FAQ open/close — Webflow stores these in an internal interactions JSON that isn't present in this static export; the `~400–500ms ease-out` recommendation in §7.4 is a reasonable, commonly-observed Webflow IX2 default, not a directly measured constant.
- Precise footer column-heading grouping (which links are visually grouped under which sub-heading) — the automated text-content walk returned a flat link list without reliably capturing intermediate heading elements for the second footer column; a manual screenshot comparison of the footer is recommended before Build finalizes that section.
- Any content gated behind login/auth (e.g. actual dashboard product screenshots beyond what's shown marketing-side) — not applicable to this page as far as could be determined; nothing on this route appeared to require authentication.
