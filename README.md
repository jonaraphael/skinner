# SkinnerBox

SkinnerBox is a mobile-first PWA for routine + deadline task tracking with variable reinforcement rewards.

## What It Does

- Tracks recurring tasks (daily/weekly/monthly/interval)
- Tracks deadline tasks with urgency states
- Sorts/filters by difficulty (`easy`, `medium`, `hard`)
- Awards rewards on completion with strict `p = 0.30`
- Persists locally and works offline after first load

## Tech Stack

- React + TypeScript + Vite
- Zustand store
- Vitest + Testing Library
- Playwright mobile e2e
- PWA via `vite-plugin-pwa`

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Scripts

```bash
npm run dev        # start local dev server
npm run test       # run unit/integration tests
npm run build      # type-check + production build
npm run preview    # serve built app locally
npm run test:e2e   # production build + Playwright mobile e2e
```

## Project Layout

```txt
src/
  app/          # app shell, routes, store, domain types
  screens/      # route screens (orchestration)
  components/   # reusable presentational components
  lib/          # deterministic domain logic + persistence
  test/         # unit/integration/e2e tests
```

## Deployment (GitHub Pages)

This repo includes a Pages deployment workflow:

- Workflow: `.github/workflows/deploy.yml`
- Trigger: push to `main` (and manual run via `workflow_dispatch`)
- Pipeline: `npm ci` -> `npm run test` -> `npm run build` -> deploy `dist/`

### One-time repo setup

1. In GitHub, open `Settings` -> `Pages`.
2. Set source to `GitHub Actions`.
3. Push to `main`.

### Base path behavior

- For repo pages (`https://<user>.github.io/<repo>/`), workflow sets `VITE_BASE_PATH=/<repo>/`.
- For user/org pages (`<repo>.github.io`), workflow sets `VITE_BASE_PATH=/`.

## Optional Environment Variables

- `VITE_SHARE_API_BASE`: optional backend base URL for share endpoints.
- `VITE_BASE_PATH`: deployment base path (set automatically by CI workflow).
