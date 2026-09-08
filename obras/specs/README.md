# specs/

Per-slice documentation. One directory per slice (or slice group):

```
specs/<slice>/context.md   — why this slice exists; the real-world problem
specs/<slice>/spec.md       — what it must do; acceptance criteria
specs/<slice>/plan.md       — how it gets built; infra/order decisions
```

`specs/v1/` holds the original whole-product planning docs (slices 1–8).

## Reasoning order for a slice (discipline, not nine more files)

Domain change → Data contract → Capture → Retrieval → Views → Derivations
→ Implement → Verify → Promote only durable learning

**Define CAPTURE and RETRIEVAL before implementing.** For every important
persisted object the slice touches, answer explicitly:

1. How does this information enter Obras?
2. How does the user find it again later?

Quick Capture and Manual Entry are different capture paths into the same
structured truth — not different truths.

## Permanent docs (repo root)

- `README.md` — what Obras is, how to run it.
- `TECHNICAL_SPEC.md` — the current domain truth. Slow-changing; see its
  own header for when to update it.

`PRODUCT_SCOPE.md`, `BUILD_STATE.md`, `DECISIONS.md` are intentionally not
kept — git history and these slice docs cover that need.
