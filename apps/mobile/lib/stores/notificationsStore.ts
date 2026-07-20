import { create } from 'zustand';

import type { AppNotification } from '@/lib/types';
import { notifications as seed } from '@/lib/mockData';

interface NotificationsState {
  notifications: AppNotification[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: seed,
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
