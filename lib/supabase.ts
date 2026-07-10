// oxlint-disable-next-line eslint-plugin-import/no-unassigned-import
import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env, isBackendConfigured } from '@/lib/env';
import { secureStorage } from '@/services/secureStorage';

let client: SupabaseClient | null = null;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

export function getSupabase(): SupabaseClient {
  if (!isBackendConfigured) {
    throw new Error(
      'Relay backend is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  if (!client) {
    client = createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
      auth: {
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });

    if (Platform.OS !== 'web') {
      appStateSubscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') void client?.auth.startAutoRefresh();
        else void client?.auth.stopAutoRefresh();
      });
    }
  }

  return client;
}

export function disposeSupabase(): void {
  appStateSubscription?.remove();
  appStateSubscription = null;
  client = null;
}
