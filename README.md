# Relay

**Chat Fast. Email Professionally.**

Relay is a premium communication platform that unifies encrypted messaging,
email, a lightweight CRM, an AI copilot, and secure document management.
The product UI lives in an Expo app; AI capabilities are orchestrated through
an MCP-native Hono API (Relay MCP 2.0).

> The mobile workspace UI still uses realistic seed data for inbox/CRM/files.
> Auth, secure session persistence, email OAuth boundaries, push registration,
> and the Supabase schema are production-oriented and require deployed
> infrastructure before release.

## Monorepo layout

```
apps/mobile                  Expo Router app (iOS · Android · Web)
apps/api                     Hono Relay AI Orchestrator
packages/shared              Zod contracts (MCP, plans, chat API)
packages/mcp-core            MCP registry, executor, mock servers
packages/agents              Specialist agents
supabase/migrations          Postgres schema (messaging + AI memory)
docs/mcp-2.0.md              Architecture notes
```

## Tech stack

- **Mobile:** Expo Router 6 · React 19 · RN 0.81 · HeroUI Native · Uniwind · Zustand · Reanimated
- **API:** Hono · TypeScript · Drizzle schema · in-memory memory store (Postgres-ready)
- **AI:** Orchestrator + model router (OpenAI / Anthropic / mock) over MCP tools

## Local setup

1. `npm install` from the repo root.
2. Copy [`.env.example`](.env.example) values into `apps/mobile/.env.local` (and set API keys if desired).
3. Apply `supabase/migrations` to a Supabase project when using a real backend.
4. Start the API: `npm run api` (default `http://localhost:8787`).
5. Start Expo Go: `npm start` (set `EXPO_PUBLIC_RELAY_API_URL=http://localhost:8787`).

### Expo Go feature testing

```bash
# apps/mobile/.env.local
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_RELAY_API_URL=http://localhost:8787
```

Then run `npm start`, scan the QR code in Expo Go, and use any sign-in button
(demo mode simulates auth without Supabase). Keep the API running for live AI;
if it is unreachable, the AI tab falls back to canned local responses.

`npm start` defaults to Expo Go (`expo start --go`). Use
`npm run start:dev-client` only for custom native development builds.

## Useful scripts

| Command                    | Description                                |
| -------------------------- | ------------------------------------------ |
| `npm start` / `start:go`   | Expo Go dev server (`@relay/mobile`)       |
| `npm run start:dev-client` | Custom native dev-client Metro             |
| `npm run api`              | Hono API with watch                        |
| `npm test`                 | Mobile Jest + API/orchestrator node:test   |
| `npm run validate`         | Format, lint, typecheck, tests, expo-check |
| `npm run typecheck`        | All workspaces                             |

## Relay AI / MCP

See [docs/mcp-2.0.md](docs/mcp-2.0.md) for the orchestrator, registry, agents,
memory scopes, and how to add a mock MCP server.

Quick checks:

- `GET /health`
- `GET /v1/mcp/servers`
- `POST /v1/ai/chat` `{ "message": "Send John the latest proposal and arrange a meeting." }`

## Validation and release

- CI runs format, lint, typecheck, tests, and `expo-doctor` in `apps/mobile`.
- EAS workflows run from `apps/mobile` after root `npm ci`.

### EAS Build

1. Create an Expo project once from the app directory:
   `cd apps/mobile && npx eas-cli init`
2. Copy the project id into `EXPO_PUBLIC_EAS_PROJECT_ID` (local `.env.local` and GitHub/EAS secrets).
3. Set GitHub Actions secrets:
   - `EXPO_TOKEN` (Expo access token)
   - `EXPO_PUBLIC_EAS_PROJECT_ID`
   - `EXPO_OWNER` (Expo account/org slug)
   - optional app secrets: Supabase, OAuth, `EXPO_PUBLIC_RELAY_API_URL`
4. Trigger **EAS release** via Actions (`build` / `update` / `submit`) or run locally:
   - `npm run eas:build -w @relay/mobile`
   - `npm run eas:update -w @relay/mobile`
