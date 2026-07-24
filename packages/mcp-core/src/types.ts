import type { McpServerDescriptor, McpTool, ToolResult } from '@relay/shared';

export type ToolHandler = (
  args: Record<string, unknown>,
  ctx: ToolContext,
) => Promise<unknown> | unknown;

export interface ToolContext {
  userId: string;
  approved?: boolean;
}

export interface RegisteredTool extends McpTool {
  handler: ToolHandler;
}

export interface RegisteredServer {
  descriptor: McpServerDescriptor;
  handlers: Map<string, ToolHandler>;
}

export interface InvokeOptions {
  userId: string;
  server: string;
  tool: string;
  arguments?: Record<string, unknown>;
  approved?: boolean;
  timeoutMs?: number;
  retries?: number;
}

export type InvokeOutcome = ToolResult;
