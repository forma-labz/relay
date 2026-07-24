import type { ExecutionPlan, IntentKind, PlanStep } from '@relay/shared';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function step(
  partial: Omit<PlanStep, 'id' | 'status' | 'arguments'> & {
    arguments?: Record<string, unknown>;
  },
): PlanStep {
  return {
    id: uid('step'),
    status: 'pending',
    arguments: {},
    ...partial,
  };
}

export function classifyIntent(message: string): IntentKind {
  const m = message.toLowerCase();
  const hasSend = /\bsend\b/.test(m);
  const hasMeeting = /\b(meet|meeting|schedule|calendar|invite)\b/.test(m);
  const hasProposal = /\b(proposal|file|document|deck|pdf)\b/.test(m);
  const hasEmail = /\b(email|draft|reply|inbox)\b/.test(m);
  const hasKnowledge = /\b(policy|sop|how do|what is|wiki|notion)\b/.test(m);
  const hasTasks = /\b(task|action item|todo|to-do)\b/.test(m);
  const hasNotes = /\b(meeting notes|notes from)\b/.test(m);
  const hasSummarize = /\b(summarize|summary|highlights)\b/.test(m);

  if ((hasSend || hasEmail) && (hasMeeting || hasProposal)) return 'multi_step';
  if (hasSend && hasEmail) return 'send_email';
  if (hasMeeting) return 'schedule_meeting';
  if (hasProposal && /\b(find|latest|locate|get)\b/.test(m)) return 'find_file';
  if (hasKnowledge) return 'knowledge_qa';
  if (hasTasks) return 'extract_tasks';
  if (hasNotes) return 'meeting_notes';
  if (hasSummarize) return 'summarize';
  if (/\bdraft\b/.test(m)) return 'draft_email';
  if (/\brewrite\b/.test(m)) return 'rewrite';
  if (/\breply\b/.test(m)) return 'reply';
  return 'general';
}

function extractName(message: string): string | undefined {
  const match = message.match(
    /\b(?:send|email|message|to|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
  );
  if (match?.[1]) return match[1];
  const john = message.match(/\bjohn\b/i);
  if (john) return 'John';
  return undefined;
}

export function buildPlan(message: string, intent = classifyIntent(message)): ExecutionPlan {
  const who = extractName(message) ?? 'John';

  if (intent === 'multi_step' || (/\bsend\b/i.test(message) && /\bmeeting\b/i.test(message))) {
    return {
      id: uid('plan'),
      intent: 'multi_step',
      summary: `Send ${who} the latest proposal and arrange a meeting`,
      steps: [
        step({
          agent: 'document',
          intent: 'find_file',
          description: 'Find contact in CRM',
          server: 'crm-mock',
          tool: 'contacts.find',
          arguments: { query: who },
        }),
        step({
          agent: 'document',
          intent: 'find_file',
          description: 'Locate latest proposal in Drive',
          server: 'drive-mock',
          tool: 'files.search',
          arguments: { query: 'proposal' },
        }),
        step({
          agent: 'email',
          intent: 'draft_email',
          description: 'Draft email with proposal',
          server: 'gmail-mock',
          tool: 'email.draft',
          arguments: {
            to: who,
            topic: 'latest proposal',
            attachment: 'BrightPath_Proposal_v3.pdf',
          },
        }),
        step({
          agent: 'email',
          intent: 'send_email',
          description: 'Send email via Gmail',
          server: 'gmail-mock',
          tool: 'email.send',
          arguments: {
            to: `${who.toLowerCase().replace(/\s+/g, '.')}@brightpath.io`,
            subject: 'Latest proposal',
            body: 'Please find the latest proposal attached.',
          },
        }),
        step({
          agent: 'calendar',
          intent: 'schedule_meeting',
          description: 'Find free meeting times',
          server: 'calendar-mock',
          tool: 'events.find_free_times',
          arguments: { attendees: [who] },
        }),
        step({
          agent: 'calendar',
          intent: 'schedule_meeting',
          description: 'Create calendar invite',
          server: 'calendar-mock',
          tool: 'events.create',
          arguments: {
            title: `Proposal review with ${who}`,
            start: '2026-07-23T14:00:00Z',
            end: '2026-07-23T14:30:00Z',
            attendees: [who],
          },
        }),
      ],
    };
  }

  switch (intent) {
    case 'summarize':
      return {
        id: uid('plan'),
        intent,
        summary: 'Summarize inbox highlights',
        steps: [
          step({
            agent: 'email',
            intent,
            description: 'Prioritize unread inbox',
            server: 'gmail-mock',
            tool: 'inbox.prioritize',
          }),
        ],
      };
    case 'draft_email':
    case 'reply':
    case 'rewrite':
      return {
        id: uid('plan'),
        intent,
        summary: 'Draft a professional email',
        steps: [
          step({
            agent: 'email',
            intent: 'draft_email',
            description: 'Generate email draft',
            server: 'gmail-mock',
            tool: 'email.draft',
            arguments: { to: who, topic: message.slice(0, 80) },
          }),
        ],
      };
    case 'send_email':
      return {
        id: uid('plan'),
        intent,
        summary: `Send email to ${who}`,
        steps: [
          step({
            agent: 'email',
            intent: 'draft_email',
            description: 'Draft email',
            server: 'gmail-mock',
            tool: 'email.draft',
            arguments: { to: who, topic: 'follow-up' },
          }),
          step({
            agent: 'email',
            intent: 'send_email',
            description: 'Send email',
            server: 'gmail-mock',
            tool: 'email.send',
            arguments: { to: who, subject: 'Follow-up', body: message },
          }),
        ],
      };
    case 'schedule_meeting':
      return {
        id: uid('plan'),
        intent,
        summary: `Schedule meeting with ${who}`,
        steps: [
          step({
            agent: 'calendar',
            intent,
            description: 'Find free times',
            server: 'calendar-mock',
            tool: 'events.find_free_times',
            arguments: { attendees: [who] },
          }),
          step({
            agent: 'calendar',
            intent,
            description: 'Create invite',
            server: 'calendar-mock',
            tool: 'events.create',
            arguments: {
              title: `Meeting with ${who}`,
              start: '2026-07-23T14:00:00Z',
              end: '2026-07-23T14:30:00Z',
              attendees: [who],
            },
          }),
        ],
      };
    case 'find_file':
      return {
        id: uid('plan'),
        intent,
        summary: 'Find document in Drive',
        steps: [
          step({
            agent: 'document',
            intent,
            description: 'Search files',
            server: 'drive-mock',
            tool: 'files.search',
            arguments: { query: message },
          }),
        ],
      };
    case 'knowledge_qa':
      return {
        id: uid('plan'),
        intent,
        summary: 'Answer from company knowledge',
        steps: [
          step({
            agent: 'knowledge',
            intent,
            description: 'Retrieve with citations',
            server: 'notion-mock',
            tool: 'knowledge.qa',
            arguments: { question: message },
          }),
        ],
      };
    case 'extract_tasks':
      return {
        id: uid('plan'),
        intent,
        summary: 'Extract action items from recent threads',
        steps: [
          step({
            agent: 'communication',
            intent: 'summarize',
            description: 'Summarize Atlas thread',
            server: 'slack-mock',
            tool: 'messages.summarize',
            arguments: { channel: '#atlas' },
          }),
        ],
      };
    case 'meeting_notes':
      return {
        id: uid('plan'),
        intent,
        summary: 'Generate meeting notes',
        steps: [
          step({
            agent: 'communication',
            intent,
            description: 'Summarize conversation',
            server: 'slack-mock',
            tool: 'messages.summarize',
            arguments: { channel: '#atlas' },
          }),
        ],
      };
    default:
      return {
        id: uid('plan'),
        intent: 'general',
        summary: 'General assistant response',
        steps: [
          step({
            agent: 'knowledge',
            intent: 'knowledge_qa',
            description: 'Look up related knowledge',
            server: 'notion-mock',
            tool: 'knowledge.search',
            arguments: { query: message },
          }),
        ],
      };
  }
}
