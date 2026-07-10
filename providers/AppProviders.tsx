import { addEventListener as addNetInfoEventListener } from '@react-native-community/netinfo';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { isBackendConfigured } from '@/lib/env';
import { getSupabase } from '@/lib/supabase';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';

onlineManager.setEventListener((setOnline) =>
  addNetInfoEventListener((state) => setOnline(Boolean(state.isConnected))),
);

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 1000 * 60 * 60 * 24,
            retry: (count, error) => count < 2 && !(error instanceof TypeError),
          },
          mutations: { retry: 1 },
        },
      }),
  );

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isBackendConfigured) return undefined;
    const supabase = getSupabase();
    void supabase.auth.getSession().then(({ data }) => {
      useOnboardingStore.getState().setAuthenticated(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      useOnboardingStore.getState().setAuthenticated(Boolean(session));
      if (!session) queryClient.clear();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
