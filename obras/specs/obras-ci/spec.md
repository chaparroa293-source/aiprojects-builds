# OBRAS-013 — CI Gate + npm run verify

CONTEXT
Obras (obras/ inside ~/Dev/aiprojects-builds monorepo) is live in production;
real data entry starts soon. It has no automated verification. WORKFLOW.md (repo
root) requires `npm run verify` + a GitHub Actions check on push/PR.
Infra-only, low-risk: no schema/domain change. Do not touch TECHNICAL_SPEC.md.

STEP 0 — Preflight (report before changing anything)
- Check for anything running against obras/: `lsof +D obras`,
  `ps aux | grep -E "vite|next|node"`. Report PIDs; don't kill anything
  without telling me what it is. Run any dev server inside this session only.
- Commit this prompt as obras/specs/obras-ci/spec.md on a new branch
  `ci/obras-verify`. All work happens on this branch. Never push to main.

STEP 1 — Inspect
- Paste obras/package.json "scripts". Confirm `build` contains
  `prisma migrate deploy`.
- Test tooling: does a runner exist? How many tests?
- Node version pin (engines / .nvmrc)? package-lock.json committed?
- Existing .github/workflows/ at repo root?
- Env vars read at build time (names only, never values).

STEP 2 — Add `verify` script
- verify = lint + typecheck (tsc --noEmit) + tests + `prisma generate && next build`.
- MUST NOT call `npm run build` or `prisma migrate deploy`. CI never touches a
  real database.
- If no test runner exists: omit tests, do NOT add one. Flag it in the report.

STEP 3 — Run locally
- `npm run verify` must pass on the current code. Trivial fixes: fix them.
  Anything more than trivial: stop and flag it, don't push through.
- Also confirm it passes with DATABASE_URL set to a dummy unreachable value
  (this mimics CI).
- Gotcha check (report only): list every route file and whether it declares
  `export const dynamic = "force-dynamic"`. Flag any route that runs per-request
  logic (redirects, auth, DB) without it.

STEP 4 — Add root .github/workflows/verify.yml
- Location: repo ROOT .github/workflows/ (not obras/.github).
- Trigger: push + pull_request, `paths: ['obras/**', '.github/workflows/verify.yml']`.
- `working-directory: obras`, Node version matching the project, `npm ci`,
  then `npm run verify`.
- Dummy placeholder env values only. No real secrets in GitHub.

STEP 5 — STOP before pushing
Report and wait for my go-ahead. Pushing the branch triggers a Vercel preview
deploy, and I need to confirm the Preview DATABASE_URL first (I'm checking the
Vercel dashboard myself). If the Vercel CLI is already linked, also run
`vercel env ls` and report which environments DATABASE_URL is set for
(names/scopes only; do NOT pull values).

AFTER MY GO-AHEAD
- Push the branch and confirm the Actions run goes green.
- Push one throwaway commit with a deliberate type error, confirm it goes RED,
  then revert it. Report both run URLs.

REPORT (plain language)
What changed (files), verify result locally + with dummy DB, test-runner
status, force-dynamic audit, env scope findings, anything flagged.
