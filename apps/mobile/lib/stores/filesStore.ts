import { create } from 'zustand';

import type { StoredFile } from '@/lib/types';
import { files as seedFiles } from '@/lib/mockData';

type ViewMode = 'grid' | 'list';

interface FilesState {
  files: StoredFile[];
  view: ViewMode;
  query: string;
  setView: (v: ViewMode) => void;
  setQuery: (q: string) => void;
  toggleShare: (id: string) => void;
}

export const useFilesStore = create<FilesState>((set) => ({
  files: seedFiles,
  view: 'grid',
  query: '',
  setView: (view) => set({ view }),
  setQuery: (query) => set({ query }),
  toggleShare: (id) =>
    set((s) => ({ files: s.files.map((f) => (f.id === id ? { ...f, shared: !f.shared } : f)) })),
}));
