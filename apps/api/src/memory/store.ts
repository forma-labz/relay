import type { MemoryRecord, MemoryScope } from '@relay/shared';

function uid(): string {
  return `mem_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

/** In-memory store used when DATABASE_URL is unset (local/dev/tests). */
export class MemoryStore {
  private records: MemoryRecord[] = [];
  private approvals = new Map<
    string,
    {
      id: string;
      userId: string;
      conversationId?: string;
      server: string;
      tool: string;
      arguments: Record<string, unknown>;
      description: string;
      status: 'pending' | 'approved' | 'rejected' | 'executed';
    }
  >();
  private conversations = new Map<
    string,
    { id: string; userId: string; messages: { role: string; content: string }[] }
  >();

  seedDemo(userId = 'demo-user'): void {
    const ts = now();
    this.records = [
      {
        id: uid(),
        userId,
        scope: 'personal',
        key: 'writing_style',
        content: {
          tone: 'warm and concise',
          signature: 'Jordan',
          preferences: ['short paragraphs', 'no jargon'],
        },
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid(),
        userId,
        scope: 'company',
        key: 'clients',
        content: {
          clients: ['BrightPath', 'Atlas'],
          projects: ['API tier rollout', 'MSA negotiation'],
        },
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid(),
        userId,
        scope: 'conversation',
        key: 'atlas_thread',
        content: {
          decisions: ['Data residency accepted'],
          actionItems: ['Confirm SLA credit structure with finance'],
          deadlines: ['Thursday 2pm call with Sofia'],
        },
        createdAt: ts,
        updatedAt: ts,
      },
    ];
  }

  list(userId: string, scope?: MemoryScope): MemoryRecord[] {
    return this.records.filter((r) => r.userId === userId && (!scope || r.scope === scope));
  }

  upsert(
    userId: string,
    scope: MemoryScope,
    key: string,
    content: Record<string, unknown>,
  ): MemoryRecord {
    const existing = this.records.find(
      (r) => r.userId === userId && r.scope === scope && r.key === key,
    );
    const ts = now();
    if (existing) {
      existing.content = content;
      existing.updatedAt = ts;
      return existing;
    }
    const record: MemoryRecord = {
      id: uid(),
      userId,
      scope,
      key,
      content,
      createdAt: ts,
      updatedAt: ts,
    };
    this.records.push(record);
    return record;
  }

  ensureConversation(userId: string, conversationId?: string): string {
    if (conversationId && this.conversations.has(conversationId)) return conversationId;
    const id = conversationId ?? `conv_${Math.random().toString(36).slice(2, 10)}`;
    this.conversations.set(id, { id, userId, messages: [] });
    return id;
  }

  appendMessage(conversationId: string, role: string, content: string): void {
    const conv = this.conversations.get(conversationId);
    if (!conv) return;
    conv.messages.push({ role, content });
  }

  createApproval(input: {
    userId: string;
    conversationId?: string;
    server: string;
    tool: string;
    arguments: Record<string, unknown>;
    description: string;
  }): string {
    const id = `appr_${Math.random().toString(36).slice(2, 10)}`;
    this.approvals.set(id, { ...input, id, status: 'pending' });
    return id;
  }

  getApproval(id: string) {
    return this.approvals.get(id);
  }

  markApproval(id: string, status: 'approved' | 'rejected' | 'executed'): void {
    const a = this.approvals.get(id);
    if (a) a.status = status;
  }
}

export const memoryStore = new MemoryStore();
memoryStore.seedDemo();
