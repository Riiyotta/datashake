# Datashake marketing site (single-page), as rebuilt in this project's src/

Source: Datashake marketing site (single-page), as rebuilt in this project's src/
Status: **measured-from-clone** · production approved: **false**
1 routes · 1 templates · 15 unique sections

> Generated from `ia.json` by `build.mjs`. Edit the JSON, not this file.

## Shape of the site

The largest 1 template (Home (single-page marketing site)) accounts for 1 of 1 routes (100%). The remaining 0 routes span 0 templates.

| template | routes | share |
|---|---:|---:|
| Home (single-page marketing site) | 1 | 100% |

## Page chrome

**1 routes carry chrome = `full`** — Home (single-page marketing site).

## Sections by reuse

How widely a section is shared determines whether it belongs in a shared
component library or stays local to its page.

| section | category | templates | routes | implementation | scope |
|---|---|---:|---:|---|---|
| `shell.navbar` | SHELL | 1 | 1 | `src/components/Navbar.jsx` | Present on the only route, /. |
| `hero.home` | HERO | 1 | 1 | `src/components/Hero.jsx` | Present on the only route, /, directly after the navbar. |
| `proof.logo-strip` | PROOF | 1 | 1 | `src/components/LogoSection.jsx` | Present on the only route, /, directly after the hero. |
| `layout.lines-divider` | LAYOUT | 1 | 1 | `src/components/ui.jsx > LinesDivider` | Used only on /, where it repeats 10 times between content sections; never adjacent to itself and never after the footer. |
| `value.problem` | VALUE | 1 | 1 | `src/components/ProblemSection.jsx` | Present on the only route, /. |
| `value.solution` | VALUE | 1 | 1 | `src/components/SolutionSection.jsx` | Present on the only route, /, immediately after value.problem. |
| `features.build-ideas` | FEATURES | 1 | 1 | `src/components/BuildSection.jsx` | Present on the only route, /. |
| `features.reliable-infrastructure` | FEATURES | 1 | 1 | `src/components/ReliableSection.jsx` | Present on the only route, /. |
| `features.benefits-tabs` | FEATURES | 1 | 1 | `src/components/BenefitsTabs.jsx` | Present on the only route, /. |
| `conversion.free-trial` | CONVERSION | 1 | 1 | `src/components/FreeTrialSection.jsx` | Present on the only route, /. |
| `features.use-case-grid` | FEATURES | 1 | 1 | `src/components/IndustriesSection.jsx` | Present on the only route, /. |
| `proof.testimonials` | PROOF | 1 | 1 | `src/components/Testimonials.jsx` | Present on the only route, /. |
| `support.faq` | SUPPORT | 1 | 1 | `src/components/Faq.jsx` | Present on the only route, /. |
| `conversion.book-call` | CONVERSION | 1 | 1 | `src/components/FinalCta.jsx` | Present on the only route, /, as the last content block before the footer (separated by one divider). |
| `shell.footer` | SHELL | 1 | 1 | `src/components/Footer.jsx` | Present on the only route, /, as the final block. |

**0 shared sections** appear in more than one template and belong in a component library.

**15 single-use sections** appear in exactly one template. Building these
as "reusable" components up front would be speculative — keep them page-local
until a second caller actually appears.

## Templates

### Home (single-page marketing site) — `template.home`

1 route · `/` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | page-local |
| 2 | HERO | `hero.home` | page-local |
| 3 | PROOF | `proof.logo-strip` | page-local |
| 4 | LAYOUT | `layout.lines-divider` | page-local |
| 5 | VALUE | `value.problem` | page-local |
| 6 | VALUE | `value.solution` | page-local |
| 7 | LAYOUT | `layout.lines-divider` | page-local |
| 8 | FEATURES | `features.build-ideas` | page-local |
| 9 | LAYOUT | `layout.lines-divider` | page-local |
| 10 | FEATURES | `features.reliable-infrastructure` | page-local |
| 11 | LAYOUT | `layout.lines-divider` | page-local |
| 12 | FEATURES | `features.benefits-tabs` | page-local |
| 13 | LAYOUT | `layout.lines-divider` | page-local |
| 14 | CONVERSION | `conversion.free-trial` | page-local |
| 15 | LAYOUT | `layout.lines-divider` | page-local |
| 16 | FEATURES | `features.use-case-grid` | page-local |
| 17 | LAYOUT | `layout.lines-divider` | page-local |
| 18 | PROOF | `proof.testimonials` | page-local |
| 19 | LAYOUT | `layout.lines-divider` | page-local |
| 20 | SUPPORT | `support.faq` | page-local |
| 21 | LAYOUT | `layout.lines-divider` | page-local |
| 22 | CONVERSION | `conversion.book-call` | page-local |
| 23 | LAYOUT | `layout.lines-divider` | page-local |
| 24 | SHELL | `shell.footer` | page-local |

## Section reference

### SHELL

_Site-wide chrome: top navigation and footer._

**`shell.navbar`** — Top navigation: Datashake logo, four hover dropdowns (Product, Solutions, Resources, Company; Solutions carries the eight industry icons), Login and Book a call buttons; collapses to a hamburger with a scroll-locked slide-down menu at 991px and below.

· Present on the only route, /. · appears on 1 routes · implemented by `src/components/Navbar.jsx`

**`shell.footer`** — Footer: newsletter area (HubSpot form in the original, a reserved-height placeholder in the clone), four link columns (Solutions, Product, Company, Legal), copyright line, a p5 bar-canvas background and its own built-in trailing lines divider.

· Present on the only route, /, as the final block. · appears on 1 routes · implemented by `src/components/Footer.jsx`

### HERO

_Page-opening, above-the-fold block._

**`hero.home`** — Two-column hero: coverage-report eyebrow pill, H1 ending in a vertically rotating data-source word (GSAP timeline), Book a demo and Explore the platform buttons on the left; scroll-scrubbed hero Lottie illustration on the right.

· Present on the only route, /, directly after the navbar. · appears on 1 routes · implemented by `src/components/Hero.jsx`

### PROOF

_Third-party social proof: customer logos and named testimonials._

**`proof.logo-strip`** — Six-cell customer-logo row (Qualtrics, Yext, The Home Depot, Brightlocal, Epicor, Talkwalker) under a one-line caption; each cell links to an industry page and on hover swaps grey logo for colour, fills the cell and slides in an arrow.

· Present on the only route, /, directly after the hero. · appears on 1 routes · implemented by `src/components/LogoSection.jsx`

**`proof.testimonials`** — Four named customer testimonials, each with its own pastel colour and background SVG: on desktop (992px and up) vertical tab strips expand the chosen quote with a 0.8s width transition; below that, all four quotes stack.

· Present on the only route, /. · appears on 1 routes · implemented by `src/components/Testimonials.jsx`

### VALUE

_Problem/solution narrative framing why the product exists._

**`value.problem`** — Problem statement block ('You're making decisions on incomplete data foundations') with a scroll-scrubbed problem Lottie, framed by vertical side-strip columns.

· Present on the only route, /. · appears on 1 routes · implemented by `src/components/ProblemSection.jsx`

**`value.solution`** — Solution statement block ('Get the most complete data to power your insights') with a scroll-scrubbed solution Lottie and a See Datashake in action button, framed by side-strip columns; it directly follows the problem block with no divider between them.

· Present on the only route, /, immediately after value.problem. · appears on 1 routes · implemented by `src/components/SolutionSection.jsx`

### FEATURES

_Product capability and use-case explanation modules._

**`features.build-ideas`** — Centred 'What would you build...' heading with a Typed.js line cycling through example products, over an interactive p5 bar-canvas background (bars grow near the pointer).

· Present on the only route, /. · appears on 1 routes · implemented by `src/components/BuildSection.jsx`

**`features.reliable-infrastructure`** — Infrastructure pitch ('Your most reliable source of social & review data at scale') with supporting copy, a Book a demo button and the one-shot 970-04 Lottie.

· Present on the only route, /. · appears on 1 routes · implemented by `src/components/ReliableSection.jsx`

**`features.benefits-tabs`** — Sticky four-tab benefits module (Speed, Depth, Coverage, Relevance): each pane has its own title, copy and looping Lottie; tabs auto-advance every 8s with a progress bar, and the tab strip scrolls horizontally on mobile.

· Present on the only route, /. · appears on 1 routes · implemented by `src/components/BenefitsTabs.jsx`

**`features.use-case-grid`** — 'What global companies use Datashake for' grid of 9 illustrated use-case cards (crisis monitoring, trend detection, competitive analysis, regulatory compliance and others) under a 'Power Your Data' eyebrow and a Book a demo button. Not an industry icon grid.

· Present on the only route, /. · appears on 1 routes · implemented by `src/components/IndustriesSection.jsx`

### CONVERSION

_Blocks whose primary job is a sign-up, trial or booking action._

**`conversion.free-trial`** — Dark-green free benchmark trial card: green 'Free Benchmark Trial' eyebrow, a small centred white heading, a four-point dashed checklist and a CTA over a green squares background pattern.

· Present on the only route, /. · appears on 1 routes · implemented by `src/components/FreeTrialSection.jsx`

**`conversion.book-call`** — Closing centred CTA band ('Book a call with one of our data experts') with a single primary button over the CTA-Background image.

· Present on the only route, /, as the last content block before the footer (separated by one divider). · appears on 1 routes · implemented by `src/components/FinalCta.jsx`

### SUPPORT

_Objection handling and reference content (FAQ)._

**`support.faq`** — 'Your questions, answered' accordion of 14 question/answer pairs with dashed hairline rows and a plus icon that rotates to 45 degrees when open.

· Present on the only route, /. · appears on 1 routes · implemented by `src/components/Faq.jsx`

### LAYOUT

_Purely structural, content-free separators between sections._

**`layout.lines-divider`** — Content-free horizontal band of decorative line artwork (Line-Divider / Divider-Horizontal SVGs) that separates two content sections inside the bordered page container.

· Used only on /, where it repeats 10 times between content sections; never adjacent to itself and never after the footer. · appears on 1 routes · implemented by `src/components/ui.jsx > LinesDivider`
