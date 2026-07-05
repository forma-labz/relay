import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Uniwind } from 'uniwind';

import type { ConnectedAccount, ThemePref } from '@/lib/types';
import { connectedAccounts as seedAccounts, currentUser } from '@/lib/mockData';

interface SettingsState {
  theme: ThemePref;
  hydrated: boolean;
  encryptionEnabled: boolean;
  biometricsEnabled: boolean;
  emailNotifications: boolean;
  messageNotifications: boolean;
  taskReminders: boolean;
  accounts: ConnectedAccount[];
  profileName: string;
  profileEmail: string;
  setTheme: (t: ThemePref) => void;
  toggle: (
    key: keyof Pick<
      SettingsState,
      | 'encryptionEnabled'
      | 'biometricsEnabled'
      | 'emailNotifications'
      | 'messageNotifications'
      | 'taskReminders'
    >,
  ) => void;
  addAccount: (a: ConnectedAccount) => void;
  removeAccount: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      hydrated: false,
      encryptionEnabled: true,
      biometricsEnabled: true,
      emailNotifications: true,
      messageNotifications: true,
      taskReminders: true,
      accounts: seedAccounts,
      profileName: currentUser.name,
      profileEmail: currentUser.email,
      setTheme: (theme) => {
        Uniwind.setTheme(theme);
        set({ theme });
      },
      toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<SettingsState>),
      addAccount: (a) => set((s) => ({ accounts: [...s.accounts, a] })),
      removeAccount: (id) => set((s) => ({ accounts: s.accounts.filter((x) => x.id !== id) })),
    }),
    {
      name: 'relay-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        theme: s.theme,
        encryptionEnabled: s.encryptionEnabled,
        biometricsEnabled: s.biometricsEnabled,
        emailNotifications: s.emailNotifications,
        messageNotifications: s.messageNotifications,
        taskReminders: s.taskReminders,
        accounts: s.accounts,
        profileName: s.profileName,
        profileEmail: s.profileEmail,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setTheme(state.theme);
        useSettingsStore.setState({ hydrated: true });
      },
    },
  ),
);
