import { DEFAULT_ROUTING, type ModelProvider, type ModelTask } from '@relay/shared';

export interface CompleteRequest {
  task: ModelTask;
  system?: string;
  prompt: string;
}

export interface CompleteResult {
  text: string;
  provider: ModelProvider;
  model: string;
}

const PROVIDERS: ModelProvider[] = ['mock', 'openai', 'anthropic', 'gemini', 'grok', 'llama'];

function envProvider(task: ModelTask): ModelProvider {
  const raw = process.env[`RELAY_MODEL_${task.toUpperCase()}`];
  if (raw && (PROVIDERS as string[]).includes(raw)) return raw as ModelProvider;

  const preferred = DEFAULT_ROUTING[task];
  if (preferred === 'openai' && process.env.OPENAI_API_KEY) return 'openai';
  if (preferred === 'anthropic' && process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (preferred === 'gemini' && process.env.GEMINI_API_KEY) return 'gemini';
  return 'mock';
}

function mockComplete(req: CompleteRequest): CompleteResult {
  const trimmed = req.prompt.slice(0, 280);
  let text: string;
  switch (req.task) {
    case 'email_write':
      text = `Draft:\n\n${trimmed}\n\n— Jordan`;
      break;
    case 'summarize':
      text = `Summary:\n${trimmed}`;
      break;
    case 'reason':
      text = `Plan:\n1. Understand the request\n2. Use the right MCP tools\n3. Confirm sensitive actions\n\nContext: ${trimmed}`;
      break;
    default:
      text = trimmed;
  }
  return { text, provider: 'mock', model: 'mock-relay-1' };
}

async function openaiComplete(req: CompleteRequest): Promise<CompleteResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return mockComplete(req);
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(req.system ? [{ role: 'system', content: req.system }] : []),
        { role: 'user', content: req.prompt },
      ],
      temperature: 0.4,
    }),
  });
  if (!res.ok) return mockComplete(req);
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) return mockComplete(req);
  return { text, provider: 'openai', model };
}

async function anthropicComplete(req: CompleteRequest): Promise<CompleteResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return mockComplete(req);
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: req.system,
      messages: [{ role: 'user', content: req.prompt }],
    }),
  });
  if (!res.ok) return mockComplete(req);
  const json = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = json.content?.find((c) => c.type === 'text')?.text?.trim();
  if (!text) return mockComplete(req);
  return { text, provider: 'anthropic', model };
}

export class ModelRouter {
  async complete(req: CompleteRequest): Promise<CompleteResult> {
    const provider = envProvider(req.task);
    switch (provider) {
      case 'openai':
        return openaiComplete(req);
      case 'anthropic':
        return anthropicComplete(req);
      default:
        return mockComplete(req);
    }
  }
}

export const modelRouter = new ModelRouter();
