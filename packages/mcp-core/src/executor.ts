import type { McpRegistry } from './registry.js';
import type { InvokeOptions, InvokeOutcome } from './types.js';

function uid(prefix = 'call'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Tool timed out after ${timeoutMs}ms`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export class McpExecutor {
  constructor(private readonly registry: McpRegistry) {}

  async invoke(options: InvokeOptions): Promise<InvokeOutcome> {
    const callId = uid();
    const server = this.registry.get(options.server);
    if (!server) {
      return {
        callId,
        server: options.server,
        tool: options.tool,
        ok: false,
        error: `Unknown MCP server: ${options.server}`,
      };
    }

    if (server.descriptor.health === 'down') {
      return {
        callId,
        server: options.server,
        tool: options.tool,
        ok: false,
        error: `MCP server ${options.server} is down`,
      };
    }

    const toolMeta = server.descriptor.tools.find((t) => t.name === options.tool);
    const handler = server.handlers.get(options.tool);
    if (!toolMeta || !handler) {
      return {
        callId,
        server: options.server,
        tool: options.tool,
        ok: false,
        error: `Unknown tool: ${options.server}.${options.tool}`,
      };
    }

    if (toolMeta.requiresApproval && !options.approved) {
      return {
        callId,
        server: options.server,
        tool: options.tool,
        ok: false,
        needsApproval: true,
        data: {
          description: `${options.server}.${options.tool}`,
          arguments: options.arguments ?? {},
        },
        error: 'Approval required before executing this tool',
      };
    }

    const retries = options.retries ?? 1;
    const timeoutMs = options.timeoutMs ?? 8_000;
    let lastError: string | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const data = await withTimeout(
          Promise.resolve(
            handler(options.arguments ?? {}, {
              userId: options.userId,
              approved: options.approved,
            }),
          ),
          timeoutMs,
        );
        return {
          callId,
          server: options.server,
          tool: options.tool,
          ok: true,
          data,
        };
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    return {
      callId,
      server: options.server,
      tool: options.tool,
      ok: false,
      error: lastError ?? 'Unknown tool error',
    };
  }
}
