import { z } from 'zod';

import { AgentIdSchema, ExecutionPlanSchema, IntentKindSchema } from './agents.js';
import { MemoryRecordSchema } from './memory.js';
import { McpServerDescriptorSchema, ToolResultSchema } from './mcp.js';

export const AiActionTypeSchema = z.enum([
  'summary',
  'draft',
  'rewrite',
  'tasks',
  'notes',
  'reply',
]);

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  userId: z.string().default('demo-user'),
  conversationId: z.string().optional(),
  history: z.array(ChatMessageSchema).default([]),
  approveActionId: z.string().optional(),
});

export const TraceStepSchema = z.object({
  stepId: z.string(),
  agent: AgentIdSchema,
  description: z.string(),
  server: z.string().optional(),
  tool: z.string().optional(),
  status: z.string(),
});

export const PendingApprovalSchema = z.object({
  id: z.string(),
  description: z.string(),
  server: z.string(),
  tool: z.string(),
  arguments: z.record(z.string(), z.unknown()),
});

export const ChatResponseSchema = z.object({
  message: z.string(),
  conversationId: z.string(),
  intent: IntentKindSchema,
  plan: ExecutionPlanSchema.optional(),
  trace: z.array(TraceStepSchema).default([]),
  toolResults: z.array(ToolResultSchema).default([]),
  pendingApprovals: z.array(PendingApprovalSchema).default([]),
  model: z.string().optional(),
});

export const ActionRequestSchema = z.object({
  type: AiActionTypeSchema,
  label: z.string().optional(),
  userId: z.string().default('demo-user'),
  conversationId: z.string().optional(),
  context: z.string().optional(),
});

export const ActionResponseSchema = ChatResponseSchema;

export const MemoryListResponseSchema = z.object({
  memories: z.array(MemoryRecordSchema),
});

export const McpServersResponseSchema = z.object({
  servers: z.array(McpServerDescriptorSchema),
});

export type AiActionType = z.infer<typeof AiActionTypeSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type TraceStep = z.infer<typeof TraceStepSchema>;
export type PendingApproval = z.infer<typeof PendingApprovalSchema>;
export type ActionRequest = z.infer<typeof ActionRequestSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
