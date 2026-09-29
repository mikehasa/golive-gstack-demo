# golive-gstack-demo

A disposable fixture used to exercise the handoff between
[GoLive](https://github.com/mikehasa/golive-skill) (take an app from repo to live production on
the owner's own accounts) and [gstack](https://github.com/garrytan/gstack)'s deploy path
(`/setup-deploy`, `/land-and-deploy`, `/canary`).

**Live: <https://golive-gstack-demo.vercel.app>** — one static page plus a serverless
`/api/health`, deployed on the owner's own Vercel account.

## What this walkthrough found

1. **GoLive leaves no `.vercel/`.** It passes `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` to the Vercel CLI through environment variables and records the link in `.golive/state.json`. Since `/setup-deploy` detects Vercel only from `vercel.json` or `.vercel/`, a re-run after a GoLive deploy still finds no platform until one of those exists.
2. **GoLive does not redeploy code-only changes** (deploy is planned only for the first deploy, a pending redeploy after a production env write, or a retry after a failure). The honest trigger for later merges is the host's own path — the Vercel CLI or Vercel's Git integration.
3. **A static deploy publishes the whole folder unless filtered.** The allowlist `.vercelignore` keeps `.golive/state.json`, `golive.yaml` and the run docs off the public site.
4. **New GoLive projects take the folder name** — `--project hosting=<name>` only selects an existing project.

The full sequence, key outputs and the independent verification table:
[evidence/WALKTHROUGH.md](evidence/WALKTHROUGH.md). Run records:
[plan](docs/GOLIVE-hosting-PLAN.md) · [result](docs/GOLIVE-hosting-RESULT.md) ·
[status](docs/GOLIVE-hosting-STATUS-raw.json).

## The walkthrough, as run

1. `/setup-deploy` in a repo with **no deploy configuration** finds no platform and falls back to its Custom / Manual questions; it writes nothing.
2. GoLive deploys the app to the owner's own Vercel account (`deploy:production`, approved with `--confirm-live`); its report is `GOLIVE_REPORT.md` (kept out of the repo).
3. Re-running `/setup-deploy` **still finds no platform** — GoLive left no `.vercel/`.
4. Adding `vercel.json` (security headers) provides the detection signal; that code-only fix is deployed with the same CLI invocation GoLive uses, because GoLive does not plan code-only deploys.
5. `/setup-deploy` re-run detects `PLATFORM:vercel` and writes `## Deploy Configuration` into `CLAUDE.md` (production URL, CLI trigger, `/api/health` health check, squash merges).

## Reproduce

Prerequisites: Node 20+, the Vercel CLI logged into your own account, and GoLive installed
(`npx skills add https://github.com/mikehasa/golive-skill --skill golive`).

```bash
node <golive-skill>/scripts/golive.mjs detect --json
node <golive-skill>/scripts/golive.mjs init --stack hosting=vercel --json
node <golive-skill>/scripts/golive.mjs plan --json        # review, then approve
node <golive-skill>/scripts/golive.mjs apply --plan <id> --yes --confirm-live --json
node <golive-skill>/scripts/golive.mjs verify --json

# later code-only deploys (GoLive won't plan one):
VERCEL_ORG_ID=team_… VERCEL_PROJECT_ID=prj_… vercel deploy --prod --yes --non-interactive
```

State, report and handover files (`.golive/`, `GOLIVE_REPORT.md`, `GOLIVE_HANDOVER.md`) stay out
of the repo by design — they carry resource ids and account names. Credentials live outside the
repo entirely.

## License

MIT
