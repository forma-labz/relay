# Relay

**Chat Fast. Email Professionally.**

Relay is a premium communication platform that unifies encrypted messaging,
email, a lightweight CRM, an AI copilot, and secure document management into a
single Expo React Native app. Built with a glassmorphism, dark-first design
language inspired by Apple, Linear, Superhuman, Arc, and Notion.

> The workspace UI currently uses realistic seed data. Authentication, secure
> session persistence, email OAuth boundaries, push registration, and the
> Supabase schema are production-oriented and require deployed infrastructure
> and provider credentials before release.

## Tech stack

- Expo Router 6 (file-based routing) · React 19 · React Native 0.81
- TypeScript throughout
- HeroUI Native + Uniwind (Tailwind for RN) for UI and theming
- Zustand for state (with AsyncStorage persistence where needed)
- Reanimated 4 + Gesture Handler for animation
- FlashList for virtualized lists
- Lucide icons · expo-blur (glass) · expo-linear-gradient · expo-haptics

## Folder structure

```
app/                         Expo Router screens
  index.tsx                  Animated splash + routing gate
  welcome.tsx                Onboarding carousel
  auth.tsx                   Sign-in (Google/Microsoft/Apple/Phone/Biometric)
  connect-email.tsx          Link Gmail / Outlook / IMAP
  search.tsx                 Global search (modal)
  notifications.tsx          Unified notifications (modal)
  conversation/[id].tsx      Unified chat + email thread
  contact/[id].tsx           Full CRM contact profile
  (tabs)/                    Inbox · Contacts · Compose · Files · AI · Settings
components/                  Reusable UI (GlassCard, GradientBackground, RelayLogo, …)
lib/
  types.ts                   Domain models
  mockData.ts                Seed data
  stores/                    Zustand stores (inbox, contacts, files, ai, settings, …)
  fileIcon.ts, haptics.ts, utils.ts
global.css                   Design tokens (dark default + light theme)
```

## Theming

`global.css` owns the palette. Dark is the default; a light theme and `system`
option are toggled from **Settings → Appearance** and persisted. Brand color is
`--accent` (#2563FF) with a #6B4EFF secondary and #38BDF8 sky accent.

## Wiring a real backend

- **Auth / DB / Storage:** connect Supabase, then replace the simulated flows in
  `app/auth.tsx` and the seed data in `lib/mockData.ts` with live queries.
- **AI:** swap the canned responses in `lib/stores/aiStore.ts` for OpenAI calls.
- **Email:** integrate Gmail/Outlook/IMAP sync behind the inbox store.

## Local setup

1. Copy `.env.example` to `.env.local` and provide the public Supabase/EAS IDs.
2. Run `npm install`.
3. Apply `supabase/migrations` to a Supabase project.
4. Run `npm start` for Expo Go-compatible development, or create a development
   build for notifications, biometrics, secure storage, and native maps.

`EXPO_PUBLIC_DEMO_MODE=true` permits simulated sign-in and account connection
only in development. Production builds always require real backend sessions.

## Validation and release

- `npm run validate` runs formatting, lint, CSS lint, TypeScript, unit tests,
  and Expo dependency checks.
- `eas.json` defines development, preview, internal, simulator, and production
  profiles.
- CI validates every pull request. The manually dispatched EAS workflow builds,
  submits, or publishes an update using the repository `EXPO_TOKEN` secret.
