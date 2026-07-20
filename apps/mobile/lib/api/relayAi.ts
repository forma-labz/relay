import { z } from 'zod';

import type { AiActionType } from '@/lib/types';
import { env } from '@/lib/env';

const TraceStepSchema = z.object({
  stepId: z.string(),
  agent: z.string(),
  description: z.string(),
  server: z.string().optional(),
  tool: z.string().optional(),
  status: z.string(),
});

const ChatResponseSchema = z.object({
  message: z.string(),
  conversationId: z.string(),
  intent: z.string(),
  trace: z.array(TraceStepSchema).default([]),
  pendingApprovals: z
    .array(
      z.object({
        id: z.string(),
        description: z.string(),
        server: z.string(),
        tool: z.string(),
      }),
    )
    .default([]),
  model: z.string().optional(),
});

export type RelayTraceStep = z.infer<typeof TraceStepSchema>;
export type RelayChatResponse = z.infer<typeof ChatResponseSchema>;

function baseUrl(): string | undefined {
  const url = env.relayApiUrl?.replace(/\/$/, '');
  return url || undefined;
}

async function parseResponse(res: Response): Promise<RelayChatResponse> {
  if (!res.ok) {
    throw new Error(`Relay API ${res.status}`);
  }
  const json: unknown = await res.json();
  return ChatResponseSchema.parse(json);
}

export async function chatWithRelayAi(input: {
  message: string;
  conversationId?: string;
  approveActionId?: string;
}): Promise<RelayChatResponse> {
  const root = baseUrl();
  if (!root) throw new Error('RELAY_API_URL not configured');

  const res = await fetch(`${root}/v1/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: input.message,
      userId: 'demo-user',
      conversationId: input.conversationId,
      approveActionId: input.approveActionId,
      history: [],
    }),
  });
  return parseResponse(res);
}

export async function runRelayAiAction(input: {
  type: AiActionType;
  label: string;
  conversationId?: string;
}): Promise<RelayChatResponse> {
  const root = baseUrl();
  if (!root) throw new Error('RELAY_API_URL not configured');

  const res = await fetch(`${root}/v1/ai/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: input.type,
      label: input.label,
      userId: 'demo-user',
      conversationId: input.conversationId,
    }),
  });
  return parseResponse(res);
}

export function formatTraceLine(trace: RelayTraceStep[]): string | undefined {
  const agents = [...new Set(trace.map((t) => t.agent).filter(Boolean))];
  if (!agents.length) return undefined;
  const label = agents.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(' + ');
  return `Used ${label}`;
}
