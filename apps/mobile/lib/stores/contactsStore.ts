import { create } from 'zustand';

import type { Contact } from '@/lib/types';
import { contacts as seedContacts } from '@/lib/mockData';

interface ContactsState {
  contacts: Contact[];
  query: string;
  setQuery: (q: string) => void;
  toggleFavorite: (id: string) => void;
  updateNotes: (id: string, notes: string) => void;
}

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: seedContacts,
  query: '',
  setQuery: (query) => set({ query }),
  toggleFavorite: (id) =>
    set((s) => ({
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)),
    })),
  updateNotes: (id, notes) =>
    set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, notes } : c)) })),
}));
