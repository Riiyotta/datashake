# Datashake design-repo

An AI-ready, machine-validated design system extracted from the Datashake clone
(React 18.3.1 + react-dom 18.3.1, Vite 5.4.21, Tailwind 3.4.19; runtime gsap 3.15.0,
lottie-web 5.13.0, typed.js 2.1.0, p5 1.9.0: cite:stack-react, cite:stack-react-dom,
cite:stack-vite, cite:stack-tailwind, cite:stack-gsap, cite:stack-lottie, cite:stack-typed,
cite:stack-p5, declared ranges in cite:stack-declared). The clone reproduces the real, live
Datashake marketing site.

**Status:** `design-review-pending`, `productionApproved: false`.

## This is a single-page source

The source has **exactly one route, `/`**. There is no router (cite:single-route,
cite:spec-single-route), so there is exactly **one real page shape and one template**
(`template.home-landing`). Route coverage is 1 route to 1 template. No other routes or
templates were invented. New pages generated from this repo reuse that one shape
(`contentProvenance: "new-page"` plus a new route) and may drop optional slots within the rules.

## Counts (recomputed from disk by `extraction/verify_all.py` on every run)

| | |
|---|---|
| tokens (`$value` leaves in 00/10/20/30 layers) | 164 |
| token files | 18 |
| primitives | 7 |
| components | 12 |
| sections (14 distinct section components + the LinesDivider) | 15 |
| templates | 1 |
| routes | 1 |
| template slots (14 sections + 10 page-level dividers) | 24 |
| assetRoles (closed enum) | 8 |
| motion patterns (closed vocabulary) | 17 |
| citations | 163 |

## Page shape (src/App.jsx, cite:app-section-order)

`shell.navbar`, `hero.api-search`, `proof.logo-grid`, D, `narrative.problem`,
`narrative.solution` (no divider in between: cite:app-no-divider-problem-solution), D,
`interactive.build-typed`, D, `features.reliable`, D, `features.benefits-tabs`, D,
`cta.free-trial`, D, `features.industries-grid`, D, `proof.testimonials`, D, `content.faq`,
D, `cta.final`, D, `shell.footer`, where D = `shell.lines-divider` variant `base` (10
instances). The footer draws its own trailing divider internally (cite:footer-trailing-divider),
so that divider is not a slot. The divider section also has two section-internal variants
(`horizontal-10rem`, `horizontal-3rem`) that are rejected as page nodes. All structural rules
key on `(section, variant)`.

Required slots (the backbone a generated page must keep; this is policy): navbar, hero,
cta.final, footer. Every other slot is optional, in order, subject to `compatibility/graph.json`.
For example, removing a section means removing one of its dividers too (`NO_ADJACENT_DIVIDERS`).

## Layout

```
tokens/00-foundation  color, typography, radius, spacing, breakpoint, border, elevation, motion (+ closed pattern vocabulary)
tokens/10-semantic    color, typography roles (aliases of foundation)
tokens/20-component   button, divider, card
tokens/30-layout      grid (container, gutters, section padding, side rails)
tokens/themes         light.json: every semantic token resolved (the only theme; the source has no dark mode)
tokens/llm            component-allowlist.json, token-catalog.json, token-policy.json
primitives/ components/ sections/     typed contracts (sections carry content schema, maxWords, constraints, motion, structured responsive fields, citations)
templates/templates.json              one template, 24 explicit slot objects
compatibility/graph.json              20 rules with severity; the validator reads them at runtime
schema/                               pagespec.schema.json (draft-07), example.pagespec.json, semantic_validate.py, tests/adversarial_test.py
extraction/                           measured-values.json (citation ledger), verify_all.py
```

## How to validate

```
python3 extraction/verify_all.py              # 12 check groups; exit 0 = pass
python3 schema/semantic_validate.py schema/example.pagespec.json
python3 schema/tests/adversarial_test.py      # every mutation rejected, every control passes
```

Requires Python 3 and `jsonschema` (tested with 4.25.1). Every script derives the repo
root from its own location, so the folder works when copied anywhere. Citation bounds, quote
and asset-existence checks need the sibling source project (the parent folder). When the
folder is standalone, they degrade to warnings.

## Real-company and licensing rules (compliance, not style)

Datashake is a real, live company. The source contains:

- **real third-party logos**: Qualtrics, Yext, The Home Depot, BrightLocal, Epicor and
  Talkwalker (cite:logos-data, cite:html-brightlocal). This is BrightLocal, not "Bright Data".
- **real testimonials** attributed to real people and roles, e.g. "Arkadiusz, Software Engineering
  Manager" (cite:testimonials-items). There are no person photos, and no photo role exists.
- **a paid, licensed heading font**, Altriviera (cite:idx-altriviera-face, cite:assets-altriviera).
  Never embed or redistribute it; fall back to Arial.
- **a HubSpot newsletter form**, replaced in the clone by a reserved-height placeholder
  (cite:footer-hubspot). The footer's `newsletterSlot` is const `reserved-placeholder`.
- **links to real datashake.com URLs** throughout. A new page linking there raises the
  `REAL_COMPANY_LINKS` warning.

The example PageSpec is a `source-reproduction` that uses real copy for fidelity. It carries a
required `sourceContentNotice`: **source content, not licensed for reuse in new pages.**

### assetRole policy (closed enum; wired through schema, allowlist, example and validator)

| role | policy | on a new page |
|---|---|---|
| brand-logo | must-reuse-exact | exact Datashake file only |
| social-icon | must-reuse-exact | exact platform marks only |
| ui-icon | may-generate-new | known asset or `generate:<desc>` in house style |
| decorative-pattern | may-generate-new | known asset or `generate:<desc>` from palette |
| customer-logo | must-not-fabricate | `placeholder:customer-logo` (rights-cleared asset later) |
| product-screenshot | must-not-fabricate | `placeholder:product-screenshot` |
| product-lottie | must-not-fabricate | `placeholder:product-lottie` |
| use-case-illustration | must-not-fabricate | `placeholder:use-case-illustration` |

A new page must never generate or reproduce real logos, real people's names, quotes or photos,
or proprietary Datashake illustrations or Lotties. `TESTIMONIAL_ATTRIBUTION_POLICY` rejects
reuse of any real source name or quote on a new page.

## Motion

GSAP and ScrollTrigger load on live but register **zero** triggers, so there are no
scroll-reveal effects (cite:spec-no-scrolltrigger). What does move: the hero word rotator,
Typed.js, Lottie scroll scrubs, the play-once and loop Lotties, the 8s auto-advancing tabs, the FAQ
accordion, dropdowns, the hamburger, the mobile menu, testimonial switching, the navbar brand-mark
360deg hover spin (500ms ease, measured on live: live:nav-logo-spin), logo-strip tile hover
(bg, cross-fade and arrow only; the strip tiles never rotate) and the p5 bar field. Each is a closed pattern in
`tokens/00-foundation/motion.json`. The motion object is `additionalProperties: false`.

The original has **no** prefers-reduced-motion handling (cite:spec-no-reduced-motion). Every
node still requires `reducedMotionFallback`, labelled `fallbackSource:
"prescriptive-design-repo-policy"`. These fallbacks are design-repo policy, not measured
source behaviour.

## CLONE_SPEC claims superseded or found wrong (cited in extraction/measured-values.json)

- Body Inter comes from Google's variable Inter, not the Webflow files (cite:spec-wrong-inter vs cite:idx-inter-gf).
- Testimonial labels use per-card accent colours, not #2d62ff (cite:spec-wrong-testimonial-color).
- Nav dropdown labels are Inter 400, not 500 (cite:spec-wrong-nav-weight).
- Typed.js options are in the saved HTML: 45/25/400/250 (cite:spec-wrong-typed).
- FAQ timing is 250ms easeIn open and 150ms easeIn close, not "~400-500ms ease-out" (cite:spec-wrong-faq). There are exactly 14 items (cite:spec-imprecise-faq-count).
- Lotties are IX2 scroll scrubs, play-once or loop, not "play once on load" (cite:spec-wrong-lottie, cite:assets-wrong-play-once).
- The rotator shows 7 words; the first DOM item is hidden (cite:spec-wrong-words).
- The illustrations attributed to the Problem section belong to Industries (cite:spec-wrong-problem-cards).
- Industries is 9 illustrated cards, not an 8-icon grid; those icons are the nav Solutions dropdown's (cite:spec-wrong-industry-icons).
- Footer links are #666 in 4 headed columns (cite:spec-wrong-footer).
- The final CTA band is #ecfdec with an image, not transparent (cite:spec-wrong-finalcta).
- The dropdown outer background is transparent #ddd0 (cite:spec-wrong-dropdown-bg).
- The "Bright" logo is BrightLocal, not Bright Data (cite:assets-wrong-bright).

## Not grounded in a project file

See `extraction/measured-values.json#unmeasured`. In short:
- The ~66/33 ms-per-char Typed cadence is a live session measurement. The configured options are cited.
- All reduced-motion fallbacks, the maxWords 1.25x headroom and the required/optional slot split are policy.
- The navbar brand-mark spin is not in the saved export (Webflow applies it at runtime). It is grounded in
  src (cite:nav-brand-rotate-src) plus a dated live measurement (`liveMeasurements` in measured-values.json).

## Versions

`allowlistVersion` is **machine-checked**: verify_all.py fails if the manifest and the allowlist
disagree. `repositoryVersion` and `pageSpecVersion` are **documentation-only**, and nothing enforces them
beyond the schema's `pageSpecVersion` const. This repo is a snapshot of the source project; re-diff
versions and claims if the source changes.

## Packaging

`design-repo.zip` (a sibling of this folder) is a **build artifact**. It is regenerated fresh and
last with the CLI `zip` tool (excluding `.DS_Store` and `__MACOSX`) after every change. The source
project is not a git repo. If it is ever put under version control, **add `design-repo.zip` to
`.gitignore`** so a stale copy is never committed next to the live folder.
