# BE1 Monitoramento — Agent Guide

React Native app (Expo Router + Tamagui, feature-based). **`docs/technical-spec.md` is normative** — read it before editing. Visual source of truth: `design/melhoria-visual-app/`.

## Commands

- `npm run typecheck` — `tsc --noEmit` (must stay green, no `any`)
- `npm start` — Expo dev server
- `npx expo export --platform ios --output-dir dist-check` — full bundle smoke test

## Layout

- `app/` — routes only (thin re-exports of feature screens). Tabs in `app/(main)/_layout.tsx`; device detail tabs in `app/device/[id]/_layout.tsx`.
- `src/features/<name>/` — vertical slices: `screens/ components/ hooks/ services/ schemas/`.
- `src/shared/` — `ui/` (Tamagui primitives), `components/` (composite), `layouts/`.
- `src/services/` — global IO (api, realtime, storage, logger). `src/theme/` — Tamagui config + tokens. `src/providers/` — app providers (kept OUT of `src/app` to avoid Expo Router collision).

## Rules (hard)

- No business logic in `app/`; no cross-feature imports; no API calls from screens/components (hook → service); no API data in Zustand; semantic colors + spacing come from theme tokens.
- Data flows: React Query hook → feature service (Axios) → Zod-validated. Currently **mock services + fixtures** (`env.USE_MOCKS`); swap to real Axios without touching hooks/screens.
- Fonts: `$body` = Plus Jakarta Sans, `$mono` = JetBrains Mono (telemetry/MAC/timestamps).

## Status

All 10 prototype screens built: auth (splash/login/forgot), dashboard, devices list + real-time detail, Perfil (`profile`), Assistências (`support`), device Configuração (`devices`), device Histórico (`reports`). Features: auth, dashboard, devices, profile, support, reports.
