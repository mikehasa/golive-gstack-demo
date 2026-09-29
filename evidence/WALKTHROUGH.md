# GoLive × gstack walkthrough — evidence

What was exercised: a repo with **no deploy configuration** is taken to production by
[GoLive](https://github.com/mikehasa/golive-skill), and
[gstack](https://github.com/garrytan/gstack)'s `/setup-deploy` then detects and configures the
deployment. Everything below was produced on 2026-09-28/29 against the live project.

- **Live:** <https://golive-gstack-demo.vercel.app> — deployed on the owner's own Vercel account, team `AIRIS-AGENTACCT`
- **Versions:** GoLive `v0.1.0-alpha.5` · gstack (local install) `v1.60.1.0`
- **Run records:** [plan](../docs/GOLIVE-hosting-PLAN.md) · [result](../docs/GOLIVE-hosting-RESULT.md) · [status](../docs/GOLIVE-hosting-STATUS-raw.json)

## 1 — Before: no platform, and gstack says so

`/setup-deploy` found no platform config, no deploy workflow and no `.vercel/` link:

> `NO_CONFIG`
> …no platform config file found, but `api/health.js` looks like a Vercel-style serverless function.

It fell back to its Custom / Manual questions and wrote nothing (`CLAUDE.md` unchanged).

## 2 — GoLive takes the repo live

Plan `c58ae49e91a9`, one write (`deploy:production`), approved with `--confirm-live`:

> Deployment succeeded at https://golive-gstack-demo.vercel.app and the secrets scan passed.

`golive verify`: **3 pass** (accounts, env parity, bundle secrets), 0 fail, 1 warn
(`site-headers`, medium), 18 skip. The deploy ran `vercel deploy --prod`; GoLive passes
`VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` through environment variables and writes **no `.vercel/`** —
the link lives in `.golive/state.json`.

## 3 — Still invisible (the seam)

Re-running `/setup-deploy` **again found no platform**: gstack detects Vercel only from
`vercel.json` or `.vercel/`, and GoLive leaves neither.

> Step 1 printed NO_CONFIG and step 2's detection printed nothing, because vercel.json and
> `.vercel/` were both absent even though `.golive/state.json` existed.

## 4 — A code-only fix, and GoLive's deploy boundary

`golive verify` had flagged missing `x-content-type-options` / clickjacking headers. Adding
`vercel.json` (headers) plus `!vercel.json` to `.vercelignore` produced **no deploy step**: GoLive
plans a production deploy only for (a) the first deploy, (b) a redeploy still pending after a
production env write, or (c) a retry after a failed deploy (`src/links/deploy.ts`).

The fix was therefore deployed with the same invocation GoLive uses —
`VERCEL_ORG_ID=… VERCEL_PROJECT_ID=… vercel deploy --prod` → deployment `dpl_43Pr…`, READY. That
deploy is **not** recorded in `.golive/state.json`, and `golive status` afterwards reported
`items: []`, `actionable: 0`: an out-of-band deploy is not drift.

`site-headers` moved **warn/medium → warn/low**: the core set (HSTS, nosniff, clickjacking) is
complete; a full pass would also want CSP, referrer-policy and permissions-policy.

## 5 — After: gstack detects and configures

With `vercel.json` present, `/setup-deploy` detected the platform:

> `PLATFORM:vercel`

and wrote `## Deploy Configuration` into `CLAUDE.md` — production URL, trigger = the Vercel CLI
command, health check `/api/health`, status command `vercel ls golive-gstack-demo --prod --scope
airis-agentacct`, squash merges. Both the health check and the status command ran successfully.

## Independent verification (re-runnable)

| Check | Result |
|---|---|
| `curl -s https://golive-gstack-demo.vercel.app/api/health` | `{"ok":true,…,"service":"golive-gstack-demo"}` |
| `GET /` | 200 |
| `/vercel.json`, `/CLAUDE.md`, `/.golive/state.json`, `/golive.yaml` | 404 — nothing outside the app is served |
| Response headers | `x-content-type-options: nosniff`, `x-frame-options: DENY`, HSTS present |

## Findings

1. **A GoLive deployment is invisible to `/setup-deploy`.** GoLive writes no `.vercel/`; gstack detects Vercel from `vercel.json` or `.vercel/`. A documented handoff (a `vercel link` step, or GoLive writing the link file) would remove the seam.
2. **Code-only changes don't trigger a GoLive deploy** (by design). The honest deploy trigger for later merges is the host's own path — the Vercel CLI or Vercel's Git integration.
3. **A static deploy publishes everything unless filtered.** Without the allowlist `.vercelignore`, `.golive/state.json` (team/project IDs, account name), `golive.yaml` and the run docs would have been served at the production URL.
4. **New GoLive projects take the folder name.** `--project hosting=<name>` only selects an existing project; a worktree named `setup-deploy-b59cf2` would have created a project with that name.
5. *(Informational)* An out-of-band deploy is not reported as drift by `golive status`.
6. *(Informational)* The `site-headers` pass bar includes optional headers (CSP, referrer-policy, permissions-policy) beyond the core set.

## Provenance

- Raw agent session transcript: **local only, not published** — `session-2d0d7f0b.jsonl`,
  1,926,150 bytes, sha256 `92fa48375102007ddd26938442a1813ca0b7ffde6710a591065a5a20f976c273`.
- Nothing was committed during the run; a follow-up commit publishes these sanitized artifacts.
  Local absolute paths were replaced with `<worktree>`; provider team/project/deployment IDs are
  non-secret identifiers and are kept.
