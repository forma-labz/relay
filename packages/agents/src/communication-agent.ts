import type { Agent } from './types.js';

export const communicationAgent: Agent = {
  id: 'communication',
  canHandle(intent) {
    return intent === 'summarize' || intent === 'meeting_notes' || intent === 'general';
  },
  async run(ctx, step) {
    const tool = step.tool ?? 'messages.summarize';
    const result = await ctx.executor.invoke({
      userId: ctx.userId,
      server: step.server ?? 'slack-mock',
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
