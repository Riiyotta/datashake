#!/usr/bin/env python3
"""
Semantic validator for a Datashake design-repo PageSpec.

Enforces everything JSON Schema (pagespec.schema.json) cannot express. Every
rule id below is declared in compatibility/graph.json, and this script reads
each rule's severity, exceptions and parameters from that file at runtime, so
the graph's prose and this enforcement cannot silently diverge.
extraction/verify_all.py checks the rule-id sets match in both directions.

  TEMPLATE_KNOWN / ROUTE_TEMPLATE_BINDING
  TEMPLATE_SEQUENCE_MATCH   nodes[] are cross-referenced against the DECLARED
                            template's real slot list, keyed on (section, variant)
  ONE_PER_PAGE              keyed on (section, variant)
  MUST_START_WITH_NAVBAR / MUST_END_WITH_FOOTER / HERO_FOLLOWS_NAVBAR /
  FINAL_CTA_LAST_BEFORE_FOOTER / NO_ADJACENT_DIVIDERS
                            generic: driven by each section contract's constraints
  ONE_HERO, DIVIDER_BETWEEN_BANDS, PROBLEM_SOLUTION_PAIR,
  NO_ADJACENT_SAME_CATEGORY (warn), CONTINUOUS_MOTION_NOT_ADJACENT (warn)
  REDUCED_MOTION_FALLBACK_REQUIRED, MOTION_PATTERN_ALLOWED
  MAX_WORDS                 per-instance word counts against sections/*.json
  ASSET_ROLE_POLICY, TESTIMONIAL_ATTRIBUTION_POLICY, REAL_COMPANY_LINKS (warn)

Path portability: the repo root is derived from this file's location.

Usage:  python3 schema/semantic_validate.py <pagespec.json> [--quiet] [--no-schema]
Exit 0 when there are no errors (warnings never fail the run).
"""
import json
import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIVIDER = "shell.lines-divider"


def load(rel):
    with open(os.path.join(REPO_ROOT, rel), encoding="utf-8") as f:
        return json.load(f)


def word_count(s):
    return len(s.split()) if isinstance(s, str) else 0


class Ctx:
    """Everything the rules need, loaded once from the repo's own files."""

    def __init__(self):
        self.schema = load("schema/pagespec.schema.json")
        self.defs = self.schema["definitions"]
        self.templates = {t["id"]: t for t in load("templates/templates.json")["templates"]}
        self.graph = load("compatibility/graph.json")
        self.rules = {r["id"]: r for r in self.graph["rules"]}
        self.categories = self.graph["sectionCategories"]
        self.allowlist = load("tokens/llm/component-allowlist.json")
        self.roles = self.allowlist["assetRoles"]
        self.contracts = {}
        for fname in sorted(os.listdir(os.path.join(REPO_ROOT, "sections"))):
            if fname.endswith(".json"):
                c = load("sections/" + fname)
                self.contracts[c["nodeSection"]] = c


class Report:
    def __init__(self, ctx):
        self.ctx = ctx
        self.errors = []
        self.warnings = []
        self.fired = set()

    def add(self, rule_id, msg):
        rule = self.ctx.rules.get(rule_id)
        if rule is None:  # a rule used in code but missing from the graph is itself a failure
            self.errors.append(f"[UNDECLARED_RULE:{rule_id}] {msg}")
            return
        self.fired.add(rule_id)
        (self.errors if rule["severity"] == "error" else self.warnings).append(f"[{rule_id}] {msg}")


# Rule ids this script implements. verify_all.py asserts this == graph rule ids.
IMPLEMENTED_RULES = {
    "TEMPLATE_KNOWN", "ROUTE_TEMPLATE_BINDING", "TEMPLATE_SEQUENCE_MATCH", "ONE_PER_PAGE",
    "MUST_START_WITH_NAVBAR", "MUST_END_WITH_FOOTER", "HERO_FOLLOWS_NAVBAR", "FINAL_CTA_LAST_BEFORE_FOOTER",
    "NO_ADJACENT_DIVIDERS", "ONE_HERO", "DIVIDER_BETWEEN_BANDS", "PROBLEM_SOLUTION_PAIR",
    "NO_ADJACENT_SAME_CATEGORY", "CONTINUOUS_MOTION_NOT_ADJACENT", "REDUCED_MOTION_FALLBACK_REQUIRED",
    "MOTION_PATTERN_ALLOWED", "MAX_WORDS", "ASSET_ROLE_POLICY", "TESTIMONIAL_ATTRIBUTION_POLICY", "REAL_COMPANY_LINKS",
}


def key(node):
    return (node.get("section"), node.get("variant"))


# ---------------------------------------------------------------------------
# Structural rules (shared with verify_all.py, which runs them on every
# template's own slot list so every graph rule is checked against templates.json)
# ---------------------------------------------------------------------------
def sequence_match(seq, slots):
    """True if seq (list of (section, variant)) is an in-order match of slots:
    each node consumes exactly one slot with an equal key; optional slots may be skipped."""
    memo = {}

    def m(i, j):
        if (i, j) in memo:
            return memo[(i, j)]
        if i == len(seq):
            r = all(not s["required"] for s in slots[j:])
        elif j == len(slots):
            r = False
        else:
            s = slots[j]
            r = (not s["required"] and m(i, j + 1)) or ((s["section"], s["variant"]) == seq[i] and m(i + 1, j + 1))
        memo[(i, j)] = r
        return r

    return m(0, 0)


def check_structure(nodes, template_id, ctx, rep):
    seq = [key(n) for n in nodes]
    secs = [k[0] for k in seq]
    tpl = ctx.templates.get(template_id)

    # --- TEMPLATE_SEQUENCE_MATCH: cross-reference the DECLARED template ---
    if tpl is not None:
        slots = tpl["nodes"]
        slot_keys = {(s["section"], s["variant"]) for s in slots}
        for i, k in enumerate(seq):
            if k not in slot_keys:
                rep.add("TEMPLATE_SEQUENCE_MATCH", f"nodes[{i}] {k} is not a slot of template '{template_id}'")
        for s in slots:
            if s["required"] and (s["section"], s["variant"]) not in seq:
                rep.add("TEMPLATE_SEQUENCE_MATCH", f"required slot {s['slot']} ({s['section']}, {s['variant']}) of template '{template_id}' is missing")
        if all(k in slot_keys for k in seq) and not sequence_match(seq, slots):
            rep.add("TEMPLATE_SEQUENCE_MATCH", f"node order does not match template '{template_id}' slot order {[s['section'] for s in slots]}")

    # --- ONE_PER_PAGE keyed on (section, variant) ---
    counts = {}
    for k in seq:
        counts[k] = counts.get(k, 0) + 1
    for k, n in counts.items():
        c = ctx.contracts.get(k[0])
        if c and c["constraints"].get("onePerPage") and n > 1:
            rep.add("ONE_PER_PAGE", f"{k} appears {n} times but its contract sets onePerPage")

    # --- generic positional constraints, each rule names its section + constraint ---
    content_idx = [i for i, s in enumerate(secs) if s != DIVIDER]
    for rule in ctx.graph["rules"]:
        if rule["kind"] != "constraint" or "section" not in rule:
            continue
        sec, cons = rule["section"], rule["constraint"]
        c = ctx.contracts.get(sec)
        if c is None or not c["constraints"].get(cons):
            rep.add(rule["id"], f"graph rule references constraint '{cons}' that section '{sec}' does not declare")
            continue
        where = [i for i, s in enumerate(secs) if s == sec]
        if cons == "mustBeFirst":
            if secs and secs[0] != sec:
                rep.add(rule["id"], f"first node is '{secs[0]}', expected '{sec}'")
        elif cons == "mustBeLast":
            if secs and secs[-1] != sec:
                rep.add(rule["id"], f"last node is '{secs[-1]}', expected '{sec}'")
        elif cons == "mustFollowNav":
            for i in where:
                if i != 1 or secs[0] != "shell.navbar":
                    rep.add(rule["id"], f"'{sec}' is at nodes[{i}]; it must directly follow shell.navbar at nodes[1]")
        elif cons == "mustPrecedeFooter":
            if where and "shell.footer" in secs:
                f = secs.index("shell.footer")
                before = [i for i in content_idx if i < f]
                if not before or secs[before[-1]] != sec:
                    rep.add(rule["id"], f"last non-divider node before shell.footer must be '{sec}'")
        elif cons == "noConsecutive":
            for i in range(1, len(secs)):
                if secs[i] == sec and secs[i - 1] == sec:
                    rep.add(rule["id"], f"nodes[{i - 1}] and nodes[{i}] are adjacent '{sec}' with nothing between them")

    # --- ONE_HERO ---
    r = ctx.rules["ONE_HERO"]
    exempt = set(r.get("exceptions", []))
    heroes = [s for s in secs if ctx.categories.get(s) == r["category"]]
    if template_id not in exempt and len(heroes) > r["max"]:
        rep.add("ONE_HERO", f"{len(heroes)} {r['category']} nodes: {heroes}")

    # --- DIVIDER_BETWEEN_BANDS (with named exception pairs) ---
    exc = {tuple(p) for p in ctx.rules["DIVIDER_BETWEEN_BANDS"]["exceptions"]}
    if content_idx:
        if content_idx[0] != 0:
            rep.add("DIVIDER_BETWEEN_BANDS", "page starts with a divider")
        if content_idx[-1] != len(secs) - 1:
            rep.add("DIVIDER_BETWEEN_BANDS", "page ends with a divider")
    for a, b in zip(content_idx, content_idx[1:]):
        gap = b - a - 1
        pair = (secs[a], secs[b])
        if pair in exc and gap != 0:
            rep.add("DIVIDER_BETWEEN_BANDS", f"{pair} is a named no-divider pair but has {gap} divider(s) between")
        elif pair not in exc and gap != 1:
            rep.add("DIVIDER_BETWEEN_BANDS", f"{pair} needs exactly one divider between, found {gap}")

    # --- PROBLEM_SOLUTION_PAIR ---
    p, s = ctx.rules["PROBLEM_SOLUTION_PAIR"]["pair"]
    if (p in secs) != (s in secs):
        rep.add("PROBLEM_SOLUTION_PAIR", f"'{p}' and '{s}' must appear together (found only '{p if p in secs else s}')")
    elif p in secs and secs.index(s) != secs.index(p) + 1:
        rep.add("PROBLEM_SOLUTION_PAIR", f"'{s}' must immediately follow '{p}'")

    # --- NO_ADJACENT_SAME_CATEGORY (warn) ---
    cexc = {tuple(x) for x in ctx.rules["NO_ADJACENT_SAME_CATEGORY"]["exceptions"]}
    for a, b in zip(content_idx, content_idx[1:]):
        ca, cb = ctx.categories.get(secs[a]), ctx.categories.get(secs[b])
        if ca and ca == cb and (secs[a], secs[b]) not in cexc:
            rep.add("NO_ADJACENT_SAME_CATEGORY", f"'{secs[a]}' and '{secs[b]}' are both {ca} (no named exception)")

    # --- CONTINUOUS_MOTION_NOT_ADJACENT (warn) ---
    cont = set(ctx.rules["CONTINUOUS_MOTION_NOT_ADJACENT"]["patterns"])

    def pats(i):
        n = nodes[i]
        if isinstance(n.get("motion"), dict) and isinstance(n["motion"].get("patterns"), list):
            return set(n["motion"]["patterns"])
        c = ctx.contracts.get(secs[i])
        return set(c["motion"]["allowedPatterns"]) if c else set()

    for a, b in zip(content_idx, content_idx[1:]):
        if pats(a) & cont and pats(b) & cont:
            rep.add("CONTINUOUS_MOTION_NOT_ADJACENT", f"'{secs[a]}' and '{secs[b]}' both run continuous motion back-to-back")


# ---------------------------------------------------------------------------
# Content walker: maxWords + media (assetRole) fields, $ref-aware
# ---------------------------------------------------------------------------
def resolve(ctx, schema):
    while isinstance(schema, dict) and "$ref" in schema:
        schema = ctx.defs[schema["$ref"].split("/")[-1]]
    return schema


def walk(ctx, schema, value, path, visit):
    schema = resolve(ctx, schema)
    if not isinstance(schema, dict):
        return
    if "allOf" in schema:
        refs = [s.get("$ref", "") for s in schema["allOf"]]
        if "#/definitions/media" in refs:
            allowed = None
            for s in schema["allOf"]:
                e = s.get("properties", {}).get("assetRole", {}).get("enum")
                if e:
                    allowed = e
            visit("media", allowed, value, path)
            walk(ctx, ctx.defs["media"], value, path, visit)  # alt maxWords
            return
        for s in schema["allOf"]:
            walk(ctx, s, value, path, visit)
        return
    if "maxWords" in schema and isinstance(value, str):
        visit("text", schema["maxWords"], value, path)
    if schema.get("type") == "object" and isinstance(value, dict):
        for k, sub in schema.get("properties", {}).items():
            if k in value:
                walk(ctx, sub, value[k], f"{path}.{k}", visit)
    if schema.get("type") == "array" and isinstance(value, list):
        for i, v in enumerate(value):
            walk(ctx, schema.get("items", {}), v, f"{path}[{i}]", visit)


def iter_hrefs(value, path):
    if isinstance(value, dict):
        for k, v in value.items():
            if k == "href" and isinstance(v, str):
                yield f"{path}.{k}", v
            else:
                yield from iter_hrefs(v, f"{path}.{k}")
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from iter_hrefs(v, f"{path}[{i}]")


def check_nodes(spec, ctx, rep):
    prov = spec.get("contentProvenance")
    for i, node in enumerate(spec.get("nodes", []) or []):
        if not isinstance(node, dict):
            continue
        sec = node.get("section")
        pre = f"nodes[{i}] ({sec})"
        contract = ctx.contracts.get(sec)

        # --- motion ---
        motion = node.get("motion") if isinstance(node.get("motion"), dict) else {}
        fb = motion.get("reducedMotionFallback")
        if not isinstance(fb, str) or not fb.strip():
            rep.add("REDUCED_MOTION_FALLBACK_REQUIRED", f"{pre}: missing motion.reducedMotionFallback")
        pl = motion.get("patterns") if isinstance(motion.get("patterns"), list) else []
        if contract is not None:
            allowed = set(contract["motion"]["allowedPatterns"])
            bad = [p for p in pl if p not in allowed]
            if bad:
                rep.add("MOTION_PATTERN_ALLOWED", f"{pre}: pattern(s) {bad} not in contract allowedPatterns {sorted(allowed)}")
        if "none" in pl and len(pl) > 1:
            rep.add("MOTION_PATTERN_ALLOWED", f"{pre}: 'none' cannot be combined with other patterns")
        if contract is None:
            continue

        content = node.get("content") if isinstance(node.get("content"), dict) else {}

        def visit(kind, arg, value, path):
            if kind == "text":
                wc = word_count(value)
                if wc > arg:
                    rep.add("MAX_WORDS", f"{pre}{path}: {wc} words exceeds maxWords {arg}")
            elif kind == "media":
                if not isinstance(value, dict):
                    return
                role, ref = value.get("assetRole"), value.get("assetRef", "")
                if role not in ctx.roles:
                    rep.add("ASSET_ROLE_POLICY", f"{pre}{path}: assetRole '{role}' is not in the closed allowlist {sorted(ctx.roles)}")
                    return
                if arg is not None and role not in arg:
                    rep.add("ASSET_ROLE_POLICY", f"{pre}{path}: assetRole '{role}' not allowed for this field (allowed {arg})")
                gen = ctx.roles[role]["generation"]
                known = set(ctx.roles[role]["knownAssets"])
                if gen == "must-reuse-exact" and ref not in known:
                    rep.add("ASSET_ROLE_POLICY", f"{pre}{path}: role '{role}' is must-reuse-exact; '{ref}' is not a known asset")
                elif gen == "may-generate-new":
                    if prov == "source-reproduction" and ref not in known:
                        rep.add("ASSET_ROLE_POLICY", f"{pre}{path}: source-reproduction must reference the real asset, got '{ref}'")
                    elif prov == "new-page" and ref not in known and not ref.startswith("generate:"):
                        rep.add("ASSET_ROLE_POLICY", f"{pre}{path}: '{ref}' must be a known asset or 'generate:<description>'")
                elif gen == "must-not-fabricate":
                    if prov == "source-reproduction" and ref not in known:
                        rep.add("ASSET_ROLE_POLICY", f"{pre}{path}: role '{role}' must reference the exact real asset on a source reproduction, got '{ref}'")
                    elif prov == "new-page" and not ref.startswith("placeholder:"):
                        rep.add("ASSET_ROLE_POLICY", f"{pre}{path}: role '{role}' is must-not-fabricate; a new page must use 'placeholder:{role}', got '{ref}'")

        walk(ctx, contract["content"], content, "", visit)

        # --- testimonials licensing ---
        if sec == "proof.testimonials":
            src = contract.get("sourceRecords", [])
            names = {r["name"].strip().lower() for r in src}
            quotes = {" ".join(r["quote"].lower().split()) for r in src}
            for j, it in enumerate(content.get("items", []) or []):
                if not isinstance(it, dict):
                    continue
                at = it.get("attributionType")
                if prov == "source-reproduction" and at != "source-verbatim":
                    rep.add("TESTIMONIAL_ATTRIBUTION_POLICY", f"{pre}.items[{j}]: source reproduction must be 'source-verbatim'")
                if prov == "new-page":
                    if at != "placeholder-pending-consent":
                        rep.add("TESTIMONIAL_ATTRIBUTION_POLICY", f"{pre}.items[{j}]: new page must use 'placeholder-pending-consent', got '{at}'")
                    if str(it.get("name", "")).strip().lower() in names:
                        rep.add("TESTIMONIAL_ATTRIBUTION_POLICY", f"{pre}.items[{j}]: reuses a real source attribution '{it.get('name')}'")
                    if " ".join(str(it.get("quote", "")).lower().split()) in quotes:
                        rep.add("TESTIMONIAL_ATTRIBUTION_POLICY", f"{pre}.items[{j}]: reuses a real source quote verbatim")

        if prov == "new-page":
            for path, href in iter_hrefs(content, ""):
                if re.search(r"(^|\.|//)datashake\.com", href):
                    rep.add("REAL_COMPANY_LINKS", f"{pre}{path}: links to the real company ({href})")


def check_binding(spec, ctx, rep):
    tid = spec.get("template")
    tpl = ctx.templates.get(tid)
    if tpl is None:
        rep.add("TEMPLATE_KNOWN", f"unknown template '{tid}'")
        return
    route, prov = spec.get("route"), spec.get("contentProvenance")
    if prov == "new-page":
        if route in tpl["routes"]:
            rep.add("ROUTE_TEMPLATE_BINDING", f"new-page PageSpec may not claim the real route '{route}'")
        elif not isinstance(route, str) or not re.match(tpl["newPageRoutePattern"], route):
            rep.add("ROUTE_TEMPLATE_BINDING", f"route '{route}' does not match newPageRoutePattern")
    elif route not in tpl["routes"]:
        rep.add("ROUTE_TEMPLATE_BINDING", f"route '{route}' is not one of template '{tid}' real routes {tpl['routes']}")


def validate_spec(spec, ctx=None, include_schema=True):
    ctx = ctx or Ctx()
    rep = Report(ctx)
    schema_errors = []
    if include_schema:
        try:
            from jsonschema import Draft7Validator
            schema_errors = [f"[SCHEMA] {list(e.path)}: {e.message[:160]}" for e in Draft7Validator(ctx.schema).iter_errors(spec)]
        except ImportError:
            rep.warnings.append("[SCHEMA] jsonschema not installed; schema layer skipped")
    if not isinstance(spec, dict):
        return schema_errors + ["[SCHEMA] PageSpec is not an object"], rep.warnings, rep.fired
    check_binding(spec, ctx, rep)
    nodes = [n for n in (spec.get("nodes") or []) if isinstance(n, dict)]
    check_structure(nodes, spec.get("template"), ctx, rep)
    check_nodes(spec, ctx, rep)
    return schema_errors + rep.errors, rep.warnings, rep.fired


def validate(path, quiet=False, include_schema=True):
    with open(path, encoding="utf-8") as f:
        spec = json.load(f)
    errors, warnings, _ = validate_spec(spec, include_schema=include_schema)
    if not quiet:
        print(f"Validating {os.path.basename(path)}  template={spec.get('template')} route={spec.get('route')} provenance={spec.get('contentProvenance')}")
        for e in errors:
            print("  ERROR  " + e)
        for w in warnings:
            print("  WARN   " + w)
        print(f"  {len(errors)} error(s), {len(warnings)} warning(s)")
    return errors, warnings


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print("usage: semantic_validate.py <pagespec.json> [--quiet] [--no-schema]")
        sys.exit(2)
    errs, _ = validate(args[0], quiet="--quiet" in sys.argv, include_schema="--no-schema" not in sys.argv)
    sys.exit(1 if errs else 0)
