# Implementation Prompt — Build "Melhoria Visual App" from Design Handoff

You are a senior React Native engineer. Your job is to implement a design handoff
**pixel-perfectly**, organized strictly according to our existing architecture spec.

There are two authoritative inputs. Do not treat them as equal:

- **Architecture authority → `docs/technical-spec.md`.** This governs the stack, folder
  structure, naming, and all `MUST`/`NEVER` rules. The implementation MUST conform to it.
- **Visual authority → `design/melhoria-visual-app/`.** HTML/CSS/JS prototypes that define
  the exact look (layout, spacing, colors, typography, states). Recreate the _visual output_;
  do NOT copy the prototype's internal structure.

When the two could conflict (e.g. the prototype puts everything in one file), the **visuals
win for appearance** and the **spec wins for code organization**. Reconcile, never blindly copy.

---

## Step 1 — Load the architecture (do this first)

Read `docs/technical-spec.md` in full. Internalize, in particular:

- Stack: Expo + React Native + TypeScript, Expo Router, **Tamagui** (UI + tokens), Zustand
  (UI/session state only), TanStack React Query (all server data), Axios, React Hook Form + Zod,
  Lucide icons, Reanimated + Gesture Handler, Socket.IO (realtime), AsyncStorage, Realm.
- Folder model: `app/` = routes only; `src/features/<name>/` = vertical slices; `src/shared/`
  = design system + generic components; `src/services/` = global IO.
- Hard rules you must never break: no business logic in `app/`; no cross-feature imports; no
  API calls from screens/components (hook → service); no API data in Zustand; no loose style
  values (Tamagui tokens only).

If `docs/technical-spec.md` is missing or unreadable, STOP and tell the user before continuing.

---

## Step 2 — Analyze the design bundle

1. Read `design/melhoria-visual-app/README.md` for handoff context.
2. Read the primary file **`design/melhoria-visual-app/project/BE1 App.dc.html` top to bottom**
   — do not skim. It is almost certainly the main screen the user wants built.
3. **Follow its imports.** Open every file it pulls in (shared components, CSS, scripts) and any
   sibling prototype files in `project/`, so you understand the full system before implementing.
4. Do NOT render the files in a browser or take screenshots. Read the HTML/CSS source directly —
   all dimensions, colors, and layout rules are in the source.

Produce a **Design Inventory** (output it to the user before coding):

- **Screens** found and what each does.
- **Reusable UI primitives** (buttons, inputs, cards, badges, tabs, etc.) → candidates for
  `src/shared/ui/` as Tamagui components.
- **Composite/generic components** (headers, empty states, search inputs) → `src/shared/components/`.
- **Domain-specific components** → the relevant feature.
- **Design tokens**: exact color values, spacing scale, radii, font families/sizes/weights,
  shadows. These map 1:1 into `src/theme/tokens.ts` + Tamagui theme. Capture exact values —
  pixel-perfect.
- **States**: loading, empty, error, disabled, dark mode (if present in the prototype).

---

## Step 3 — Map design → architecture (output a plan, then ask)

Before writing code, produce a short mapping and a list of open questions:

- Each screen → its feature (`auth`, `dashboard`, `devices`, `groups`, `reports`, `alerts`,
  `profile`, `settings`) and its route file under `app/` (re-exporting the feature screen).
- Each reusable element → `shared/ui` vs `shared/components` vs feature component.
- Design tokens → the concrete token names you will add to the Tamagui theme.
- Any data shown in the design → which React Query hook + Zod schema + service will feed it.

**If anything is ambiguous (missing screen, unclear interaction, undefined data source,
unclear navigation), ASK the user to confirm before implementing.** Clarifying scope up front
is cheaper than building the wrong thing.

---

## Step 4 — Implement (only after the plan is confirmed)

Follow `docs/technical-spec.md` exactly:

- **Tokens first.** Translate the design's colors/spacing/typography into the Tamagui theme
  (`src/theme/`). Then build everything from tokens — never hardcode values.
- **Build `shared/ui` primitives** as Tamagui components matching the design, before screens.
- **Build screens as containers** in `features/*/screens/`: consume hooks, compose components,
  handle loading/error/empty states. No API calls, no heavy logic in the screen.
- **Wire routes** in `app/` as thin re-exports of feature screens; declare tabs in
  `app/(main)/_layout.tsx`; keep detail routes (`device/[id]`, `group/[id]`) full-screen.
- **Data**: React Query hooks → feature services (Axios). Validate responses with Zod.
- **Forms**: React Hook Form + Zod. **Icons**: Lucide. **Realtime**: Socket.IO via
  `services/realtime`, feeding the React Query cache (never a parallel state).
- **Accessibility**: every interactive element gets `accessibilityRole` + `accessibilityLabel`.
- Add only libraries listed in the spec.

---

## Definition of done

- Screens are visually faithful to the prototypes (layout, spacing, color, typography match).
- Code organization conforms to `docs/technical-spec.md` (folders, naming, layer rules).
- All values come from Tamagui tokens; zero hardcoded colors/spacing.
- No `MUST`/`NEVER` rule from the spec is violated.
- TypeScript compiles with no `any`; data is Zod-validated at the network boundary.

**Start now with Step 1 and Step 2, then output the Design Inventory and mapping plan, and
wait for confirmation before Step 4.**
