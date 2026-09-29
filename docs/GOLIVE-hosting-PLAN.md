# GoLive plan: hosting (Vercel), first production deploy

- Plan id: `c58ae49e91a9` (supersedes `f8b948b54de6`, which would have created a project named `setup-deploy-b59cf2`)
- GoLive release: v0.1.0-alpha.5, bundle `b6456e1d16f2…`
- Generated: 2026-09-28, from worktree `setup-deploy-b59cf2`
- Scope: hosting only. No database, auth, payments, email or DNS axes.

## Destination

| Field | Value | Source |
|---|---|---|
| Provider | Vercel | `golive.yaml` stack.hosting |
| Login | vercel CLI, user `teameden` | `golive doctor` |
| Team | AIRIS-AGENTACCT (`team_2a1zwKIyVRoB3eNW5KCmmCm7`), slug `airis-agentacct` | `plan.targets[].scope` |
| Team plan | Pro, billing status active | Vercel API `/v2/teams/{id}` |
| Project | `golive-gstack-demo` (`prj_z1YyNG9mw02ymcfp8SWY2OchYdOD`), existing | `plan.targets[].project` |

The project was created empty just before this plan with
`vercel project add golive-gstack-demo --scope airis-agentacct`, with the owner's approval. GoLive
did not create it, so `golive teardown` will list it as a manual delete.

## Steps

| Step | Writes | Needs | What it does |
|---|---|---|---|
| `project:hosting` | no | none | Pins every Vercel write in this plan to the project above. |
| `deploy:production` | yes | `--confirm-live` | `vercel deploy --prod` of this worktree into the project. First production deploy for this project, so it needs `--confirm-live`. |

No env vars (`unmappedEnv` empty), no handoffs, no warnings, no findings.

## What gets uploaded

`.vercelignore` (added in this run) is an allowlist, so only these ship:

- `index.html`
- `api/health.js` → `GET /api/health`

Not uploaded: `golive.yaml`, `.golive/`, `docs/`, `GOLIVE_*.md`, `README.md`, `LICENSE`.

## Cost

Vercel doesn't charge per project. A static page and one small function count against the
team's included Pro usage. Exact remaining usage wasn't read.

## Not covered by this plan

- No custom domain. The production URL is whatever alias Vercel assigns, and it isn't known until
  the deploy finishes. GoLive does not guess it.
- Deployment Protection is left at the project default. The production alias is expected to be
  public under Standard Protection. If it isn't, `verify` will say so.
- Nothing was committed during the run; these files are published by a follow-up commit from the
  main checkout.
