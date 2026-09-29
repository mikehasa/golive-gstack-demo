# golive-gstack-demo

A disposable fixture used to exercise the handoff between
[GoLive](https://github.com/mikehasa/golive-skill) (take an app from repo to live
production on the owner's own accounts) and
[gstack](https://github.com/garrytan/gstack)'s deploy path (`/setup-deploy`,
`/land-and-deploy`, `/canary`).

The walkthrough this repo supports:

1. `/setup-deploy` in a repo with **no deploy configuration** finds no platform
   and falls back to its Custom / Manual questions.
2. GoLive deploys this app to the owner's own Vercel account, which leaves a
   linked project (`.vercel/`), a production URL and a verified report.
3. `/setup-deploy` re-run on the same working tree **detects the platform** and
   writes `## Deploy Configuration` into `CLAUDE.md`; `/canary` then monitors
   the live URL.

Everything here is intentionally tiny: one static page plus a serverless
`/api/health` endpoint. No real product, no user data, no credentials.

## Reproduce

Prerequisites: Node 20+, the Vercel CLI logged into your own account, and
GoLive installed (`npx skills add https://github.com/mikehasa/golive-skill --skill golive`).

```bash
node <golive-skill>/scripts/golive.mjs detect --json
node <golive-skill>/scripts/golive.mjs init --stack hosting=vercel --json
node <golive-skill>/scripts/golive.mjs plan --json        # review, then approve
node <golive-skill>/scripts/golive.mjs apply --plan <id> --yes --confirm-live --json
node <golive-skill>/scripts/golive.mjs verify --json
```

State, report and handover files (`.golive/`, `GOLIVE_REPORT.md`,
`GOLIVE_HANDOVER.md`) stay out of the repo by design — they carry resource ids
and account names. Credentials live outside the repo entirely.

## License

MIT
