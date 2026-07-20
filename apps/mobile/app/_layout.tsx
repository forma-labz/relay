// oxlint-disable-next-line eslint-plugin-import/no-unassigned-import
import '../global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { HeroUINativeProvider } from 'heroui-native';
import { Uniwind } from 'uniwind';
import {
  ErrorBoundary as ExpoErrorBoundary,
  type ErrorBoundaryProps,
  SplashScreen,
  Stack,
} from 'expo-router';

import { initPostHog } from '@/lib/posthog';
import { reportErrorToParent } from '@/lib/reportPreviewError';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { AppProviders } from '@/providers/AppProviders';

/**
 * Custom ErrorBoundary that reports React render errors to the parent window (Bilt preview iframe)
 * and then renders the default Expo error UI.
 */
function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    if (Platform.OS === 'web' && error) {
      const message = [error.message, error.stack].filter(Boolean).join('\n');
      reportErrorToParent(message);
    }
  }, [error]);
  return <ExpoErrorBoundary error={error} retry={retry} />;
}

export { ErrorBoundary };

// Relay defaults to dark; the persisted preference is applied in ThemeBootstrap.
Uniwind.setTheme('dark');

void SplashScreen.preventAutoHideAsync();

/** Applies the user's persisted theme preference on mount. */
function ThemeBootstrap() {
  const themePref = useSettingsStore((s) => s.theme);
  useEffect(() => {
    Uniwind.setTheme(themePref);
  }, [themePref]);
  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Report uncaught JS errors and unhandled promise rejections to parent (Bilt preview iframe)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const handleError = (event: ErrorEvent) => {
      const message = event.error?.stack ?? event.message ?? 'Unknown error';
      reportErrorToParent(message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      const message =
        err instanceof Error ? [err.message, err.stack].filter(Boolean).join('\n') : String(err);
      reportErrorToParent(message);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Inject Google Fonts link tag for web to ensure fonts load through proxy
  // Also register font family names as fallback if expo-font fails
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Check if link already exists
      const existingLink = document.querySelector(
        'link[href*="fonts.googleapis.com/css2?family=Inter"]',
      );

      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }

      // Note: The @import in global.css and the link tag above ensure Inter font loads
      // expo-font will register the font family names (Inter_400Regular, etc.)
      // If expo-font fails due to proxy issues, the fonts should still be available
      // via the direct Google Fonts CDN link, though the specific font family names
      // might not be registered. The app should still render with Inter font.
    }
  }, []);

  // Hide the custom-dev-client menu only in native development builds.
  // Dynamically import so Expo Go never evaluates expo-dev-client at startup.
  useEffect(() => {
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (!__DEV__ || Platform.OS === 'web' || isExpoGo) return undefined;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    void import('expo-dev-client')
      .then((DevClient) => {
        if (cancelled) return;
        timer = setTimeout(() => {
          DevClient.closeMenu();
          DevClient.hideMenu();
        }, 1000);
      })
      .catch(() => {
        // Dev client is optional when iterating in Expo Go.
      });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      initPostHog();
    }
  }, []);

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <HeroUINativeProvider>
          <ThemeBootstrap />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="connect-email" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="conversation/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="contact/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="search" options={{ presentation: 'modal' }} />
            <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
          </Stack>
        </HeroUINativeProvider>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
