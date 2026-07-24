import type { AgentId, IntentKind, PlanStep, ToolResult } from '@relay/shared';
import type { McpExecutor } from '@relay/mcp-core';

export interface AgentContext {
  userId: string;
  executor: McpExecutor;
  approved?: boolean;
  memoryHints?: Record<string, unknown>;
}

export interface Agent {
  id: AgentId;
  canHandle(intent: IntentKind): boolean;
  run(ctx: AgentContext, step: PlanStep): Promise<{ step: PlanStep; toolResult?: ToolResult }>;
}
