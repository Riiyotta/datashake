#!/usr/bin/env python3
"""
Adversarial suite for the Datashake design-repo.

For every rule the schema and semantic validator enforce, build a mutated
PageSpec that MUST be rejected and prove it is, asserting the specific layer
(schema) or rule id (semantic) that catches it. Controls must pass with ZERO
errors: the unmodified example, a new-page variant of it, and two GENERIC
controls synthesized for every template from that template's own slot list
(full sequence + minimal required backbone), with content synthesized from
the schema itself. A validator that rejects everything is as broken as one
that rejects nothing.

All fixtures are in memory: nothing is written inside the repo.
Path portability: repo root derived from __file__.

Usage: python3 schema/tests/adversarial_test.py     (exit 0 = every expectation held)
"""
import copy
import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.dont_write_bytecode = True  # never leave __pycache__ inside the shipped repo
sys.path.insert(0, os.path.join(REPO_ROOT, "schema"))

from jsonschema import Draft7Validator  # noqa: E402
from semantic_validate import Ctx, load, validate_spec, DIVIDER  # noqa: E402

CTX = Ctx()
SCHEMA = CTX.schema
EXAMPLE = load("schema/example.pagespec.json")
V = Draft7Validator(SCHEMA)
results = []


def record(name, ok, detail=""):
    results.append((name, ok))
    print(f"[{'PASS' if ok else 'FAIL'}] {name}" + ("" if ok else f"  -- {detail}"))


def schema_errs(spec):
    return list(V.iter_errors(spec))


def sem(spec):
    errs, warns, fired = validate_spec(spec, CTX, include_schema=False)
    return errs, warns, fired


def idx(spec, section):
    return next(i for i, n in enumerate(spec["nodes"]) if n["section"] == section)


# ---------------------------------------------------------------------------
# Generic synthesis (schema-driven, template-driven)
# ---------------------------------------------------------------------------
def resolve(s):
    while isinstance(s, dict) and "$ref" in s:
        s = CTX.defs[s["$ref"].split("/")[-1]]
    return s


def synth(s):
    s = resolve(s)
    if "allOf" in s and "#/definitions/media" in [x.get("$ref") for x in s["allOf"]]:
        role = next(x["properties"]["assetRole"]["enum"][0] for x in s["allOf"] if "properties" in x)
        return {"assetRole": role, "assetRef": CTX.roles[role]["knownAssets"][0], "alt": "Alt"}
    if "const" in s:
        return s["const"]
    if "enum" in s:
        return s["enum"][0]
    t = s.get("type")
    if t == "object":
        return {k: synth(s["properties"][k]) for k in s.get("required", [])}
    if t == "array":
        return [synth(s["items"]) for _ in range(max(1, s.get("minItems", 1)))]
    if t == "string":
        if "pattern" in s:
            return next(c for c in ["#", "/x", "public/x"] if re.match(s["pattern"], c))
        return "Lorem"
    raise ValueError(f"cannot synthesize {s}")


def node_for(slot):
    c = CTX.contracts[slot["section"]]
    return {"section": slot["section"], "variant": slot["variant"],
            "content": synth(CTX.defs["content_" + slot["section"].replace(".", "-")]),
            "motion": {"patterns": c["motion"]["allowedPatterns"], "reducedMotionFallback": c["motion"]["reducedMotionFallback"], "fallbackSource": "prescriptive-design-repo-policy"}}


def spec_for(tpl, slots):
    return {"pageSpecVersion": SCHEMA["properties"]["pageSpecVersion"]["const"], "template": tpl["id"], "route": tpl["routes"][0],
            "contentProvenance": "source-reproduction", "sourceContentNotice": SCHEMA["properties"]["sourceContentNotice"]["const"],
            "nodes": [node_for(s) for s in slots]}


def minimal_slots(tpl):
    """Required slots only, plus exactly the divider slots the rhythm rule demands
    (taken from the template's own divider slots). Fails loudly if the template
    cannot supply one, which would mean the graph contradicts templates.json."""
    exc = {tuple(p) for p in CTX.rules["DIVIDER_BETWEEN_BANDS"]["exceptions"]}
    slots = tpl["nodes"]
    req = [i for i, s in enumerate(slots) if s["required"]]
    out = [slots[req[0]]]
    for a, b in zip(req, req[1:]):
        if (slots[a]["section"], slots[b]["section"]) not in exc:
            d = next(i for i in range(a + 1, b) if slots[i]["section"] == DIVIDER)
            out.append(slots[d])
        out.append(slots[b])
    return out


# ---------------------------------------------------------------------------
# CONTROLS (must be 0 errors)
# ---------------------------------------------------------------------------
e = schema_errs(EXAMPLE)
record("CONTROL example passes draft-07 schema", not e, str([x.message for x in e[:3]]))
errs, warns, _ = sem(EXAMPLE)
record("CONTROL example passes semantic validator (0 errors, 0 warnings)", not errs and not warns, str(errs + warns))

for tpl in CTX.templates.values():
    for label, slots in [("full slot sequence", tpl["nodes"]), ("minimal required backbone", minimal_slots(tpl))]:
        g = spec_for(tpl, slots)
        e = schema_errs(g)
        errs, warns, _ = sem(g)
        record(f"CONTROL generic {tpl['id']} [{label}, {len(slots)} nodes] passes schema + semantic", not e and not errs,
               str([x.message for x in e[:3]] + errs))

# New-page control: licensing-correct derivative of the example (proves the policy rules accept correct new pages).
NEW = copy.deepcopy(EXAMPLE)
NEW["contentProvenance"] = "new-page"
NEW["route"] = "/review-data-landing"
del NEW["sourceContentNotice"]


def neutralize(v):
    if isinstance(v, dict):
        if "assetRole" in v:
            gen = CTX.roles[v["assetRole"]]["generation"]
            if gen == "must-not-fabricate":
                v["assetRef"] = "placeholder:" + v["assetRole"]
        for k in list(v):
            if k == "href":
                v[k] = "#"
            else:
                neutralize(v[k])
    elif isinstance(v, list):
        for x in v:
            neutralize(x)


neutralize(NEW["nodes"])
t = NEW["nodes"][idx(NEW, "proof.testimonials")]["content"]["items"]
for j, it in enumerate(t):
    it.update({"name": f"Customer {j + 1}", "role": "Role pending consent", "quote": "Approved customer quote pending written consent.", "attributionType": "placeholder-pending-consent"})
b = idx(NEW, "interactive.build-typed")
del NEW["nodes"][b - 1:b + 1]  # drop an optional section together with ONE of its dividers
e = schema_errs(NEW)
errs, warns, _ = sem(NEW)
record("CONTROL new-page derivative (placeholders, consent-pending testimonials, optional section dropped) passes", not e and not errs and not warns,
       str([x.message for x in e[:3]] + errs + warns))


# ---------------------------------------------------------------------------
# REJECTIONS
# ---------------------------------------------------------------------------
def mut(fn, base=None):
    m = copy.deepcopy(base or EXAMPLE)
    fn(m)
    return m


def expect_schema(name, m):
    e = schema_errs(m)
    record(f"REJECT [schema] {name}", len(e) > 0, "schema accepted it")


def expect_rule(name, m, rule, schema_must_pass=True):
    e = schema_errs(m)
    errs, warns, fired = sem(m)
    ok = rule in fired and any(x.startswith(f"[{rule}]") for x in errs)
    if schema_must_pass and e:
        ok = False
    record(f"REJECT [{rule}] {name}", ok, f"fired={sorted(fired)} schemaErrors={len(e)}")


H = lambda m: m["nodes"][idx(m, "hero.api-search")]  # noqa: E731

# --- schema layer ---
expect_schema("wrong enum: template 'template.pricing'", mut(lambda m: m.__setitem__("template", "template.pricing")))
expect_schema("wrong enum: divider variant 'horizontal-10rem' (section-internal, not page-level)", mut(lambda m: m["nodes"][3].__setitem__("variant", "horizontal-10rem")))
expect_schema("missing required field 'route'", mut(lambda m: m.pop("route")))
expect_schema("missing required node field 'motion'", mut(lambda m: m["nodes"][2].pop("motion")))
expect_schema("invented section type 'proof.logo-marquee'", mut(lambda m: m["nodes"][2].__setitem__("section", "proof.logo-marquee")))
expect_schema("missing motion.reducedMotionFallback", mut(lambda m: H(m)["motion"].pop("reducedMotionFallback")))
expect_schema("invented motion field 'scrollReveal' (motion is additionalProperties:false)", mut(lambda m: H(m)["motion"].__setitem__("scrollReveal", "fade-up")))
expect_schema("invented motion pattern 'scroll-reveal'", mut(lambda m: H(m)["motion"].__setitem__("patterns", ["scroll-reveal"])))
expect_schema("real pattern on the wrong section (faq-accordion on hero)", mut(lambda m: H(m)["motion"].__setitem__("patterns", ["faq-accordion"])))
expect_schema("invented assetRole 'person-photo'", mut(lambda m: H(m)["content"]["poster"].__setitem__("assetRole", "person-photo")))
expect_schema("real assetRole not allowed for field (ui-icon as customer logo)", mut(lambda m: m["nodes"][2]["content"]["logos"][0]["logo"].__setitem__("assetRole", "ui-icon")))
expect_schema("invented content field on hero", mut(lambda m: H(m)["content"].__setitem__("badge", "New")))
expect_schema("sourceContentNotice missing on a source reproduction", mut(lambda m: m.pop("sourceContentNotice")))

# --- nav-logo spin pair (the spin is real on the navbar brand mark only; logo-strip tiles never rotate) ---
NAVSPIN = mut(lambda m: m["nodes"][0]["motion"].__setitem__("patterns", ["nav-logo-spin"]))
e = schema_errs(NAVSPIN)
errs, warns, _ = sem(NAVSPIN)
record("CONTROL navbar with the measured nav-logo-spin pattern passes schema + semantic", not e and not errs and not warns, str([x.message for x in e[:3]] + errs + warns))
expect_schema("invented rotate pattern 'logo-rotate-360' on the logo strip", mut(lambda m: m["nodes"][2]["motion"].__setitem__("patterns", ["logo-rotate-360"])))
expect_schema("navbar-only nav-logo-spin applied to the logo strip", mut(lambda m: m["nodes"][2]["motion"].__setitem__("patterns", ["nav-logo-spin"])))
errs, _, fired = sem(mut(lambda m: m["nodes"][2]["motion"].__setitem__("patterns", ["nav-logo-spin"])))
record("REJECT [MOTION_PATTERN_ALLOWED] nav-logo-spin on the logo strip also caught semantically", "MOTION_PATTERN_ALLOWED" in fired, str(errs))

# --- same failures seen by the semantic layer too (defence in depth) ---
errs, _, fired = sem(mut(lambda m: H(m)["motion"].pop("reducedMotionFallback")))
record("REJECT [REDUCED_MOTION_FALLBACK_REQUIRED] missing fallback also caught semantically", "REDUCED_MOTION_FALLBACK_REQUIRED" in fired, str(errs))
errs, _, fired = sem(mut(lambda m: H(m)["content"]["poster"].__setitem__("assetRole", "person-photo")))
record("REJECT [ASSET_ROLE_POLICY] invented assetRole also caught semantically", "ASSET_ROLE_POLICY" in fired, str(errs))
errs, _, fired = sem(mut(lambda m: H(m)["motion"].__setitem__("patterns", ["faq-accordion"])))
record("REJECT [MOTION_PATTERN_ALLOWED] wrong-section pattern also caught semantically", "MOTION_PATTERN_ALLOWED" in fired, str(errs))

# --- structural ---
def dup_faq(m):
    i = idx(m, "content.faq")
    m["nodes"][i + 1:i + 1] = [copy.deepcopy(m["nodes"][i - 1]), copy.deepcopy(m["nodes"][i])]


expect_rule("duplicate onePerPage section (content.faq twice, divider-separated)", mut(dup_faq), "ONE_PER_PAGE")
expect_rule("removed required section (cta.final + its divider)", mut(lambda m: m["nodes"].__delitem__(slice(idx(m, "cta.final") - 1, idx(m, "cta.final") + 1))), "TEMPLATE_SEQUENCE_MATCH")
expect_rule("removed required section (hero)", mut(lambda m: m["nodes"].pop(idx(m, "hero.api-search"))), "TEMPLATE_SEQUENCE_MATCH")


def footer_first(m):
    f = m["nodes"].pop(idx(m, "shell.footer"))
    m["nodes"].insert(0, f)


def navbar_last(m):
    n = m["nodes"].pop(idx(m, "shell.navbar"))
    m["nodes"].append(n)


expect_rule("reordered footer to the front", mut(footer_first), "MUST_START_WITH_NAVBAR")
expect_rule("reordered footer to the front", mut(footer_first), "MUST_END_WITH_FOOTER")
expect_rule("reordered navbar to the end", mut(navbar_last), "MUST_END_WITH_FOOTER")


def swap_faq_testimonials(m):
    a, b = idx(m, "proof.testimonials"), idx(m, "content.faq")
    m["nodes"][a], m["nodes"][b] = m["nodes"][b], m["nodes"][a]


expect_rule("template/node-sequence mismatch (faq and testimonials swapped)", mut(swap_faq_testimonials), "TEMPLATE_SEQUENCE_MATCH")
expect_rule("two LinesDividers adjacent (build removed, both dividers kept)", mut(lambda m: m["nodes"].pop(idx(m, "interactive.build-typed"))), "NO_ADJACENT_DIVIDERS")
expect_rule("divider inserted inside the named no-divider pair problem->solution", mut(lambda m: m["nodes"].insert(idx(m, "narrative.solution"), copy.deepcopy(m["nodes"][3]))), "DIVIDER_BETWEEN_BANDS")
expect_rule("divider inserted between navbar and hero", mut(lambda m: m["nodes"].insert(1, copy.deepcopy(m["nodes"][3]))), "DIVIDER_BETWEEN_BANDS")
expect_rule("problem without its solution", mut(lambda m: m["nodes"].pop(idx(m, "narrative.solution"))), "PROBLEM_SOLUTION_PAIR")


def two_heroes(m):
    m["nodes"].insert(2, copy.deepcopy(H(m)))


expect_rule("second hero", mut(two_heroes), "ONE_HERO")
expect_rule("route not a real route of the template", mut(lambda m: m.__setitem__("route", "/pricing")), "ROUTE_TEMPLATE_BINDING")

# --- runtime maxWords on real fields ---
expect_rule("maxWords overflow on hero.subheading (40 words)", mut(lambda m: H(m)["content"].__setitem__("subheading", " ".join(["data"] * 40))), "MAX_WORDS")
expect_rule("maxWords overflow on nested content.faq items[0].answer", mut(lambda m: m["nodes"][idx(m, "content.faq")]["content"]["items"][0].__setitem__("answer", " ".join(["data"] * 90))), "MAX_WORDS")
expect_rule("maxWords overflow on shared cta.label", mut(lambda m: H(m)["content"]["primaryCta"].__setitem__("label", "Book a demo with our friendly data experts today now")), "MAX_WORDS")

# --- licensing / asset-role policy ---
expect_rule("new page claims the real route '/'", mut(lambda m: m.__setitem__("route", "/"), NEW), "ROUTE_TEMPLATE_BINDING")
expect_rule("new page reuses a real customer logo", mut(lambda m: m["nodes"][2]["content"]["logos"][0]["logo"].__setitem__("assetRef", EXAMPLE["nodes"][2]["content"]["logos"][0]["logo"]["assetRef"]), NEW), "ASSET_ROLE_POLICY")
expect_rule("new page reuses the proprietary hero Lottie", mut(lambda m: H(m)["content"]["illustration"].__setitem__("assetRef", "public/lottie/hero.json"), NEW), "ASSET_ROLE_POLICY")
expect_rule("new page generates an imitation use-case illustration", mut(lambda m: m["nodes"][idx(m, "features.industries-grid")]["content"]["cards"][0]["image"].__setitem__("assetRef", "generate:crisis dashboard"), NEW), "ASSET_ROLE_POLICY")
expect_rule("brand logo (must-reuse-exact) replaced by a generated one", mut(lambda m: m["nodes"][0]["content"]["brand"].__setitem__("assetRef", "generate:datashake-like mark")), "ASSET_ROLE_POLICY")
expect_rule("source reproduction swaps in a generated ui-icon", mut(lambda m: m["nodes"][idx(m, "narrative.solution")]["content"]["stats"][0]["icon"].__setitem__("assetRef", "generate:uptime icon")), "ASSET_ROLE_POLICY")


def real_testimonial_on_new(m):
    m["nodes"][idx(m, "proof.testimonials")]["content"]["items"][1] = copy.deepcopy(EXAMPLE["nodes"][idx(EXAMPLE, "proof.testimonials")]["content"]["items"][1])
    m["nodes"][idx(m, "proof.testimonials")]["content"]["items"][1]["attributionType"] = "placeholder-pending-consent"


expect_rule("new page reuses a real person's name + quote ('Arkadiusz')", mut(real_testimonial_on_new, NEW), "TESTIMONIAL_ATTRIBUTION_POLICY")
expect_rule("new page marks a testimonial as source-verbatim", mut(lambda m: m["nodes"][idx(m, "proof.testimonials")]["content"]["items"][0].__setitem__("attributionType", "source-verbatim"), NEW), "TESTIMONIAL_ATTRIBUTION_POLICY")

# warn-severity rule must warn (not error)
_, warns, fired = sem(mut(lambda m: m["nodes"][idx(m, "cta.final")]["content"]["cta"].__setitem__("href", "https://www.datashake.com/demo"), NEW))
record("WARN [REAL_COMPANY_LINKS] new page linking to datashake.com is flagged as a warning", "REAL_COMPANY_LINKS" in fired and any("REAL_COMPANY_LINKS" in w for w in warns), str(warns))

# ---------------------------------------------------------------------------
passed = sum(ok for _, ok in results)
print(f"\n{passed}/{len(results)} expectations held.")
if passed != len(results):
    print("FAILED:")
    for n, ok in results:
        if not ok:
            print("  - " + n)
    sys.exit(1)
print("All mutations rejected by the expected layer/rule; all controls passed with 0 errors.")
sys.exit(0)
