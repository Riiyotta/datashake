# Changelog

## 1.0.1

- Resolved the open question on the navbar brand-mark hover spin. It is real on live: Playwright rAF
  sampling at 1440px on 2026-09-24 recorded 28 rotated frames from 33ms to 484ms, and the clone matched
  (28 frames, 29-479ms). It was missing from the saved export because Webflow IX2 applies it at runtime.
- Added motion pattern `nav-logo-spin` (360deg, 500ms ease) to `shell.navbar` only, citing
  `src/components/Navbar.jsx:224` and the new `liveMeasurements` entry in `extraction/measured-values.json`.
  The navbar reducedMotionFallback now also covers the spin. The open question was removed.
- Scoped every "no rotation" statement to the logo-strip tiles (proof.logo-grid, the logo-hover-crossfade
  pattern, and the citation claim). The two facts stay distinct: the navbar mark spins, the strip tiles do not.
- verify_all.py: `live:<id>` references must resolve to dated liveMeasurements entries.
- adversarial_test.py: added a control (navbar with nav-logo-spin passes) and rejections (an invented
  'logo-rotate-360' pattern on the logo strip, and nav-logo-spin applied to the logo strip). 50 expectations.
- Counts: motion patterns 16 -> 17. repositoryVersion 1.0.1 (documentation-only); allowlistVersion unchanged.

## 1.0.0 (initial build, from scratch)

Situation A: no design-repo existed. An earlier `compatibility/graph.json` found in this
location was deleted externally and described a different project (pages that do not exist
here). None of it was reused.

- Tokens: 164 `$value` tokens across 18 files (foundation / semantic / component / layout /
  theme / llm). Every value is cited in `extraction/measured-values.json`. Radius has one value (0).
  There are no shadows. Declared-but-unused values (red, #dddddd, the 70rem narrow container)
  are excluded and listed in `token-policy.json`.
- 7 primitives, 12 components, 15 section contracts (14 distinct section components + the
  LinesDivider), each with a content schema, maxWords (the real observed count x1.25), constraints,
  a closed motion pattern list with a prescriptive reducedMotionFallback, structured responsive
  fields for 4 breakpoints, tokensUsed and citations.
- 1 template (`template.home-landing`) with 24 explicit slots, matching the single real route `/`.
- `compatibility/graph.json`: 20 rules (17 error, 3 warn). Each is checked against the
  template's own slot list by verify_all.py.
- Draft-07 PageSpec schema with closed enums everywhere, a closed motion object, per-section
  content, variant and motion branches, and a closed 8-value assetRole enum.
- `semantic_validate.py`: cross-references the declared template (sequence match keyed on
  `(section, variant)`), plus positional, rhythm, pairing, motion, maxWords, asset-licensing and
  testimonial-attribution rules.
- `adversarial_test.py`: 46 expectations (5 controls, including a generic schema-driven control
  synthesized from the template's own slot list, both full and minimal).
- `verify_all.py`: 12 check groups, including allowlist parity, citation bounds plus quote check,
  counts recompute, allowlistVersion, entryPoints containment and graph/validator parity.
- Found during the build: the shared `cta.label` maxWords was inflated to 12 because the hero
  announcement pill reused the CTA definition. The pill now has its own field, and the CTA budget is 7
  (observed 5). The adversarial case that exposed it is kept.
