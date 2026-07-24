import type { Agent } from './types.js';

export const calendarAgent: Agent = {
  id: 'calendar',
  canHandle(intent) {
    return intent === 'schedule_meeting' || intent === 'multi_step';
  },
  async run(ctx, step) {
    const tool = step.tool ?? 'events.find_free_times';
    const result = await ctx.executor.invoke({
      userId: ctx.userId,
      server: step.server ?? 'calendar-mock',
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
