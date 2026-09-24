#!/usr/bin/env python3
"""
verify_all.py - the design-repo's own self-check, in one command.

  1  Draft-07 schema: the schema is itself valid and the example has 0 errors.
  2  Semantic validator: the example has 0 errors.
  3  Allowlist parity: allowlist ids <-> contract files on disk (no phantom, no
     orphan), allowlist sections <-> schema section enum, assetRole enum <->
     allowlist assetRoles, settable-property lists <-> schema.
  4  allowlistVersion: registry.manifest.json must equal the allowlist's own field.
  5  Citation validity: every cite:<id> used anywhere resolves to a ledger entry
     (and every live:<id> to a dated liveMeasurements entry);
     every ledger entry's file exists, its line range is within the real file,
     and its quote appears inside that range. knownAssets exist. Degrades to
     WARNINGS (never failures) when the sibling source project is absent.
  6  Manifest counts are recomputed from disk and compared.
  7  No absolute local home-directory paths anywhere in the repo.
  8  entryPoints: every entry is a real file INSIDE this repo, and every shipped
     file is listed.
  9  Token integrity: aliases, catalog refs, policy keys, tokensUsed, theme.
  10 Contract <-> schema parity (content fragments, variants, motion patterns).
  11 Graph <-> validator <-> templates: rule-id parity both ways; constraint
     rules match contract constraints; every graph rule holds on every
     template's own slot list (full + minimal backbone) with 0 errors/warnings;
     route coverage is 1:1.
  12 Structured responsive fields on every section contract.

Path portability: the repo root is derived from this file's own location.
Usage: python3 extraction/verify_all.py      (exit 0 = no failures)
"""
import json
import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.dont_write_bytecode = True  # never leave __pycache__ inside the shipped repo
sys.path.insert(0, os.path.join(REPO_ROOT, "schema"))

failures, warnings = [], []


def fail(m):
    failures.append(m)
    print("  FAIL  " + m)


def warn(m):
    warnings.append(m)
    print("  WARN  " + m)


def ok(m):
    print("  ok    " + m)


def load(rel):
    with open(os.path.join(REPO_ROOT, rel), encoding="utf-8") as f:
        return json.load(f)


def repo_files():
    out = []
    for d, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [x for x in dirs if x != "__pycache__" and not x.startswith(".")]
        for f in files:
            if f == ".DS_Store" or f.endswith(".pyc"):
                continue
            out.append(os.path.relpath(os.path.join(d, f), REPO_ROOT).replace(os.sep, "/"))
    return sorted(out)


schema = load("schema/pagespec.schema.json")
example = load("schema/example.pagespec.json")
allow = load("tokens/llm/component-allowlist.json")
manifest = load("registry.manifest.json")
templates = load("templates/templates.json")["templates"]
graph = load("compatibility/graph.json")
ledger = load("extraction/measured-values.json")
contracts = {load("sections/" + f)["nodeSection"]: load("sections/" + f) for f in sorted(os.listdir(os.path.join(REPO_ROOT, "sections"))) if f.endswith(".json")}

# ---------------------------------------------------------------------------
print("\n1. SCHEMA VALIDATION (draft-07)")
try:
    from jsonschema import Draft7Validator
    Draft7Validator.check_schema(schema)
    errs = list(Draft7Validator(schema).iter_errors(example))
    for e in errs:
        fail(f"example schema error {list(e.path)}: {e.message[:160]}")
    if not errs:
        ok("pagespec.schema.json is a valid draft-07 schema; example.pagespec.json validates with 0 errors")
except ImportError:
    fail("python package 'jsonschema' is required (pip install jsonschema)")

# ---------------------------------------------------------------------------
print("\n2. SEMANTIC VALIDATION OF THE EXAMPLE")
from semantic_validate import Ctx, IMPLEMENTED_RULES, Report, check_structure, validate_spec  # noqa: E402

CTX = Ctx()
e, w, _ = validate_spec(example, CTX, include_schema=False)
for x in e:
    fail("example semantic error " + x)
if not e:
    ok(f"example.pagespec.json: 0 semantic errors, {len(w)} warning(s)")

# ---------------------------------------------------------------------------
print("\n3. ALLOWLIST PARITY (drift-proofed)")
for group, dirname in [("primitives", "primitives"), ("components", "components"), ("sections", "sections")]:
    disk = {}
    for f in sorted(os.listdir(os.path.join(REPO_ROOT, dirname))):
        if f.endswith(".json"):
            disk[load(f"{dirname}/{f}")["id"]] = f"{dirname}/{f}"
    listed = allow.get(group, {})
    phantom = sorted(set(listed) - set(disk))
    orphan = sorted(set(disk) - set(listed))
    wrongfile = sorted(k for k in set(listed) & set(disk) if listed[k]["contractFile"] != disk[k])
    if phantom:
        fail(f"allowlist parity ({group}): phantom allowlist entr{'y' if len(phantom) == 1 else 'ies'} with no contract file: {phantom}")
    if orphan:
        fail(f"allowlist parity ({group}): orphan contract file(s) with no allowlist entry: {orphan}")
    if wrongfile:
        fail(f"allowlist parity ({group}): contractFile path mismatch: {wrongfile}")
    if not (phantom or orphan or wrongfile):
        ok(f"allowlist parity ({group}): {len(disk)} on disk, {len(listed)} listed, 0 phantom, 0 orphan")

sched_enum = set(schema["definitions"]["node"]["properties"]["section"]["enum"])
allow_nodes = {v["nodeSection"] for v in allow["sections"].values()}
if sched_enum != allow_nodes:
    fail(f"schema section enum != allowlist sections: {sorted(sched_enum ^ allow_nodes)}")
else:
    ok(f"schema section enum == allowlist sections ({len(sched_enum)})")
role_enum = schema["definitions"]["assetRole"]["enum"]
if set(role_enum) != set(allow["assetRoles"]):
    fail(f"assetRole enum (schema) != allowlist assetRoles: {sorted(set(role_enum) ^ set(allow['assetRoles']))}")
else:
    ok(f"closed assetRole enum == allowlist assetRoles ({len(role_enum)})")
for r, v in allow["assetRoles"].items():
    if v.get("generation") not in ("may-generate-new", "must-reuse-exact", "must-not-fabricate") or not v.get("guidance") or not v.get("licensing"):
        fail(f"assetRole '{r}' lacks generation/guidance/licensing")
used_roles = set(re.findall(r'"assetRole": "([^"]+)"', json.dumps(example, indent=1)))
if not used_roles <= set(role_enum):
    fail(f"example uses unregistered assetRoles {sorted(used_roles - set(role_enum))}")
else:
    ok(f"example wires {len(used_roles)} of {len(role_enum)} assetRoles through real media fields")
for label, listed, real in [("nodeSettableProperties", allow["nodeSettableProperties"], schema["definitions"]["node"]["properties"]),
                            ("motionSettableProperties", allow["motionSettableProperties"], schema["definitions"]["motion"]["properties"]),
                            ("pageSettableProperties", allow["pageSettableProperties"], schema["properties"])]:
    if set(listed) != set(real):
        fail(f"allowlist {label} != schema: {sorted(set(listed) ^ set(real))}")
    else:
        ok(f"allowlist {label} == schema ({len(listed)})")

# ---------------------------------------------------------------------------
print("\n4. ALLOWLIST VERSION (machine-checked)")
if manifest.get("allowlistVersion") != allow.get("allowlistVersion"):
    fail(f"allowlistVersion mismatch: manifest {manifest.get('allowlistVersion')!r} vs allowlist {allow.get('allowlistVersion')!r}")
else:
    ok(f"allowlistVersion {allow['allowlistVersion']} matches in manifest and allowlist")

# ---------------------------------------------------------------------------
print("\n5. CITATION VALIDITY (bounds + quote; degrades to warnings without the sibling source tree)")
cites = ledger["citations"]
ids = [c["id"] for c in cites]
dups = sorted({i for i in ids if ids.count(i) > 1})
if dups:
    fail(f"duplicate citation ids: {dups}")
used = {}
for rel in repo_files():
    if rel.endswith((".json", ".md")) and rel != "extraction/measured-values.json":
        with open(os.path.join(REPO_ROOT, rel), encoding="utf-8") as f:
            for cid in re.findall(r"cite:([a-z0-9-]+)", f.read()):
                used.setdefault(cid, rel)
with open(os.path.join(REPO_ROOT, "extraction/measured-values.json"), encoding="utf-8") as f:
    for cid in re.findall(r"cite:([a-z0-9-]+)", json.dumps(ledger.get("unmeasured", []))):
        used.setdefault(cid, "extraction/measured-values.json#unmeasured")
dangling = sorted(c for c in used if c not in set(ids))
if dangling:
    fail(f"{len(dangling)} dangling cite:<id> reference(s) with no ledger entry: {dangling[:10]}")
else:
    ok(f"{len(used)} distinct cite:<id> references all resolve to ledger entries")
live_ids = [x["id"] for x in ledger.get("liveMeasurements", [])]
live_used = set()
for rel in repo_files():
    if rel.endswith((".json", ".md")):
        with open(os.path.join(REPO_ROOT, rel), encoding="utf-8") as f:
            live_used |= set(re.findall(r"live:([a-z0-9-]+)", f.read()))
live_bad = sorted(live_used - set(live_ids))
if live_bad:
    fail(f"dangling live:<id> reference(s) with no liveMeasurements entry: {live_bad}")
else:
    ok(f"{len(live_used)} live:<id> reference(s) resolve to dated liveMeasurements entries ({len(live_ids)} recorded)")
for x in ledger.get("liveMeasurements", []):
    if not (x.get("date") and x.get("method") and x.get("live") and x.get("clone")):
        fail(f"liveMeasurements '{x.get('id')}' lacks date/method/live/clone values")
unused = sorted(set(ids) - set(used))
if unused:
    warn(f"{len(unused)} ledger entr(ies) not referenced by any contract/doc: {unused}")

SRC_ROOT = os.path.abspath(os.path.join(REPO_ROOT, ledger.get("sourceProjectRelativeToThisRepo", "..")))
sibling = os.path.isfile(os.path.join(SRC_ROOT, "src", "App.jsx")) and os.path.isfile(os.path.join(SRC_ROOT, "package.json"))
if not sibling:
    warn("sibling source project not found next to this repo -- citation bounds/quote and asset-existence checks skipped (expected for a standalone copy)")
else:
    checked = bad = 0
    for c in cites:
        target = os.path.join(SRC_ROOT, c["path"])
        if not os.path.isfile(target):
            fail(f"citation '{c['id']}': file not found: {c['path']}")
            bad += 1
            continue
        if c.get("lines") is None:
            checked += 1
            continue
        m = re.fullmatch(r"(\d+)(?:-(\d+))?", str(c["lines"]))
        if not m:
            fail(f"citation '{c['id']}': malformed line range {c['lines']!r}")
            bad += 1
            continue
        a, b = int(m.group(1)), int(m.group(2) or m.group(1))
        with open(target, encoding="utf-8", errors="replace") as f:
            lines = f.read().split("\n")
        n = len(lines) - (1 if lines and lines[-1] == "" else 0)
        if a < 1 or b < a or b > n:
            fail(f"citation '{c['id']}': range {c['lines']} exceeds real file length {n} of {c['path']}")
            bad += 1
            continue
        seg = " ".join(" ".join(lines[a - 1:b]).split())
        if c.get("quote") and " ".join(c["quote"].split()) not in seg:
            fail(f"citation '{c['id']}': quote {c['quote']!r} not found in {c['path']}:{c['lines']}")
            bad += 1
            continue
        checked += 1
    if not bad:
        ok(f"{checked}/{len(cites)} citations resolve: file exists, range in bounds, quote present in range")
    missing_assets = []
    for r, v in allow["assetRoles"].items():
        for ref in v["knownAssets"]:
            if ref.startswith("inline:"):
                p, _, name = ref[len("inline:"):].partition("#")
                fp = os.path.join(SRC_ROOT, p)
                if not os.path.isfile(fp) or f"export const {name} =" not in open(fp, encoding="utf-8").read():
                    missing_assets.append(ref)
            elif not os.path.isfile(os.path.join(SRC_ROOT, ref)):
                missing_assets.append(ref)
    total_assets = sum(len(v["knownAssets"]) for v in allow["assetRoles"].values())
    if missing_assets:
        fail(f"{len(missing_assets)} knownAssets missing from the source project: {missing_assets[:5]}")
    else:
        ok(f"all {total_assets} knownAssets exist in the source project")

# ---------------------------------------------------------------------------
print("\n6. MANIFEST COUNTS (recomputed from disk)")


def token_leaves(node):
    if isinstance(node, dict):
        if "$value" in node:
            return 1
        return sum(token_leaves(v) for v in node.values())
    return 0


tok_count = 0
for layer in ("00-foundation", "10-semantic", "20-component", "30-layout"):
    for f in os.listdir(os.path.join(REPO_ROOT, "tokens", layer)):
        if f.endswith(".json"):
            tok_count += token_leaves({k: v for k, v in load(f"tokens/{layer}/{f}").items() if k != "patterns"})
real_counts = {
    "tokens": tok_count,
    "tokenFiles": sum(1 for r in repo_files() if r.startswith("tokens/") and r.endswith(".json")),
    "primitives": len([f for f in os.listdir(os.path.join(REPO_ROOT, "primitives")) if f.endswith(".json")]),
    "components": len([f for f in os.listdir(os.path.join(REPO_ROOT, "components")) if f.endswith(".json")]),
    "sections": len([f for f in os.listdir(os.path.join(REPO_ROOT, "sections")) if f.endswith(".json")]),
    "templates": len(templates),
    "routes": sum(len(t["routes"]) for t in templates),
    "templateSlots": sum(len(t["nodes"]) for t in templates),
    "assetRoles": len(allow["assetRoles"]),
    "motionPatterns": len(load("tokens/00-foundation/motion.json")["patterns"]),
    "citations": len(cites),
}
claimed = manifest.get("counts", {})
for k, v in real_counts.items():
    if claimed.get(k) != v:
        fail(f"manifest counts.{k}: claimed {claimed.get(k)!r}, recomputed from disk {v}")
    else:
        ok(f"counts.{k} = {v}")
extra = sorted(set(claimed) - set(real_counts))
if extra:
    fail(f"manifest counts has keys nothing recomputes: {extra}")

# ---------------------------------------------------------------------------
print("\n7. NO ABSOLUTE LOCAL PATHS")
NEEDLE = "/" + "Users" + "/"  # built so this file does not match itself
hits = []
for rel in repo_files():
    with open(os.path.join(REPO_ROOT, rel), encoding="utf-8", errors="ignore") as f:
        for i, line in enumerate(f, 1):
            if NEEDLE in line:
                hits.append(f"{rel}:{i}")
if hits:
    fail(f"absolute path(s) found: {hits[:10]}")
else:
    ok(f"no '{NEEDLE}' paths in {len(repo_files())} files")

# ---------------------------------------------------------------------------
print("\n8. ENTRYPOINTS SELF-CONTAINMENT")
eps = manifest.get("entryPoints", [])
bad = [p for p in eps if p.startswith(("../", "/")) or ".." in p.split("/") or not os.path.isfile(os.path.join(REPO_ROOT, p))]
if bad:
    fail(f"entryPoints outside/missing from design-repo: {bad}")
else:
    ok(f"all {len(eps)} entryPoints are real files inside design-repo/")
unlisted = [r for r in repo_files() if r not in eps and r != "registry.manifest.json"]
if unlisted:
    fail(f"shipped file(s) not listed in entryPoints: {unlisted}")
else:
    ok("every shipped file is listed in entryPoints")

# ---------------------------------------------------------------------------
print("\n9. TOKEN INTEGRITY (aliases, catalog, policy, tokensUsed, theme)")
TREE = {}
for layer in ("00-foundation", "10-semantic", "20-component", "30-layout"):
    for f in sorted(os.listdir(os.path.join(REPO_ROOT, "tokens", layer))):
        if f.endswith(".json"):
            d = load(f"tokens/{layer}/{f}")
            for top in ("foundation", "semantic", "component", "layout"):
                if top in d:
                    for k, v in d[top].items():
                        TREE.setdefault(top, {})[k] = v
            if "patterns" in d:
                TREE["patterns"] = d["patterns"]


def get(ref):
    node = TREE
    for p in ref.split("."):
        if not isinstance(node, dict) or p not in node:
            return None
        node = node[p]
    return node


def resolve_val(v, depth=0):
    if depth > 10:
        raise ValueError("alias cycle")
    if isinstance(v, str) and v.startswith("{") and v.endswith("}"):
        t = get(v[1:-1])
        if not isinstance(t, dict) or "$value" not in t:
            raise KeyError(v)
        return resolve_val(t["$value"], depth + 1)
    if isinstance(v, dict):
        return {k: resolve_val(x, depth + 1) for k, x in v.items()}
    if isinstance(v, list):
        return [resolve_val(x, depth + 1) for x in v]
    return v


def walk_leaves(node, prefix):
    if isinstance(node, dict):
        if "$value" in node:
            yield prefix, node
        else:
            for k, v in node.items():
                yield from walk_leaves(v, f"{prefix}.{k}" if prefix else k)


broken = []
for top in ("foundation", "semantic", "component", "layout"):
    for path, leaf in walk_leaves(TREE.get(top, {}), top):
        try:
            resolve_val(leaf["$value"])
        except (KeyError, ValueError) as ex:
            broken.append(f"{path} -> {ex}")
for name, p in TREE.get("patterns", {}).items():
    for ref in p.get("durations", []) + p.get("easing", []):
        try:
            resolve_val(ref)
        except (KeyError, ValueError):
            broken.append(f"patterns.{name} -> {ref}")
if broken:
    fail(f"{len(broken)} unresolvable token alias(es): {broken[:5]}")
else:
    ok("every token alias and motion-pattern token ref resolves")

catalog = load("tokens/llm/token-catalog.json")
dangling = []
n_refs = 0
for group, entries in catalog.items():
    if group.startswith("$"):
        continue
    for name, ent in entries.items():
        n_refs += 1
        t = get(ent["ref"])
        if t is None or (not ent["ref"].startswith("patterns.") and "$value" not in t):
            dangling.append(f"{group}.{name} -> {ent['ref']}")
if dangling:
    fail(f"catalog<->token drift: {len(dangling)} dangling ref(s): {dangling[:5]}")
else:
    ok(f"{n_refs} token-catalog refs resolve to real tokens/patterns")
policy = load("tokens/llm/token-policy.json")
pk, ck = set(policy["rawValueRestrictions"]), {k for k in catalog if not k.startswith("$")}
if pk != ck:
    fail(f"token-policy categories != token-catalog keys: {sorted(pk ^ ck)}")
else:
    ok(f"token-policy categories match token-catalog keys ({len(ck)})")
bad_used = []
for d in ("primitives", "components", "sections"):
    for f in os.listdir(os.path.join(REPO_ROOT, d)):
        if f.endswith(".json"):
            for ref in load(f"{d}/{f}").get("tokensUsed", []):
                t = get(ref)
                if not isinstance(t, dict) or "$value" not in t:
                    bad_used.append(f"{d}/{f}: {ref}")
if bad_used:
    fail(f"{len(bad_used)} tokensUsed ref(s) do not resolve: {bad_used[:5]}")
else:
    ok("every tokensUsed ref in primitives/components/sections resolves")
theme = load("tokens/themes/light.json")["resolved"]
sem_paths = {p: leaf for p, leaf in walk_leaves(TREE["semantic"], "semantic")}
if set(theme) != set(sem_paths):
    fail(f"theme light.json does not cover exactly the semantic tokens: {sorted(set(theme) ^ set(sem_paths))[:5]}")
else:
    drift = [p for p, leaf in sem_paths.items() if resolve_val(leaf["$value"]) != theme[p]]
    if drift:
        fail(f"theme light.json values drifted from their aliases: {drift[:5]}")
    else:
        ok(f"theme light.json resolves all {len(theme)} semantic tokens exactly")

# ---------------------------------------------------------------------------
print("\n10. CONTRACT <-> SCHEMA PARITY")
defs = schema["definitions"]
branches = {b["if"]["properties"]["section"]["const"]: b["then"] for b in defs["node"]["allOf"]}
pat_vocab = set(TREE.get("patterns", {}))
issues = []
for sec, c in contracts.items():
    s = sec.replace(".", "-")
    if defs.get("content_" + s) != c["content"]:
        issues.append(f"{sec}: sections/{s}.json content != schema definitions.content_{s}")
    br = branches.get(sec)
    if br is None:
        issues.append(f"{sec}: no schema branch")
        continue
    if set(br["properties"]["motion"]["properties"]["patterns"]["items"]["enum"]) != set(c["motion"]["allowedPatterns"]):
        issues.append(f"{sec}: schema motion enum != contract allowedPatterns")
    if not set(c["motion"]["allowedPatterns"]) <= pat_vocab:
        issues.append(f"{sec}: allowedPatterns outside tokens/00-foundation/motion.json patterns")
    pv = [k for k, v in c["variants"].items() if v["pageLevel"]]
    if set(br["properties"]["variant"]["enum"]) != set(pv) or set(allow["sections"]["section." + sec]["pageLevelVariants"]) != set(pv):
        issues.append(f"{sec}: page-level variants differ between contract/schema/allowlist")
    if c["motion"].get("fallbackSource") != "prescriptive-design-repo-policy" or not c["motion"].get("reducedMotionFallback"):
        issues.append(f"{sec}: contract motion lacks a labelled prescriptive reducedMotionFallback")
if defs["motion"].get("additionalProperties") is not False:
    issues.append("schema motion object is not closed (additionalProperties must be false)")
if set(defs["motion"]["properties"]["patterns"]["items"]["enum"]) != pat_vocab:
    issues.append("schema global motion pattern enum != motion.json patterns")
for x in issues:
    fail(x)
if not issues:
    ok(f"{len(contracts)} section contracts == schema fragments; motion closed; patterns/variants in parity")

# ---------------------------------------------------------------------------
print("\n11. GRAPH <-> VALIDATOR <-> TEMPLATES")
gids = {r["id"] for r in graph["rules"]}
if gids != IMPLEMENTED_RULES:
    fail(f"graph rule ids != semantic_validate IMPLEMENTED_RULES: only-in-graph {sorted(gids - IMPLEMENTED_RULES)}, only-in-code {sorted(IMPLEMENTED_RULES - gids)}")
else:
    ok(f"{len(gids)} graph rule ids == validator's implemented rule ids")
for r in graph["rules"]:
    if r.get("severity") not in ("error", "warn"):
        fail(f"rule {r['id']} has invalid severity {r.get('severity')!r}")
    if r["kind"] == "constraint" and "section" in r and not contracts.get(r["section"], {}).get("constraints", {}).get(r["constraint"]):
        fail(f"rule {r['id']}: section {r['section']} does not declare constraints.{r['constraint']}")
cats = {s: c["category"] for s, c in contracts.items()}
if graph["sectionCategories"] != cats:
    fail("graph sectionCategories != section contract categories")
else:
    ok("graph sectionCategories == contract categories")
exc = {tuple(p) for p in CTX.rules["DIVIDER_BETWEEN_BANDS"]["exceptions"]}
all_routes = []
for t in templates:
    for s in t["nodes"]:
        c = contracts.get(s["section"])
        if c is None or not c["variants"].get(s["variant"], {}).get("pageLevel"):
            fail(f"{t['id']} slot {s['slot']}: ({s['section']}, {s['variant']}) is not an allowlisted page-level section/variant")
    slots = t["nodes"]
    req = [i for i, s in enumerate(slots) if s["required"]]
    minimal = [slots[req[0]]]
    for a, b in zip(req, req[1:]):
        if (slots[a]["section"], slots[b]["section"]) not in exc:
            d = next((i for i in range(a + 1, b) if slots[i]["section"] == "shell.lines-divider"), None)
            if d is None:
                fail(f"{t['id']}: rhythm rule needs a divider between {slots[a]['section']} and {slots[b]['section']} but the template has none")
                continue
            minimal.append(slots[d])
        minimal.append(slots[b])
    for label, seq in [("full", slots), ("minimal backbone", minimal)]:
        rep = Report(CTX)
        check_structure([{"section": s["section"], "variant": s["variant"]} for s in seq], t["id"], CTX, rep)
        if rep.errors or rep.warnings:
            fail(f"{t['id']} [{label}] violates its own graph: {rep.errors + rep.warnings}")
        else:
            ok(f"{t['id']} [{label}, {len(seq)} slots]: every structural graph rule holds (0 errors, 0 warnings)")
    all_routes += t["routes"]
dup = sorted({r for r in all_routes if all_routes.count(r) > 1})
if dup or set(all_routes) != set(manifest.get("routes", [])):
    fail(f"route coverage not 1:1 (dupes {dup}; templates {sorted(all_routes)} vs manifest {manifest.get('routes')})")
else:
    ok(f"route coverage 1:1: {len(all_routes)} route(s) -> {len(templates)} template(s), no gaps, no double assignment")

# ---------------------------------------------------------------------------
print("\n12. STRUCTURED RESPONSIVE FIELDS")
LAYOUTS = {"unchanged", "stack", "grid-collapse", "hidden", "scroll-strip", "overlay-menu", "resize"}
rbad = []
for sec, c in contracts.items():
    r = c.get("responsive", {})
    if set(r) != {"desktop", "tablet", "mobileLandscape", "mobilePortrait"}:
        rbad.append(f"{sec}: breakpoint keys {sorted(r)}")
        continue
    for bpn, v in r.items():
        if v.get("layout") not in LAYOUTS or not isinstance(v.get("changes"), list) or not v.get("measuredFrom"):
            rbad.append(f"{sec}.{bpn}")
for x in rbad:
    fail("responsive field malformed: " + x)
if not rbad:
    ok(f"{len(contracts)} sections carry structured desktop/tablet/mobileLandscape/mobilePortrait fields with a closed layout enum + citations")

# ---------------------------------------------------------------------------
print("\n" + "=" * 64)
print(f"{len(failures)} failure(s), {len(warnings)} warning(s)")
sys.exit(1 if failures else 0)
