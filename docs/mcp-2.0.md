# Relay MCP 2.0

Relay treats MCP as the capability operating system. The mobile app speaks natural language to the **Relay AI Orchestrator**, which plans work, routes to specialist agents, and executes through a discoverable **MCP Registry**.

## Layout

```
apps/mobile     Expo client (AI tab → /v1/ai/*)
apps/api        Hono orchestrator + model router + memory
packages/shared Zod contracts (MCP, plans, chat API)
packages/mcp-core Registry, executor, mock MCP servers
packages/agents Specialist agents (email, calendar, docs, …)
```

## Request flow

1. User message hits `POST /v1/ai/chat` (or quick action → `POST /v1/ai/actions`).
2. Planner classifies intent and builds an `ExecutionPlan`.
3. Orchestrator runs each step via the matching agent.
4. Agents invoke MCP tools through `McpExecutor` (approval-gated when mutating).
5. Model router composes the final reply (`mock` without API keys).
6. Conversation + workflow crumbs are stored in memory (in-memory by default; Postgres schema in `supabase/migrations`).

## Mock MCP servers

Registered at API boot:

| Server          | Example tools                                   |
| --------------- | ----------------------------------------------- |
| `gmail-mock`    | `inbox.prioritize`, `email.draft`, `email.send` |
| `slack-mock`    | `messages.search`, `messages.summarize`         |
| `calendar-mock` | `events.find_free_times`, `events.create`       |
| `drive-mock`    | `files.search`, `files.summarize`               |
| `notion-mock`   | `knowledge.search`, `knowledge.qa`              |
| `crm-mock`      | `contacts.find`                                 |

Inspect live descriptors: `GET /v1/mcp/servers`.

## Adding a mock MCP server

1. Create `packages/mcp-core/src/mocks/<name>.ts` with `createMockServer(...)`.
2. Register it in `packages/mcp-core/src/bootstrap.ts`.
3. Optionally teach the planner new intents in `apps/api/src/orchestrator/planner.ts`.
4. Wire a specialist agent in `packages/agents` if the capability needs coordination logic.

## Memory scopes

- **personal** — writing style, signature, preferences
- **company** — clients, projects, SOPs
- **conversation** — decisions, action items, deadlines, last workflow

Demo seed loads Jordan/Atlas context via `MemoryStore.seedDemo()`.

## Approvals

Mutating tools (`email.send`, `events.create`, `messages.send`) return `needsApproval` unless `approved: true`. The chat response includes `pendingApprovals`; the client can retry with `approveActionId`.

## Model router

Task classes (`email_write`, `summarize`, `reason`, `fast`, …) map to providers. Without `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`, all completions use the deterministic `mock` provider so tests and demos work offline.

## Out of scope (this foundation)

Marketplace publishing, enterprise SSO/SCIM/RBAC, and live OAuth MCP connectors are intentionally deferred.
