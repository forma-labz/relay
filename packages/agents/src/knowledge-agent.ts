import type { Agent } from './types.js';

export const knowledgeAgent: Agent = {
  id: 'knowledge',
  canHandle(intent) {
    return intent === 'knowledge_qa' || intent === 'general';
  },
  async run(ctx, step) {
    const tool = step.tool ?? 'knowledge.qa';
    const result = await ctx.executor.invoke({
      userId: ctx.userId,
      server: step.server ?? 'notion-mock',
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
