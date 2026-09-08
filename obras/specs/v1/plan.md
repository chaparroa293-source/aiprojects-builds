# Plan — Obras (v1)

Implementation strategy, derived from context.md + spec.md. This is
where deployment/infra decisions get made concrete, and the build gets
broken into vertical slices in build order.

---

## Repo & location

- Scaffolded under `~/Dev/aiprojects-builds/obras/` — never a
  standalone repo, per standing rule
- Commit after each numbered slice passes manual hand-test (same git
  workflow as QuoteFast/Teacher CRM)

## Infra decisions (resolved here, per spec.md's flag)

| Concern | Decision | Reasoning |
|---|---|---|
| Hosting | Vercel | Matches QuoteFast precedent, zero-config Next.js deploys, generous free tier for a single-user internal tool |
| Database | Vercel Postgres (or Neon if Vercel Postgres pricing doesn't fit) | Managed, works natively with Prisma, no server to maintain — father has no IT support |
| File storage (attachments) | Vercel Blob | Simplest path for a Next.js/Vercel stack; avoids standing up a separate S3 bucket + credentials for a single-user app |
| Auth | None (per spec) | Single implicit user; if this becomes a real exposure concern post-launch, revisit — not a v1 blocker |
| Orphaned attachments | Soft-delete pattern: entity delete sets a `deleted_at` on linked attachments' parent reference rather than hard-removing the attachment row; attachment then surfaces in an "unassigned attachments" admin view | Resolves the spec.md flag concretely — nothing is silently lost |

**Note on exposure:** no-auth + deployed + accessible remotely means
the URL itself is the only barrier. Acceptable for v1 given it's
internal firm data, not customer-facing — but worth an explicit
conscious call, not an oversight. Flagging here so it's a decision, not
a gap.

## Build order (vertical slices, cheapest end-to-end first)

Each slice ships something the father can actually touch and hand-test,
not just a database table.

1. **App shell + directory (Clientes/Proveedores/Personal)**
   Sidebar nav, empty states, create/edit/list for Client, Supplier,
   Employee. No projects yet — proves the shared-directory model works
   before anything depends on it.

2. **Projects + segments (structure, no money yet)**
   Create a project, build a segment tree under it, rename/reparent/
   delete-with-block. Proves the recursive segment model and the
   block-on-nested-content rule before expenses touch it.

3. **Expense capture (the priority flow)**
   Quick-add from within a project, then the global quick-add from the
   dashboard shell. Segment-required validation, guaraní formatting
   (dot separators, whole numbers), supplier link (existing or inline-
   create). This is the slice to hand-test hardest — it's the daily-use
   flow.

4. **Project overview + segment rollups**
   Spend totals rolling up the segment tree, agreed_total_price +
   price_revision history, delta display. Depends on slice 3 having
   real expense data to verify against.

5. **Requests + Notes (with optional segment/expense links)**
   Lightweight, low-risk slice — mostly CRUD with the optional linking
   from the pre-mortem fix.

6. **Attachments**
   Generic attach-to-any-entity, cloud upload via Vercel Blob, the
   soft-delete/orphan handling from the infra table above. Placed after
   the entities it attaches to already exist and are tested.

7. **Dashboard (aggregation)**
   Active projects list, spend-vs-price at a glance, open requests
   count, recent activity feed, global search, quick-add. Built last
   since it aggregates data from every other slice — needs real data
   from 1–6 to be testable, not just visually plausible.

8. **Deploy + father-facing pass**
   Push to Vercel, confirm cloud Postgres + Blob wired correctly in
   production (not just local dev), full Spanish-language pass across
   every screen, then hand off for his own hands-on testing.

## Hand-testing checkpoints

Per your standing process lesson: interaction problems (control
placement, discoverability, whether "quick add" actually feels quick)
are invisible in spec review and only surface on real use. Slice 3
(expense capture) and slice 7 (dashboard) are the two highest-risk
slices for this — both get a deliberate hands-on pass by you before
declaring them done, not just a passing build/lint.

## Peer-review checkpoints

Per your added workflow step, bring in an independent model critique
at genuine irreversible-ambiguity points — not after every slice.
For this build, that's:
- After slice 2 (segment tree + block-delete logic — schema-level,
  hard to unwind later)
- After slice 6 (attachment orphan-handling — the trickiest data-
  integrity logic in the whole spec)

## Out of scope for this plan (confirmed from spec.md)

No auth, no multi-firm switching UI, no AI/search over notes, no
burn-rate/forecast on dashboard, no split-expenses-across-projects
feature.
