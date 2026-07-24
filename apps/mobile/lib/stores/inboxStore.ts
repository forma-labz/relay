import { create } from 'zustand';

import type { Conversation, InboxFilter, Message } from '@/lib/types';
import { conversations as seedConversations, messagesByConversation } from '@/lib/mockData';

interface InboxState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  filter: InboxFilter;
  query: string;
  setFilter: (f: InboxFilter) => void;
  setQuery: (q: string) => void;
  markRead: (conversationId: string) => void;
  togglePin: (conversationId: string) => void;
  sendMessage: (conversationId: string, msg: Message) => void;
  refresh: () => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  conversations: seedConversations,
  messages: messagesByConversation,
  filter: 'all',
  query: '',
  setFilter: (filter) => set({ filter }),
  setQuery: (query) => set({ query }),
  markRead: (conversationId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread: 0 } : c,
      ),
    })),
  togglePin: (conversationId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, pinned: !c.pinned } : c,
      ),
    })),
  sendMessage: (conversationId, msg) =>
    set((s) => {
      const existing = s.messages[conversationId] ?? [];
      return {
        messages: { ...s.messages, [conversationId]: [...existing, msg] },
        conversations: s.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastPreview: msg.subject ?? msg.body,
                lastTimestamp: msg.timestamp,
                unread: 0,
              }
            : c,
        ),
      };
    }),
  refresh: () => set((s) => ({ conversations: [...s.conversations] })),
}));
