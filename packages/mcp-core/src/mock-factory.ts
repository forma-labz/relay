import type { McpServerDescriptor, McpTool } from '@relay/shared';

import type { ToolHandler } from './types.js';

export interface MockToolDef {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  permissions?: string[];
  mutating?: boolean;
  requiresApproval?: boolean;
  handler: ToolHandler;
}

export function createMockServer(
  name: string,
  description: string,
  tools: MockToolDef[],
  extras?: Partial<
    Pick<
      McpServerDescriptor,
      'version' | 'authentication' | 'permissions' | 'rateLimits' | 'health'
    >
  >,
): { descriptor: McpServerDescriptor; handlers: Record<string, ToolHandler> } {
  const descriptor: McpServerDescriptor = {
    name,
    description,
    version: extras?.version ?? '1.0.0',
    tools: tools.map((tool): McpTool => {
      const { handler: _handler, ...meta } = tool;
      return {
        name: meta.name,
        description: meta.description,
        inputSchema: meta.inputSchema ?? {},
        permissions: meta.permissions ?? [],
        mutating: meta.mutating ?? false,
        requiresApproval: meta.requiresApproval ?? false,
      };
    }),
    authentication: extras?.authentication ?? { type: 'none', scopes: [] },
    permissions: extras?.permissions ?? [],
    rateLimits: extras?.rateLimits ?? { requestsPerMinute: 60 },
    health: extras?.health ?? 'healthy',
  };

  const handlers: Record<string, ToolHandler> = {};
  for (const tool of tools) {
    handlers[tool.name] = tool.handler;
  }

  return { descriptor, handlers };
}
