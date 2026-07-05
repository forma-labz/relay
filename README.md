# Relay

**Chat Fast. Email Professionally.**

Relay is a premium communication platform that unifies encrypted messaging,
email, a lightweight CRM, an AI copilot, and secure document management into a
single Expo React Native app. Built with a glassmorphism, dark-first design
language inspired by Apple, Linear, Superhuman, Arc, and Notion.

> This build is a **production-ready front end with realistic mocked data**.
> Auth providers, email sync (Gmail/Outlook/IMAP), Signal encryption, and OpenAI
> are simulated and ready to wire to a real backend (Supabase + OpenAI recommended).

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
