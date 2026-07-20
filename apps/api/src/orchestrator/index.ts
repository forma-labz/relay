import { createAgentRegistry, type Agent } from '@relay/agents';
import { createDefaultRegistry, type McpExecutor, type McpRegistry } from '@relay/mcp-core';
import type {
  ActionRequest,
  ChatRequest,
  ChatResponse,
  ExecutionPlan,
  PendingApproval,
  ToolResult,
  TraceStep,
} from '@relay/shared';

import { memoryStore, type MemoryStore } from '../memory/store.js';
import { modelRouter, type ModelRouter } from '../models/router.js';
import { buildPlan, classifyIntent } from './planner.js';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

export class RelayOrchestrator {
  readonly registry: McpRegistry;
  readonly executor: McpExecutor;
  private readonly agents: Map<string, Agent>;

  constructor(
    private readonly memory: MemoryStore = memoryStore,
    private readonly models: ModelRouter = modelRouter,
    boot = createDefaultRegistry(),
  ) {
    this.registry = boot.registry;
    this.executor = boot.executor;
    this.agents = createAgentRegistry();
  }

  listServers() {
    return this.registry.list();
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const conversationId = this.memory.ensureConversation(req.userId, req.conversationId);
    this.memory.appendMessage(conversationId, 'user', req.message);

    if (req.approveActionId) {
      return this.approveAndContinue(req, conversationId);
    }

    const intent = classifyIntent(req.message);
    const plan = buildPlan(req.message, intent);
    return this.executePlan(req.userId, conversationId, plan, req.message);
  }

  async action(req: ActionRequest): Promise<ChatResponse> {
    const conversationId = this.memory.ensureConversation(req.userId, req.conversationId);
    const label = req.label ?? req.type;
    this.memory.appendMessage(conversationId, 'user', label);

    const intentMap = {
      summary: 'summarize',
      draft: 'draft_email',
      rewrite: 'rewrite',
      tasks: 'extract_tasks',
      notes: 'meeting_notes',
      reply: 'reply',
    } as const;

    const intent = intentMap[req.type];
    const plan = buildPlan(req.context ?? label, intent);
    return this.executePlan(req.userId, conversationId, plan, label);
  }

  private async approveAndContinue(
    req: ChatRequest,
    conversationId: string,
  ): Promise<ChatResponse> {
    const approval = this.memory.getApproval(req.approveActionId!);
    if (!approval || approval.status !== 'pending') {
      return {
        message: 'No pending approval found for that action.',
        conversationId,
        intent: 'general',
        trace: [],
        toolResults: [],
        pendingApprovals: [],
      };
    }

    this.memory.markApproval(approval.id, 'approved');
    const result = await this.executor.invoke({
      userId: req.userId,
      server: approval.server,
      tool: approval.tool,
      arguments: approval.arguments,
      approved: true,
    });
    this.memory.markApproval(approval.id, result.ok ? 'executed' : 'rejected');

    const message = result.ok
      ? `Approved and executed ${approval.server}.${approval.tool}.`
      : `Approval failed: ${result.error ?? 'unknown error'}`;
    this.memory.appendMessage(conversationId, 'assistant', message);

    return {
      message,
      conversationId,
      intent: 'send_email',
      trace: [
        {
          stepId: 'approval',
          agent: 'email',
          description: approval.description,
          server: approval.server,
          tool: approval.tool,
          status: result.ok ? 'completed' : 'failed',
        },
      ],
      toolResults: [result],
      pendingApprovals: [],
      model: 'mock-relay-1',
    };
  }

  private async executePlan(
    userId: string,
    conversationId: string,
    plan: ExecutionPlan,
    userMessage: string,
  ): Promise<ChatResponse> {
    const memories = this.memory.list(userId);
    const toolResults: ToolResult[] = [];
    const pendingApprovals: PendingApproval[] = [];
    const trace: TraceStep[] = [];
    const completedSteps = [];

    for (const rawStep of plan.steps) {
      const agent = this.agents.get(rawStep.agent);
      if (!agent) {
        completedSteps.push({ ...rawStep, status: 'failed' as const, error: 'Unknown agent' });
        trace.push({
          stepId: rawStep.id,
          agent: rawStep.agent,
          description: rawStep.description,
          status: 'failed',
        });
        continue;
      }

      // Enrich email draft recipient from CRM lookup if available
      let step = rawStep;
      if (step.tool === 'email.draft' || step.tool === 'email.send') {
        const contactResult = toolResults.find((r) => r.tool === 'contacts.find' && r.ok);
        const contact = asRecord(asRecord(contactResult?.data).contact);
        if (contact.email && step.tool === 'email.draft') {
          step = {
            ...step,
            arguments: { ...step.arguments, to: asString(contact.email) },
          };
        }
        if (contact.email && step.tool === 'email.send') {
          const draft = toolResults.find((r) => r.tool === 'email.draft' && r.ok);
          const draftData = asRecord(draft?.data);
          step = {
            ...step,
            arguments: {
              ...step.arguments,
              to: asString(contact.email),
              subject: asString(draftData.subject ?? step.arguments.subject, 'Follow-up'),
              body: asString(draftData.body ?? step.arguments.body),
            },
          };
        }
      }

      if (step.tool === 'email.draft') {
        const fileResult = toolResults.find((r) => r.tool === 'files.search' && r.ok);
        const results = asRecord(fileResult?.data).results;
        const first = Array.isArray(results) ? asRecord(results[0]) : {};
        if (first.name) {
          step = {
            ...step,
            arguments: { ...step.arguments, attachment: asString(first.name) },
          };
        }
      }

      const { step: done, toolResult } = await agent.run(
        {
          userId,
          executor: this.executor,
          memoryHints: { memories },
        },
        step,
      );

      completedSteps.push(done);
      if (toolResult) toolResults.push(toolResult);

      trace.push({
        stepId: done.id,
        agent: done.agent,
        description: done.description,
        server: done.server,
        tool: done.tool,
        status: done.status,
      });

      if (toolResult?.needsApproval) {
        const approvalId = this.memory.createApproval({
          userId,
          conversationId,
          server: toolResult.server,
          tool: toolResult.tool,
          arguments: asRecord(asRecord(toolResult.data).arguments),
          description: done.description,
        });
        pendingApprovals.push({
          id: approvalId,
          description: done.description,
          server: toolResult.server,
          tool: toolResult.tool,
          arguments: asRecord(asRecord(toolResult.data).arguments),
        });
        // Stop before further mutating steps
        break;
      }
    }

    const finalPlan: ExecutionPlan = { ...plan, steps: completedSteps };
    const composed = await this.composeResponse(
      userMessage,
      finalPlan,
      toolResults,
      pendingApprovals,
    );
    this.memory.appendMessage(conversationId, 'assistant', composed.text);

    // Persist conversation memory crumbs for multi-step runs
    if (plan.intent === 'multi_step') {
      this.memory.upsert(userId, 'conversation', 'last_workflow', {
        summary: plan.summary,
        pendingApprovals: pendingApprovals.map((p) => p.id),
        followUp: 'Remind after 3 days',
      });
    }

    return {
      message: composed.text,
      conversationId,
      intent: plan.intent,
      plan: finalPlan,
      trace,
      toolResults,
      pendingApprovals,
      model: composed.model,
    };
  }

  private async composeResponse(
    userMessage: string,
    plan: ExecutionPlan,
    toolResults: ToolResult[],
    pendingApprovals: PendingApproval[],
  ): Promise<{ text: string; model: string }> {
    const memories = this.memory.list('demo-user');
    const style = memories.find((m) => m.key === 'writing_style')?.content;

    if (pendingApprovals.length) {
      const draft = toolResults.find((r) => r.tool === 'email.draft' && r.ok);
      const draftData = asRecord(draft?.data);
      const slots = toolResults.find((r) => r.tool === 'events.find_free_times' && r.ok);
      const slotData = asRecord(slots?.data);
      const free = Array.isArray(slotData.slots) ? slotData.slots : [];
      const lines = [
        `I prepared this workflow: ${plan.summary}.`,
        '',
        draftData.body ? `Draft ready:\n\n${asString(draftData.body)}` : null,
        free.length
          ? `\nSuggested meeting times:\n${free
              .slice(0, 2)
              .map((s) => {
                const slot = asRecord(s);
                return `• ${asString(slot.start)} → ${asString(slot.end)}`;
              })
              .join('\n')}`
          : null,
        '',
        `Approval needed before I ${pendingApprovals.map((p) => p.description.toLowerCase()).join(' / ')}.`,
        'Reply with approval to continue (client can POST approveActionId).',
      ].filter(Boolean);
      return { text: lines.join('\n'), model: 'mock-relay-1' };
    }

    if (plan.intent === 'summarize') {
      const prioritized = toolResults.find((r) => r.tool === 'inbox.prioritize');
      const highlights = asRecord(prioritized?.data).highlights;
      const items = Array.isArray(highlights) ? highlights : [];
      const body = items
        .map((h) => {
          const row = asRecord(h);
          return `• ${asString(row.from)} — ${asString(row.subject)} (${asString(row.urgency)})`;
        })
        .join('\n');
      const completion = await this.models.complete({
        task: 'summarize',
        prompt: `Inbox highlights:\n${body || 'No unread items.'}`,
      });
      return { text: completion.text, model: completion.model };
    }

    if (plan.intent === 'draft_email' || plan.intent === 'reply' || plan.intent === 'rewrite') {
      const draft = toolResults.find((r) => r.tool === 'email.draft');
      const draftData = asRecord(draft?.data);
      const completion = await this.models.complete({
        task: 'email_write',
        system: `Write in this style: ${JSON.stringify(style ?? {})}`,
        prompt: asString(draftData.body, userMessage),
      });
      return { text: completion.text, model: completion.model };
    }

    if (plan.intent === 'knowledge_qa') {
      const qa = toolResults.find((r) => r.tool === 'knowledge.qa');
      const data = asRecord(qa?.data);
      const citations = Array.isArray(data.citations) ? data.citations : [];
      const cite = citations
        .map((c) => {
          const row = asRecord(c);
          return row.title ? `[${asString(row.title)}]` : null;
        })
        .filter(Boolean)
        .join(' ');
      return {
        text: `${asString(data.answer, 'I could not find an answer.')}${cite ? `\n\nSources: ${cite}` : ''}`,
        model: 'mock-relay-1',
      };
    }

    if (plan.intent === 'extract_tasks') {
      const atlas = memories.find((m) => m.key === 'atlas_thread')?.content;
      const items = Array.isArray(atlas?.actionItems) ? atlas.actionItems : [];
      return {
        text: `Action items:\n${items.map((i, idx) => `${idx + 1}. ${asString(i)}`).join('\n') || '1. Follow up on open threads'}`,
        model: 'mock-relay-1',
      };
    }

    if (plan.intent === 'meeting_notes') {
      const atlas = memories.find((m) => m.key === 'atlas_thread')?.content;
      return {
        text: [
          'Meeting notes — Atlas sync:',
          '',
          `Decisions: ${Array.isArray(atlas?.decisions) ? atlas.decisions.join('; ') : 'n/a'}`,
          `Next steps: ${Array.isArray(atlas?.actionItems) ? atlas.actionItems.join('; ') : 'n/a'}`,
          `Deadlines: ${Array.isArray(atlas?.deadlines) ? atlas.deadlines.join('; ') : 'n/a'}`,
        ].join('\n'),
        model: 'mock-relay-1',
      };
    }

    if (plan.intent === 'find_file') {
      const files = toolResults.find((r) => r.tool === 'files.search');
      const results = asRecord(files?.data).results;
      const list = Array.isArray(results) ? results : [];
      return {
        text: `Found ${list.length} file(s):\n${list
          .map((f) => {
            const row = asRecord(f);
            return `• ${asString(row.name)} (${asString(row.path)})`;
          })
          .join('\n')}`,
        model: 'mock-relay-1',
      };
    }

    if (plan.intent === 'schedule_meeting') {
      const created = toolResults.find((r) => r.tool === 'events.create' && r.ok);
      if (created) {
        const data = asRecord(created.data);
        return {
          text: `Invite created: ${asString(data.title)} at ${asString(data.start)}.`,
          model: 'mock-relay-1',
        };
      }
      const slots = toolResults.find((r) => r.tool === 'events.find_free_times');
      const free = asRecord(slots?.data).slots;
      const list = Array.isArray(free) ? free : [];
      return {
        text: `Open slots:\n${list
          .map((s) => {
            const row = asRecord(s);
            return `• ${asString(row.start)} → ${asString(row.end)}`;
          })
          .join('\n')}\n\nApproval required to create the invite.`,
        model: 'mock-relay-1',
      };
    }

    if (plan.intent === 'multi_step') {
      const draft = toolResults.find((r) => r.tool === 'email.draft');
      const draftData = asRecord(draft?.data);
      return {
        text: [
          `Workflow complete through drafting: ${plan.summary}.`,
          draftData.body ? `\n${asString(draftData.body)}` : '',
          '\nSensitive send/calendar steps may still require approval.',
        ].join('\n'),
        model: 'mock-relay-1',
      };
    }

    const search = toolResults.find((r) => r.ok);
    const completion = await this.models.complete({
      task: 'fast',
      prompt: `User asked: ${userMessage}\nTool data: ${JSON.stringify(search?.data ?? {})}`,
    });
    return {
      text:
        completion.text ||
        "Here's a suggestion based on your recent threads. Want me to turn it into a send-ready draft?",
      model: completion.model,
    };
  }
}

export const orchestrator = new RelayOrchestrator();
