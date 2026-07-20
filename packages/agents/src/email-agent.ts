import type { Agent } from './types.js';

export const emailAgent: Agent = {
  id: 'email',
  canHandle(intent) {
    return (
      intent === 'draft_email' ||
      intent === 'send_email' ||
      intent === 'summarize' ||
      intent === 'reply' ||
      intent === 'rewrite'
    );
  },
  async run(ctx, step) {
    const tool =
      step.tool ??
      (step.intent === 'send_email'
        ? 'email.send'
        : step.intent === 'summarize'
          ? 'inbox.prioritize'
          : 'email.draft');
    const result = await ctx.executor.invoke({
      userId: ctx.userId,
      server: step.server ?? 'gmail-mock',
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
