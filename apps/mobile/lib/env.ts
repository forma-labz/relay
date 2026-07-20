import Constants from 'expo-constants';
import { z } from 'zod';

const optionalUrl = z.string().url().optional().or(z.literal(''));

const schema = z.object({
  supabaseUrl: optionalUrl,
  supabaseAnonKey: z.string().optional(),
  easProjectId: z.string().optional(),
  googleWebClientId: z.string().optional(),
  microsoftClientId: z.string().optional(),
  relayApiUrl: optionalUrl,
  demoMode: z.boolean().default(false),
});

const extra = Constants.expoConfig?.extra ?? {};

export const env = schema.parse({
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey,
  easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? extra.eas?.projectId,
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? extra.googleWebClientId,
  microsoftClientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID ?? extra.microsoftClientId,
  relayApiUrl: process.env.EXPO_PUBLIC_RELAY_API_URL ?? extra.relayApiUrl,
  demoMode: (process.env.EXPO_PUBLIC_DEMO_MODE ?? extra.demoMode) === 'true',
});

export const isBackendConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
