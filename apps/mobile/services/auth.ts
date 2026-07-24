import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { env } from '@/lib/env';
import { getSupabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'azure' | 'apple';

const redirectTo = Linking.createURL('auth/callback');

function sessionFromUrl(url: string) {
  const query = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
  const params = new URLSearchParams(query ?? '');
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
  };
}

export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
  });
  if (error) throw error;
  if (Platform.OS === 'web') return;
  if (!data.url) throw new Error('The authentication provider did not return a login URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') throw new Error('Sign in was cancelled.');

  const { accessToken, refreshToken } = sessionFromUrl(result.url);
  if (!accessToken || !refreshToken) {
    throw new Error('The authentication callback did not contain a valid session.');
  }
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) throw sessionError;
}

export async function signInWithApple(): Promise<void> {
  if (Platform.OS !== 'ios') {
    await signInWithOAuth('apple');
    return;
  }
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!credential.identityToken) throw new Error('Apple did not return an identity token.');
  const { error } = await getSupabase().auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: credential.authorizationCode ?? undefined,
  });
  if (error) throw error;
}

export async function sendMagicLink(email: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function authenticateWithBiometrics(): Promise<void> {
  const supported = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!supported || !enrolled)
    throw new Error('No enrolled biometric authentication is available.');

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Relay',
    cancelLabel: 'Use another method',
    disableDeviceFallback: false,
  });
  if (!result.success) throw new Error('Biometric authentication failed.');

  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('Sign in once before using biometric unlock.');
}

export async function signOutEverywhere(): Promise<void> {
  const { error } = await getSupabase().auth.signOut({ scope: 'global' });
  if (error) throw error;
}

export function canUseDemoMode(): boolean {
  return __DEV__ && env.demoMode;
}
