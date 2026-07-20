import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ActionRequestSchema, ChatRequestSchema } from '@relay/shared';

import { memoryStore } from './memory/store.js';
import { orchestrator } from './orchestrator/index.js';

export function createApp() {
  const app = new Hono();

  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.get('/health', (c) =>
    c.json({
      ok: true,
      service: 'relay-api',
      mcpServers: orchestrator.listServers().length,
    }),
  );

  app.get('/v1/mcp/servers', (c) => c.json({ servers: orchestrator.listServers() }));

  app.get('/v1/memory', (c) => {
    const userId = c.req.query('userId') ?? 'demo-user';
    return c.json({ memories: memoryStore.list(userId) });
  });

  app.post('/v1/ai/chat', async (c) => {
    const body = await c.req.json();
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid request', details: parsed.error.flatten() }, 400);
    }
    const response = await orchestrator.chat(parsed.data);
    return c.json(response);
  });

  app.post('/v1/ai/actions', async (c) => {
    const body = await c.req.json();
    const parsed = ActionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid request', details: parsed.error.flatten() }, 400);
    }
    const response = await orchestrator.action(parsed.data);
    return c.json(response);
  });

  return app;
}

export type RelayApp = ReturnType<typeof createApp>;
