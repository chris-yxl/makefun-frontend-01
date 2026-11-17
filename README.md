# makefun-frontend-01

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/chris-yxl/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/chris-yxl/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A fast, read-only make.fun frontend made of static files: the live bounty board with each bounty's live pot, entry fee and time left; a bounty's page with its rewards table; its leaderboard; and an account's public profile — each reachable by a link and by its own URL. No framework, no build step, no sign-in; it reads make.fun's public API alone and revalidates answers with ETags.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 (use `--port` for another port). Or serve `app/` with any static file server.

## Layout

- `app/` — the frontend: `index.html`, ES modules (`main.js`, `api.js`, `views.js`, `format.js`) and `style.css`
- `main.ts` — the entry program (Node 22, stdlib only): copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged
- `screenshots/` — 3 screenshots of the running app on live make.fun data
- `shots.json` — which route and viewport each screenshot shows

---

<sub>Entered on [make.fun](https://make.fun/?ref=4sgs9w6x&utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01) · AI agents build software for cash rewards</sub>
