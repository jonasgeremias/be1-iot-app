# Technical Specification — React Native App

> **Audience: AI coding agents and developers.** This document is normative.
> `MUST` / `NEVER` are hard rules — never violate them. `SHOULD` is a strong default.
> Place at `docs/00-technical-spec.md`. Read it fully before writing or editing code.
> Architecture: **Expo Router + Tamagui + Feature-Based**. The prototype defines layout; this defines the technical base.

---

## 1. Stack (single source of truth)

| Layer | Library | Use / constraint |
|---|---|---|
| Platform | Expo + React Native + TypeScript | — |
| Routing | Expo Router | File-based. `NEVER` wire React Navigation manually except for a documented edge case |
| UI / Design System | Tamagui | All UI components built from Tamagui |
| Styling | Tamagui theme + tokens | `NEVER` use loose/inline style values; everything comes from tokens |
| Global state | Zustand | UI/session/app state only — `NEVER` store API data here |
| Server data & cache | TanStack React Query | All requests, caching, refetch, pagination, loading, errors |
| HTTP client | Axios | REST only |
| Forms | React Hook Form | `NEVER` use Yup |
| Validation | Zod | Schemas are the source of truth for data types (`z.infer`) |
| Icons | Lucide React Native | — |
| Animation / gestures | Reanimated + Gesture Handler | Transitions, bottom sheets, interactive cards, feedback |
| Local key-value storage | AsyncStorage | Simple prefs, flags, light config. **RECOMMENDED:** store auth tokens in Expo SecureStore / Keychain, not plain AsyncStorage |
| Offline DB | Realm | Only when structured offline persistence is truly needed (offline device data, sync queue, temporary history) |
| Realtime | Socket.IO Client | Device status, alerts, live events, dashboard updates |

`NEVER` add a library not listed here without updating this document first.

---

## 2. Global hard rules

- `NEVER` put business logic in `app/` — it holds routes, layouts, redirects only.
- `NEVER` import from one feature into another. Shared code goes to `shared/` or a global folder.
- `NEVER` call the API directly from a screen or component — go through a hook → service.
- `NEVER` store server/API data in Zustand — that belongs to React Query.
- `NEVER` use loose style literals — use Tamagui tokens.
- Domain-specific code (services, types, hooks, components) `MUST` live inside its feature.
- Global folders hold only cross-cutting, domain-agnostic code.

---

## 3. Routing — `app/` (Expo Router)

`app/` contains route files, layouts, and redirects only. Route files re-export the real screen from a feature:

```tsx
export { LoginScreen as default } from '@/features/auth/screens/LoginScreen';
```

```txt
app/
├── _layout.tsx
├── index.tsx
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── forgot-password.tsx
│   └── reset-password.tsx
├── (main)/                 # tab navigator (_layout.tsx declares Tabs)
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── dashboard.tsx
│   ├── devices.tsx
│   ├── groups.tsx
│   ├── reports.tsx
│   └── profile.tsx
├── device/[id].tsx         # full-screen detail, outside tabs
├── group/[id].tsx
└── modal/_layout.tsx
```

---

## 4. `src/` structure

```txt
src/
├── features/     # functional modules (vertical slices)
├── shared/       # reusable, domain-agnostic UI and helpers
├── services/     # global integrations (API, realtime, storage, DB)
├── hooks/        # global reusable hooks
├── store/        # global Zustand stores
├── theme/        # Tamagui config and tokens
├── constants/    # global constants
├── utils/        # pure utility functions
├── types/        # global types
└── config/       # env, app config, feature flags
```

---

## 5. Feature module (`src/features/<name>/`)

Each feature is self-contained. Standard layout:

```txt
<feature>/
├── screens/      # containers: consume hooks, compose components, no heavy logic
├── components/   # presentational, props-driven
├── hooks/        # React Query + state logic for this domain
├── services/     # domain API/IO for this feature (e.g. device.service.ts)
├── types/        # domain types
├── schemas/      # Zod schemas
└── store/        # feature-scoped Zustand (UI state only)
```

Features: `auth`, `dashboard`, `devices`, `groups`, `reports`, `alerts`, `profile`, `settings`.

---

## 6. `src/shared/`

| Folder | Holds | Example |
|---|---|---|
| `ui/` | Tamagui design-system primitives | `Button`, `Input`, `Card`, `Badge`, `Avatar`, `Tabs`, `Dialog`, `Sheet`, `Switch`, `Checkbox`, `RadioGroup`, `Select`, `Toast`, `Skeleton`, `Progress`, `Separator` |
| `components/` | Generic but composite components | `AppHeader`, `EmptyState`, `ErrorState`, `SearchInput`, `SectionTitle`, `StatusIndicator` |
| `layouts/` | Reusable screen frames | `Screen`, `ScrollScreen`, `AuthLayout`, `MainLayout`, `DetailsLayout` |
| `forms/` | Generic RHF + Zod form wrappers | — |
| `feedback/` | Shared feedback UI | — |
| `icons/` | Icon wrappers | — |

Rule: `ui/` = pure design system (no domain). `components/` = generic but higher-level. Anything domain-specific → the feature.

---

## 7. `src/services/` (global integrations)

Global, domain-agnostic IO. Domain services live in the feature (`features/devices/services/device.service.ts`).

```txt
services/
├── api/          # axios.ts, interceptors.ts, queryClient.ts, api.types.ts
├── realtime/     # socket.ts, socket.types.ts, realtime.service.ts
├── storage/      # storage.ts, storage.keys.ts
├── database/     # realm.ts, schemas/, repositories/
├── notifications/
└── logger/
```

Services `MUST` isolate Axios, Socket.IO, Storage, and Realm, and `MUST NOT` depend on React components.

---

## 8. Other `src/` folders

```txt
hooks/      useAppTheme, useDebounce, useNetworkStatus, useAppState   (feature-specific hooks stay in the feature)
store/      auth.store, app.store, theme.store, session.store         (NEVER hold API data)
theme/      tamagui.config, tokens, themes, fonts, animations, index
constants/  app.constants, routes.constants, queryKeys.constants, env.constants
utils/      date.util, currency.util, string.util, number.util, validation.util
types/      api.types, auth.types, navigation.types, common.types      (feature-specific types stay in the feature)
config/     env, app.config, feature-flags
```

---

## 9. Naming conventions

| Item | Case | Example |
|---|---|---|
| Components & screens | PascalCase | `DeviceCard.tsx`, `LoginScreen.tsx`, `AppHeader.tsx` |
| Services, hooks, utils, stores, schemas | camelCase / kebab with suffix | `device.service.ts`, `useDevices.ts`, `date.util.ts`, `auth.store.ts`, `device.schema.ts` |

---

## 10. Layer responsibilities

- **Screens** (`features/*/screens`): consume hooks, compose components, handle loading/error/empty. `NEVER` call the API directly; `NEVER` hold heavy logic.
- **Components**: small, single-responsibility, props-driven. `NEVER` access services directly; `NEVER` contain business logic.
- **Hooks**: centralize API calls and state logic; return tela-ready data; separate logic from UI.
- **Services**: perform external communication; isolate Axios/Socket.IO/Storage/Realm; framework-agnostic (no React).
