import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { getSupabase } from '@/lib/supabase';

export type EmailProvider = 'gmail' | 'outlook';

interface OAuthStartResponse {
  authorizationUrl: string;
}

export async function connectEmailProvider(provider: EmailProvider): Promise<void> {
  const redirectUri = Linking.createURL('email/callback');
  const { data, error } = await getSupabase().functions.invoke<OAuthStartResponse>(
    'email-oauth-start',
    { body: { provider, redirectUri } },
  );
  if (error) throw error;
  if (!data?.authorizationUrl) throw new Error('The email provider did not return a login URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.authorizationUrl, redirectUri);
  if (result.type !== 'success') throw new Error('Email connection was cancelled.');

  const url = new URL(result.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) throw new Error('The provider callback was incomplete.');

  const { error: callbackError } = await getSupabase().functions.invoke('email-oauth-callback', {
    body: { provider, code, state, redirectUri },
  });
  if (callbackError) throw callbackError;
}
