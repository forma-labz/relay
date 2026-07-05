import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingState {
  authed: boolean;
  emailConnected: boolean;
  hydrated: boolean;
  completeAuth: () => void;
  completeEmail: () => void;
  signOut: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      authed: false,
      emailConnected: false,
      hydrated: false,
      completeAuth: () => set({ authed: true }),
      completeEmail: () => set({ emailConnected: true }),
      signOut: () => set({ authed: false, emailConnected: false }),
    }),
    {
      name: 'relay-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ authed: s.authed, emailConnected: s.emailConnected }),
      onRehydrateStorage: () => () => {
        useOnboardingStore.setState({ hydrated: true });
      },
    },
  ),
);
