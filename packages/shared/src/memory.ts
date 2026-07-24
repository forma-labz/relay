import { z } from 'zod';

export const MemoryScopeSchema = z.enum(['personal', 'company', 'conversation']);

export const MemoryRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  scope: MemoryScopeSchema,
  key: z.string(),
  content: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MemoryScope = z.infer<typeof MemoryScopeSchema>;
export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;
