import { z } from 'zod';

export const AgentIdSchema = z.enum([
  'email',
  'communication',
  'calendar',
  'document',
  'knowledge',
  'security',
]);

export const IntentKindSchema = z.enum([
  'summarize',
  'draft_email',
  'send_email',
  'schedule_meeting',
  'find_file',
  'knowledge_qa',
  'extract_tasks',
  'meeting_notes',
  'rewrite',
  'reply',
  'multi_step',
  'general',
]);

export const PlanStepStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'needs_approval',
  'skipped',
]);

export const PlanStepSchema = z.object({
  id: z.string(),
  agent: AgentIdSchema,
  intent: IntentKindSchema,
  description: z.string(),
  server: z.string().optional(),
  tool: z.string().optional(),
  arguments: z.record(z.string(), z.unknown()).default({}),
  status: PlanStepStatusSchema.default('pending'),
  result: z.unknown().optional(),
  error: z.string().optional(),
});

export const ExecutionPlanSchema = z.object({
  id: z.string(),
  intent: IntentKindSchema,
  summary: z.string(),
  steps: z.array(PlanStepSchema),
});

export type AgentId = z.infer<typeof AgentIdSchema>;
export type IntentKind = z.infer<typeof IntentKindSchema>;
export type PlanStepStatus = z.infer<typeof PlanStepStatusSchema>;
export type PlanStep = z.infer<typeof PlanStepSchema>;
export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
