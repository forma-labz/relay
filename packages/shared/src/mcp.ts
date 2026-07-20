import { z } from 'zod';

export const McpAuthSchema = z.object({
  type: z.enum(['none', 'oauth2', 'api_key', 'bearer']),
  scopes: z.array(z.string()).default([]),
});

export const McpRateLimitsSchema = z.object({
  requestsPerMinute: z.number().int().positive().default(60),
  burst: z.number().int().positive().optional(),
});

export const McpToolSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  inputSchema: z.record(z.string(), z.unknown()).default({}),
  mutating: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  permissions: z.array(z.string()).default([]),
});

export const McpServerDescriptorSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  version: z.string().default('1.0.0'),
  tools: z.array(McpToolSchema),
  authentication: McpAuthSchema.default({ type: 'none', scopes: [] }),
  permissions: z.array(z.string()).default([]),
  rateLimits: McpRateLimitsSchema.default({ requestsPerMinute: 60 }),
  health: z.enum(['healthy', 'degraded', 'down']).default('healthy'),
});

export const ToolCallSchema = z.object({
  id: z.string(),
  server: z.string(),
  tool: z.string(),
  arguments: z.record(z.string(), z.unknown()).default({}),
});

export const ToolResultSchema = z.object({
  callId: z.string(),
  server: z.string(),
  tool: z.string(),
  ok: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  needsApproval: z.boolean().optional(),
});

export type McpAuth = z.infer<typeof McpAuthSchema>;
export type McpRateLimits = z.infer<typeof McpRateLimitsSchema>;
export type McpTool = z.infer<typeof McpToolSchema>;
export type McpServerDescriptor = z.infer<typeof McpServerDescriptorSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type ToolResult = z.infer<typeof ToolResultSchema>;
