import { create } from 'zustand';

import type { AiActionType, AiMessage } from '@/lib/types';
import { aiSeedMessages } from '@/lib/mockData';

interface AiState {
  messages: AiMessage[];
  thinking: boolean;
  send: (body: string) => void;
  runAction: (type: AiActionType, label: string) => void;
}

const CANNED: Record<AiActionType, string> = {
  summary:
    'Here are your inbox highlights:\n\n• Amara Okafor sent the revised brand deck — awaiting your review.\n• Sofia Bianchi shared MSA redlines; a call is set for Thursday 2pm.\n• Daniel Rivera asked to move the sync to Thursday 3pm.\n• Marcus Lee is a warm lead pending a follow-up.',
  draft:
    'Draft ready:\n\nHi Marcus,\n\nGreat speaking earlier — I appreciated your thoughts on the API tier. I’ve attached a short overview of what onboarding would look like for BrightPath. Would a 20-minute call next week work to map out next steps?\n\nBest,\nJordan',
  rewrite:
    'Here’s a crisper version:\n\n"Thanks for the fast turnaround. Data residency works on our side — I’ll confirm the SLA credit structure with finance and revert tomorrow. Thursday 2pm is good for the call."',
  tasks:
    'Action items from the Atlas thread:\n\n1. Confirm SLA credit structure with finance (due tomorrow)\n2. Review data residency clause — resolved\n3. Prepare for Thursday 2pm call with Sofia',
  notes:
    'Meeting notes — Atlas sync:\n\nAttendees: You, Sofia Bianchi\nDecisions: Data residency accepted; SLA credits pending finance.\nNext steps: Confirm credits, reconvene Thursday 2pm.',
  reply:
    'Suggested replies:\n\n1. "Thursday 2pm works — I’ll send an invite."\n2. "Reviewing the redlines now, will revert by EOD."\n3. "Can we do a quick call to align on the SLA section?"',
};

const uid = () => Math.random().toString(36).slice(2);

export const useAiStore = create<AiState>((set, get) => ({
  messages: aiSeedMessages,
  thinking: false,
  send: (body) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    set((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), role: 'user', body: trimmed, timestamp: new Date().toISOString() },
      ],
      thinking: true,
    }));
    setTimeout(() => {
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: uid(),
            role: 'assistant',
            body: "Here's a suggestion based on your recent threads. I've kept the tone warm and concise — want me to refine it further or turn it into a send-ready draft?",
            timestamp: new Date().toISOString(),
          },
        ],
        thinking: false,
      }));
    }, 900);
  },
  runAction: (type, label) => {
    set((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), role: 'user', body: label, timestamp: new Date().toISOString() },
      ],
      thinking: true,
    }));
    setTimeout(() => {
      set((s) => ({
        messages: [
          ...s.messages,
          { id: uid(), role: 'assistant', body: CANNED[type], timestamp: new Date().toISOString() },
        ],
        thinking: false,
      }));
    }, 900);
    void get();
  },
}));
