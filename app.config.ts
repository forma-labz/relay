import type { ConfigContext, ExpoConfig } from '@expo/config';

type ExpoPlugins = NonNullable<ExpoConfig['plugins']>;

export default ({ config }: ConfigContext): ExpoConfig => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  const nativePlugins: ExpoPlugins =
    process.env.EXPO_PLATFORM === 'native'
      ? [['expo-dev-client', { launchMode: 'most-recent' }], 'react-native-maps']
      : [];

  return {
    ...config,
    name: 'Relay',
    slug: 'relay',
    newArchEnabled: true,
    version: process.env.BILT_APP_VERSION ?? '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    scheme: 'relay',
    runtimeVersion: {
      policy: 'appVersion',
    },
    ...(projectId
      ? {
          updates: {
            url: `https://u.expo.dev/${projectId}`,
            fallbackToCacheTimeout: 0,
          },
        }
      : {}),
    assetBundlePatterns: ['**/*'],
    ios: {
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSFaceIDUsageDescription: 'Relay uses Face ID to unlock your encrypted inbox.',
        NSMicrophoneUsageDescription: 'Relay uses the microphone to record audio messages.',
      },
      supportsTablet: true,
      bundleIdentifier: process.env.EXPO_IOS_BUNDLE_ID ?? 'com.formalabz.relay',
      associatedDomains: ['applinks:relay.formalabz.com'],
    },
    android: {
      package: process.env.EXPO_ANDROID_PACKAGE ?? 'com.formalabz.relay',
      permissions: ['USE_BIOMETRIC', 'RECORD_AUDIO', 'POST_NOTIFICATIONS'],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{ scheme: 'https', host: 'relay.formalabz.com', pathPrefix: '/auth' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      appStoreAppId: process.env.EXPO_APP_STORE_APP_ID,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      microsoftClientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID,
      demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
      eas: { projectId },
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-secure-store',
      'expo-local-authentication',
      'expo-apple-authentication',
      'expo-notifications',
      'expo-web-browser',
      [
        'expo-audio',
        {
          microphonePermission: 'Allow Relay to record secure audio messages.',
        },
      ],
      ...nativePlugins,
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  };
};
