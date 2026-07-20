import type { McpServerDescriptor } from '@relay/shared';

import type { RegisteredServer, ToolHandler } from './types.js';

export class McpRegistry {
  private readonly servers = new Map<string, RegisteredServer>();

  register(descriptor: McpServerDescriptor, handlers: Record<string, ToolHandler>): void {
    const handlerMap = new Map<string, ToolHandler>();
    for (const tool of descriptor.tools) {
      const handler = handlers[tool.name];
      if (!handler) {
        throw new Error(`Missing handler for tool ${descriptor.name}.${tool.name}`);
      }
      handlerMap.set(tool.name, handler);
    }
    this.servers.set(descriptor.name, { descriptor, handlers: handlerMap });
  }

  list(): McpServerDescriptor[] {
    return [...this.servers.values()].map((s) => s.descriptor);
  }

  get(name: string): RegisteredServer | undefined {
    return this.servers.get(name);
  }

  has(name: string): boolean {
    return this.servers.has(name);
  }

  health(name: string): McpServerDescriptor['health'] | undefined {
    return this.servers.get(name)?.descriptor.health;
  }

  setHealth(name: string, health: McpServerDescriptor['health']): void {
    const server = this.servers.get(name);
    if (!server) return;
    server.descriptor = { ...server.descriptor, health };
  }
}
