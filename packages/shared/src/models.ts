import { z } from 'zod';

export const ModelTaskSchema = z.enum([
  'email_write',
  'reason',
  'summarize',
  'fast',
  'code',
  'long_document',
  'research',
  'private',
]);

export const ModelProviderSchema = z.enum([
  'mock',
  'openai',
  'anthropic',
  'gemini',
  'grok',
  'llama',
]);

export type ModelTask = z.infer<typeof ModelTaskSchema>;
export type ModelProvider = z.infer<typeof ModelProviderSchema>;

export const DEFAULT_ROUTING: Record<ModelTask, ModelProvider> = {
  email_write: 'openai',
  reason: 'anthropic',
  summarize: 'openai',
  fast: 'grok',
  code: 'anthropic',
  long_document: 'gemini',
  research: 'openai',
  private: 'llama',
};
