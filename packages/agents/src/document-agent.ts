import type { Agent } from './types.js';

export const documentAgent: Agent = {
  id: 'document',
  canHandle(intent) {
    return intent === 'find_file' || intent === 'multi_step';
  },
  async run(ctx, step) {
    const tool = step.tool ?? 'files.search';
    const result = await ctx.executor.invoke({
      userId: ctx.userId,
      server: step.server ?? 'drive-mock',
      tool,
      arguments: step.arguments,
      approved: ctx.approved,
    });
    return {
      step: {
        ...step,
        status: result.needsApproval ? 'needs_approval' : result.ok ? 'completed' : 'failed',
        result: result.data,
        error: result.error,
        server: result.server,
        tool: result.tool,
      },
      toolResult: result,
    };
  },
};
