## Deploy Configuration (configured by /setup-deploy)
- Platform: Vercel (team AIRIS-AGENTACCT `team_2a1zwKIyVRoB3eNW5KCmmCm7`, project golive-gstack-demo `prj_z1YyNG9mw02ymcfp8SWY2OchYdOD`; detected from vercel.json, no `.vercel/` link)
- Production URL: https://golive-gstack-demo.vercel.app
- Deploy workflow: none. No Vercel Git integration, so merging to main deploys nothing. Production deploys run through the Vercel CLI.
- Deploy status command: `vercel ls golive-gstack-demo --prod --scope airis-agentacct`
- Merge method: squash
- Project type: web app (static page + serverless `/api/health`)
- Post-deploy health check: `curl -sf https://golive-gstack-demo.vercel.app/api/health` → HTTP 200 with `"ok":true`

### Custom deploy hooks
- Pre-merge: none (no build or test step)
- Deploy trigger: after merge, from a checkout of main: `VERCEL_ORG_ID=team_2a1zwKIyVRoB3eNW5KCmmCm7 VERCEL_PROJECT_ID=prj_z1YyNG9mw02ymcfp8SWY2OchYdOD vercel deploy --prod --yes --non-interactive` (the same invocation GoLive uses; no `vercel link`)
- Deploy status: `vercel ls golive-gstack-demo --prod --scope airis-agentacct` (newest row Ready, Production)
- Health check: `curl -sf https://golive-gstack-demo.vercel.app/api/health` → `"ok":true`

### Notes
- `golive apply` is not a deploy trigger for code changes. GoLive plans a production deploy only for
  the first deploy, a redeploy pending after a production env write, or a retry after a failed
  deploy. Keep GoLive for provider wiring and `golive verify`.
- Deploys made with the CLI command above aren't recorded in `.golive/state.json`, and `golive status`
  does not report them as drift.
- `.vercelignore` is an allowlist (`api`, `index.html`, `vercel.json`). Add any new app file to it or
  it won't be deployed.
