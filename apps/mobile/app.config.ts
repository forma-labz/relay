import type { ConfigContext, ExpoConfig } from '@expo/config';

const DEFAULT_EAS_PROJECT_ID = '652fc2c3-5b20-48d3-9544-782c82e23c72';

export default ({ config }: ConfigContext): ExpoConfig => {
  const projectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    (config.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ||
    DEFAULT_EAS_PROJECT_ID;

  return {
    ...config,
    name: 'Relay',
    slug: 'relay',
    owner: process.env.EXPO_OWNER || 'relaychat',
    newArchEnabled: true,
    version: process.env.EXPO_APP_VERSION ?? process.env.BILT_APP_VERSION ?? '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    scheme: 'relay',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0B142E',
    },
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
      icon: './assets/icon.png',
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
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#2563FF',
      },
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
      relayApiUrl: process.env.EXPO_PUBLIC_RELAY_API_URL,
      demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
      eas: { projectId },
    },
    plugins: [
      'expo-router',
      'expo-asset',
      'expo-font',
      'expo-secure-store',
      'expo-local-authentication',
      'expo-apple-authentication',
      'expo-notifications',
      'expo-web-browser',
      'expo-updates',
      [
        'expo-dev-client',
        {
          launchMode: 'most-recent',
        },
      ],
      [
        'expo-audio',
        {
          microphonePermission: 'Allow Relay to record secure audio messages.',
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#0B142E',
          image: './assets/splash-icon.png',
          imageWidth: 200,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
      // Keep Metro resolution aligned with native autolinking in the monorepo.
      autolinkingModuleResolution: true,
    },
  };
};
