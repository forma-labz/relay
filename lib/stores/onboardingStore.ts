import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingState {
  authed: boolean;
  emailConnected: boolean;
  hydrated: boolean;
  completeAuth: () => void;
  setAuthenticated: (authed: boolean) => void;
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
      setAuthenticated: (authed) => set({ authed }),
      completeEmail: () => set({ emailConnected: true }),
      signOut: () => set({ authed: false, emailConnected: false }),
    }),
    {
      name: 'relay-onboarding-v2',
      storage: createJSONStorage(() => AsyncStorage),
      // Auth sessions are persisted by Supabase in Keychain/Keystore, never AsyncStorage.
      partialize: (s) => ({ emailConnected: s.emailConnected }),
      onRehydrateStorage: () => () => {
        useOnboardingStore.setState({ hydrated: true });
      },
    },
  ),
);
