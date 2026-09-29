# GoLive result: hosting (Vercel), first production deploy

- Applied plan: `c58ae49e91a9`, approved with `--confirm-live` (see [GOLIVE-hosting-PLAN.md](GOLIVE-hosting-PLAN.md))
- Follow-up plan `4eba2d0f302b` contains only the zero-write `project:hosting` pin, so nothing is pending
- GoLive release: v0.1.0-alpha.5
- Date: 2026-09-28 (US Pacific) / 2026-09-29 UTC

## Live

- Production: https://golive-gstack-demo.vercel.app
- Deployment URL `golive-gstack-demo-puprxwtuo-airis-agentacct.vercel.app` is covered by Standard
  Protection, so share and probe the production alias above, not this URL
- Vercel team AIRIS-AGENTACCT (`team_2a1zwKIyVRoB3eNW5KCmmCm7`), project `golive-gstack-demo` (`prj_z1YyNG9mw02ymcfp8SWY2OchYdOD`)

## Step outcomes

| Step | Status | Change |
|---|---|---|
| `project:hosting` | done | pinned the project in `.golive/state.json` |
| `deploy:production` | done | `vercel deploy --prod` → production alias above |

## Verification (`golive verify`, full check set)

3 pass · 0 fail · 1 warn · 18 skip

| Check | Result | Evidence |
|---|---|---|
| `accounts` | pass | vercel CLI, `teameden`, team scope `team_2a1zwKIyVRoB3eNW5KCmmCm7` |
| `env-parity` | pass | the code references no env vars |
| `bundle-secrets` | pass | 1 file scanned, no credential patterns |
| `site-headers` | **warn** (medium) | `x-content-type-options` and clickjacking protection are missing. HSTS is present. |
| `preview-deploy`, `preview-bundle` | skip | no preview deployment recorded, so these are **not verified by golive** |
| all others | skip | not applicable (no domain, DB, auth, webhooks, payments or email) |

## Agent probes (outside golive)

| Path on production alias | HTTP |
|---|---|
| `/` | 200 |
| `/api/health` | 200, `{"ok":true,…,"service":"golive-gstack-demo"}` |
| `/golive.yaml`, `/.golive/state.json`, `/README.md`, `/docs/GOLIVE-hosting-PLAN.md`, `/.vercelignore` | 404 (the `.vercelignore` allowlist works) |

## Open items

- `site-headers` warn: fixing it needs a repo change (`vercel.json` `headers`, plus `!vercel.json`
  in `.vercelignore`) and a redeploy. Not done in this run.
- GoLive `handoff`: no open handoffs.
- Teardown: GoLive adopted the project rather than creating it, so deleting it is manual (Vercel
  dashboard, or `vercel project rm golive-gstack-demo --scope airis-agentacct`).
- Costs: not read by golive (`[unknown]` in `GOLIVE_HANDOVER.md`). The team is on Pro, per a
  separate Vercel API read before the plan.

## For the gstack walkthrough

GoLive does **not** create `.vercel/`. It passes `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` to the CLI
through environment variables and records the link only in `.golive/state.json`. `/setup-deploy`
detects Vercel from `vercel.json` or `.vercel/`, so a re-run in this worktree will still find no
platform unless one of those is added. The README at the time claimed step 2 leaves a linked
project (`.vercel/`); it has since been corrected.

## Follow-up: security headers (out-of-band CLI deploy)

- Added `vercel.json` (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` on `/(.*)`) and
  `!vercel.json` to `.vercelignore`.
- **GoLive did not plan a deploy for it.** `plan` returned `4eba2d0f302b`, the same pin-only plan.
  GoLive plans a production deploy only for (a) the first deploy, (b) a redeploy still pending
  after a production env write, or (c) a retry after a failed deploy. A code-only change doesn't
  trigger one, by design: the deploy link in `src/links/deploy.ts` (bundled at `golive.mjs:18688`)
  returns null when none of those hold. So the honest deploy trigger for later merges is the host's
  own path (Vercel CLI or Vercel Git integration), not `golive apply`.
- With the owner's approval, I deployed out of band using the same invocation GoLive uses:
  `VERCEL_ORG_ID=… VERCEL_PROJECT_ID=… vercel deploy --prod --yes --non-interactive --format json`.
  Result: `dpl_43PrGtCHeKhM1Ty5jgRmxf3NftyA`, READY, aliased to the production URL. No `.vercel/` was created.
- **This deploy is not in `.golive/state.json`**, which still records `dpl_7c8QNa8ZBho9XpMXZ8oZMnZ63fyi`
  (03:08:58Z) as the latest golive deploy. The file was byte-identical before and after.
- Live headers on `/` and `/api/health`: `x-content-type-options: nosniff`, `x-frame-options: DENY`.
- `golive verify`: `site-headers` went from warn/**medium** to warn/**low**, not pass. The core set
  (HSTS, nosniff, clickjacking) is now complete. Pass also requires the optional
  `content-security-policy`, `referrer-policy` and `permissions-policy` (`golive.mjs:20979-20991`),
  which were not added. Other checks: 3 pass, 18 skip.
- `golive status` (raw: [GOLIVE-hosting-STATUS-raw.json](GOLIVE-hosting-STATUS-raw.json)):
  `items: []`, `actionable: 0`, and `notChecked: []`. The out-of-band deploy does **not** register as
  drift. Status verified only the project link, and its `limits` says resources created outside
  golive are outside what it compares.

## Local files

- The run itself committed nothing. These files were published by a follow-up commit from the
  main checkout: `golive.yaml`, `.vercelignore`, `vercel.json`, `CLAUDE.md`,
  `docs/GOLIVE-hosting-*.md`, `docs/GOLIVE-hosting-STATUS-raw.json`, this file.
- Gitignored (stay local): `.golive/` (state, report.json, handover.json), `GOLIVE_REPORT.md`,
  `GOLIVE_HANDOVER.md`
