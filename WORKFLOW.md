# WORKFLOW.md — Canonical Build Methodology

This is the master reference for how every Build gets made, from first idea to production. Read top to bottom once to internalize it; come back to specific sections when you need them.

---

## 1. The Mental Model

Two loops, not one. Most mistakes come from collapsing them into a single "just build it" loop.

```
OUTER LOOP  — Product-development discipline
             (what should exist, and why)

INNER LOOP  — Software-engineering execution discipline
             (how it gets built, verified, and released)
```

Inside the inner loop there are actually four nested loops:

```
PRODUCT LOOP     Discovery → Spec
ENGINEERING LOOP Inspect → Implement → Verify
REVIEW LOOP      Diff → Peer review → Hand test
RELEASE LOOP     Preview → Verify → Production → Verify
```

Everything below is these four loops made concrete.

---

## 2. Roles (who owns what)

| Role | Owns |
|---|---|
| **You (Agustín)** | Product intent, domain truth, approval, prioritization, UX judgment, final acceptance, credentials |
| **Claude (chat) — planning layer** | Requirement translation, architecture reasoning, ambiguity detection, pre-mortem, scoped prompt construction, scope control, showing casual→precise translation |
| **Claude Code / Codex — execution layer** | Repository inspection, implementation, migrations, tests, shell commands, debugging, self-verification, diff production |

```
Human intent
   ↓
Planning layer (Claude chat)
   ↓
Execution layer (Claude Code / Codex)
   ↓
Repository
```

The coding agent should never have to invent the product while simultaneously implementing it. That's the planning layer's job.

---

## 3. The Canonical Sequence

Every Build — and every unit of work inside a Build — follows this shape. Depth compresses for small changes; **no phase is ever skipped because a change feels like "just infra" or "just a fix."**

```
DISCOVERY
   ↓
SYSTEM SPEC
   ↓
SLICE SPEC
   ↓
PRE-MORTEM
   ↓
IMPLEMENT (agent inspects → plans → implements)
   ↓
MACHINE VERIFY (npm run verify)
   ↓
DIFF REVIEW
   ↓
PEER-AGENT REVIEW
   ↓
HAND TEST
   ↓
COMMIT / PUSH
   ↓
CI (clean-machine verify)
   ↓
PREVIEW DEPLOY
   ↓
LIVE VERIFY
   ↓
PROMOTE / MERGE
   ↓
DATABASE RELEASE (if applicable)
   ↓
PRODUCTION DEPLOY
   ↓
PRODUCTION VERIFY
   ↓
RECORD KNOWN-GOOD STATE
   ↓
NEXT SLICE
```

### Phase definitions

**Discovery** — Before any repo work. Understand the real workflow, objects, relationships, decisions, edge cases. Not technical yet — it captures reality. For a foundation slice, "discovery" means *auditing the current system* instead of interviewing a user — same phase, different content.
→ Artifact: `context.md`

**System Spec** — Durable rules for the whole product: objects, cardinality, invariants, key fields, state transitions, derived values, ownership model, major architecture decisions.
→ Artifact: `TECHNICAL_SPEC.md` (living, but changes only on real domain/system-meaning change — never a changelog)

**Slice Spec** — Bounded spec for one unit of work.
→ Artifact: `specs/S0X-name.md`

**Pre-mortem** — What's likely to go wrong, what's ambiguous, what's destructive, what production dependency exists, what can't be verified automatically. For a normal feature slice: *"what can fail inside this?"* For a foundation slice: *"what can this break outside itself?"* — and must list an explicit **regression scope** (named existing flows/slices it touches).

**Implement** — Agent inspects the real repo first, discovers existing patterns, then implements. Never invents a parallel architecture.

**Machine Verify** — `npm run verify` (lint + typecheck + tests + build) must pass before anything is "done." Agent iterates on failures itself; you intervene only for domain ambiguity, architecture choice, UX judgment, unexpected scope, or destructive actions.

**Diff Review** — You review the actual diff, not the process: what changed, why, unrelated files touched, new patterns introduced, schema/dependency changes.

**Peer-Agent Review** — A different model reviews the diff against the spec: invariant violations, wrong cardinality, hidden scope expansion, regressions, unnecessary abstraction, security issues, missing tests, duplication, and the anti-slop checklist (see §11).

**Hand Test** — Machine verify ≠ acceptance. You actually use the feature: click behavior, discoverability, drag/drop feel, tablet behavior, whether it feels awkward. A feature can be technically perfect and still bad software. For foundation slices, hand test includes regression-checking previously-working flows, not just the new thing.

**CI** — GitHub Actions runs a clean install + `npm run verify` on push/PR. Cheap, independent confirmation the repo builds outside your laptop or the agent's environment. (This is *not* full CI/CD — no release trains, no multi-stage orchestration. Deferred until real multi-user load or a team exists.)

**Preview Deploy → Live Verify** — Real hosted environment before production. Verify routes, env vars, DB connectivity, server/client behavior, auth, redirects — things `next dev`/`next start` cannot catch (see §7, static-optimization gotcha).

**Promote** — Only after: spec satisfied + machine verify pass + peer review pass + hand test pass + preview pass. Not "the agent says done."

**Database Release** — Migrations applied through a controlled step, ordered correctly relative to app deploy (migrate before deploying code that depends on the new schema).

**Production Verify** — Don't trust a green deployment dashboard. Re-run the critical workflow live: load → auth → core operation → persistence → reload → the specific thing that changed.

**Record known-good state** — One or two lines logged: what shipped, what was flagged, what was decided. Then move to the next slice.

---

## 4. Bootstrap vs. Foundation Slices vs. Feature Slices

There is no permanent "foundation lane." There are only slices of different scope — with one exception at the very start.

```
B00 — Repository Bootstrap        (special: nothing exists yet to regress)
   ↓
Known-good baseline
   ↓
S01, S02, S03 ...                 (feature slices — narrow blast radius)
S0X — auth-gate, hosting-migration, schema-refactor ...
                                    (foundation slices — broad blast radius,
                                     same lifecycle, deeper regression reasoning)
```

- **Bootstrap (B00)** is minimal and happens once: repo, framework scaffold, package manager, test runner, base DB connection, Git, `npm run verify` wired up. Deployment target and data-persistence strategy are decided in **Discovery**, before bootstrap — not invented during it (see §8).
- **Foundation slices** (auth, hosting migration, schema refactor, shared-component extraction) happen *after* something real already works. They get a full spec including an explicit **regression scope** field naming every existing flow/slice they touch, and their hand test must re-verify those flows still work.
- **Feature slices** are the default unit — narrow blast radius, proven infrastructure underneath.

A slice is complete only if it clears the full loop in §3: **spec → pre-mortem → implement → verify → review → hand test → preview → production verify**. "It's just plumbing" is not a reason to shorten the loop — foundation slices are usually *more* dangerous, not less.

---

## 5. Vertical Slicing Discipline

A slice traverses the whole chain for one feature before the next slice starts:

```
CAPTURE → STRUCTURE → PERSIST → RETRIEVE → HISTORY → DERIVE → UNDERSTAND
```

(the **Product Quality Test** — a slice isn't complete if any link is missing)

Never build horizontally (all DB, then all APIs, then all UI) — that defers "does this actually work end to end" until the point where the most things can go wrong at once. Design/plan the whole app shape up front is fine; slicing governs **implementation order**, not design order.

---

## 6. Project & Repo Structure

Every Build lives as a folder inside the single repo `aiprojects-builds` — never a standalone repo.

```
aiprojects-builds/
└── <build-name>/
    ├── src/
    ├── prisma/  (or supabase/, if that's the chosen persistence layer)
    │   ├── schema.prisma
    │   └── migrations/
    ├── tests/
    ├── specs/
    │   ├── S01-<slice>.md
    │   ├── S02-<slice>.md
    │   └── ...
    ├── .github/
    │   └── workflows/verify.yml
    ├── .env.example
    ├── .gitignore
    ├── README.md            ← operational: install/run/test/build/env
    ├── AGENTS.md             ← how coding agents should operate this repo
    ├── TECHNICAL_SPEC.md     ← living domain/system truth
    ├── context.md            ← original Discovery capture
    ├── package.json
    └── tsconfig.json
```

**Deliberately excluded** unless a project proves it's needed: `PRODUCT.md`, `DOMAIN.md`, `DECISIONS.md`, `BUILD_STATE.md`. Git history + `TECHNICAL_SPEC.md` + per-slice specs already cover that need. Add a new doc only when actual complexity demands it, not by default.

### `AGENTS.md` contents
```
Commands (dev/build/test/verify)
Architecture conventions
Migration rules
Verification requirements
Testing expectations
Deployment rules
Important domain invariants
Files/directories not to touch casually
```

### `TECHNICAL_SPEC.md` — update rule (state it in the file's own header)
Update only when a slice changes durable meaning: new/removed/redefined object, changed field semantics, changed cardinality, changed invariant, changed capture/retrieval contract, changed KPI source/calculation/meaning, changed persistence/access semantics. **Never** for routine commits, bugfixes, styling, refactors.

---

## 7. Tooling Reference

### GitHub
- One repo (`aiprojects-builds`), one folder per Build.
- Branching: lightweight **GitHub Flow** — `main` + short-lived branches, deleted after merge.
  ```
  main
  ├── feat/client-directory
  ├── fix/session-status
  └── S04-auth-gate
  ```
- `main` = known-good integrated state / production candidate.
- Commit only after: implementation complete + verify passes + diff reviewed. A commit represents a validated state transition, not a checkpoint of effort.

### GitHub Actions (CI)
Minimal, added early, not deferred like full CI/CD:
```
on: push, pull_request
run: clean install → npm run verify
```
Purpose: independent proof the repo builds outside your machine or the agent's environment. Nothing more elaborate until real team/multi-user scale.

### Vercel
- Git-connected deployment is the default.
- Non-production branches → **Preview** deployments (unique URL per branch/PR).
- Merge to `main` → **Production** deployment.
- Supports promoting a previous deployment back to production — this is the rollback path if something breaks immediately after release.
- Sequence to trust: `local → branch → CI → Preview URL → hand-test on Preview → merge → Production → Production Verify`. Local "it works" is never sufficient evidence on its own (see the recurring static-optimization gotcha below).

### Database — Prisma + Postgres (default) vs. Supabase
**Stack is not part of the methodology — architecture decision first, tool second.** The default stack for Builds so far is Next.js + TypeScript + Prisma + Postgres + Vercel, and that stays the default unless a specific project genuinely needs Supabase's bundled Auth/Storage/Realtime.
- If Supabase is chosen for a project: initialize it *inside* the repo (`supabase/` with `config.toml`, `migrations/`, `seed.sql`), never configure it by clicking around a hosted dashboard first.
- Either way, the rule is universal: **schema changes must exist as repository-controlled migrations.** No production schema that exists only because someone clicked something in a dashboard.
  ```
  change schema → generate migration → apply locally → test →
  commit migration WITH the application change → apply via controlled release
  ```
- Local dev database should be resettable to a deterministic state from migrations + seed data (`db reset`) — gives agents a reproducible baseline instead of relying on whatever data happens to be sitting there.
- Production database is left **empty** at first deploy by design (real user enters real data) — do not seed it with test/dev data.
- Order matters at release: apply the migration *before* deploying app code that depends on the new schema, never the reverse.

### `npm run verify`
The single completion gate for every slice:
```
npm run verify = lint + typecheck + tests + build
```
An implementation is "done" only when this passes — not when the agent says so.

---

## 8. Standing Rules (condensed — the mistakes already paid for)

| Rule | Why |
|---|---|
| Decide deployment target + data-persistence/sync strategy at Discovery, before bootstrap | Not a launch-day afterthought |
| Local `next start` passing ≠ Vercel's real static/dynamic routing | A route with side-effect-only rendering (bare redirect) can get silently static-optimized and served from Edge/CDN instead of the serverless function — breaks only in production. Every route needing per-request logic must explicitly declare dynamic rendering |
| Always confirm a deploy-critical step happened — never assume | e.g. "did migrations actually run against prod" — verify, don't assume |
| Check for a stale dev server before assuming a regression | A leftover process on port 3000 makes a new server jump to 3001 and serve stale code — looks broken, isn't |
| Entities are freely add/edit/delete-able unless deletion would silently destroy financial/history data | Standing design principle — block, don't cascade, in that case |
| Don't add a schema field just to make a KPI possible before the underlying fact-source is real | No speculative fields |
| Extract a shared pattern only after it's repeated ~3 times | Not preemptively |
| Same function gets the same UI pattern app-wide | Check for an existing pattern before inventing a new one |
| The git repo/migrations are the source of truth | Don't reconstruct project context from chat history |
| Passing lint/build/typecheck ≠ passing real use | Always hand-test before committing |
| Bring in independent/peer review at genuine irreversible-ambiguity checkpoints (schema, cardinality, architecture) | Not after every routine step |

### KPI Specification Rule
Every KPI, before being implemented, must document:
```
NAME
SOURCE
FILTER
CALCULATION
MEANING
```
Prevents ambiguous or overclaiming dashboard numbers (e.g. a "100%" that's actually clamped, hiding a real 185% overspend).

### Feedback Triage Rule
Before any incoming feedback becomes a build prompt, sort it into:
```
BUG        — broken behavior
POLISH     — visual/interaction refinement
NEW DECISION — a scope/product change
```
So scope changes happen deliberately, not smuggled in under a styling pass.

---

## 9. Prompt & Documentation Conventions

**Prompt numbering** — every prompt to the coding agent gets a sequential ID + short title per Build:
```
OBRAS-001 — Initial V1 Build
OBRAS-009 — Security Audit + Auth Gate
```
Lets you reference past work precisely ("revisit OBRAS-005") instead of re-describing it.

**Slice numbering** — every slice (feature or foundation) gets a spec file:
```
specs/
  S01-clients.md
  S02-sessions.md
  S03-payments.md
  S04-auth-gate.md          ← foundation slice, same lifecycle
```

**Living glossary** — casual phrase → precise term, added to as new recurring phrases show up (never pre-populated speculatively). Purpose: you internalize precise vocabulary over time, and prompts stay unambiguous.

---

## 10. Anti-Slop Gate

AI-generated code has distinctive smells that `npm run verify` will never catch — the code compiles, lints, and passes tests while still being bad. This is not a new phase. It's what **Diff Review** and **Peer-Agent Review** (§3) are explicitly checking for, beyond correctness.

**Why this matters structurally, not just aesthetically:** whatever gets merged today is what the coding agent reads as "how this repo does things" tomorrow. Slop that ships doesn't stay contained — it becomes the pattern the next prompt copies. This is the same self-reinforcement logic behind the existing rule "same function gets the same UI pattern app-wide" (§8), just applied to code quality instead of UI.

### The checklist

| Category | What to look for |
|---|---|
| **Placeholder / deferral** | `TODO`, `FIXME`, "for now", stub functions, empty catch blocks left in a slice marked complete |
| **Narrative comments** | Comments that restate what the code visibly does instead of explaining *why* a non-obvious choice was made |
| **Generic naming** | `data`, `result`, `temp`, `thing`, `handleClick2` surviving in a real code path |
| **Premature abstraction** | Interfaces, factories, or config layers built for a single current implementation — governed by the existing "extract only after ~3 repeats" rule (§8) |
| **Defensive overdose** | Error handling or null-checks guarding against scenarios the actual domain/schema can't produce — same instinct as the existing "don't add fields for imagined future cases" rule (§8) |
| **Duplication vs. false reuse** | Same logic copy-pasted across call sites *without* a stated reason, or reuse forced across things that don't actually share meaning — the 3-repeat threshold decides which way this should go |
| **Happy-path-only / mock-everything tests** | A test suite that passes without exercising the actual failure case or invariant is not evidence — reinforces the existing rule "passing lint/tests ≠ passing real use" (§8), extended to the tests themselves |
| **Confident overclaiming** | Agent says "done" / "this works" — treat as a claim, not a fact, until Machine Verify + Hand Test actually confirm it (§3) |

### Where it's enforced

- **Peer-Agent Review** is the primary gate — the reviewing model should be explicitly pointed at this checklist, not just "review for correctness."
- **Diff Review** (yours) is the final human pass — same checklist, applied by eye.
- No new tooling is required by default. If a dedicated slop-linter (e.g. in CI) starts reliably catching real defects on a future Build, add it then — don't adopt one preemptively just because it exists.

---

## 11. Quick Reference — the whole map in one screen

```
DISCOVERY (context.md)
  → what exists / what's needed, before touching a repo

B00 BOOTSTRAP (once)
  → repo, scaffold, DB connection, npm run verify wired up

FOR EACH SLICE (feature or foundation, same loop):
  SPEC (specs/S0X.md) — incl. regression scope if foundation
  → PRE-MORTEM — "what fails inside" (feature) / "what breaks outside" (foundation)
  → IMPLEMENT — agent inspects repo first, then builds
  → MACHINE VERIFY — npm run verify
  → DIFF REVIEW — you read the actual diff
  → PEER REVIEW — second model vs. spec
  → HAND TEST — real use, incl. regression check if foundation
  → COMMIT/PUSH → CI (clean-machine verify)
  → PREVIEW DEPLOY → LIVE VERIFY
  → PROMOTE (merge to main)
  → DATABASE RELEASE (migration before app deploy, if applicable)
  → PRODUCTION DEPLOY → PRODUCTION VERIFY
  → record known-good state, 1-2 lines

NEXT SLICE
```

That's the whole machine. Everything else in this document is detail on one of these steps.
