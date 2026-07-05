import { useRouter } from 'expo-router';
import { Apple, Fingerprint, Phone, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { GradientBackground } from '@/components/GradientBackground';
import { RelayLogo } from '@/components/RelayLogo';
import { ScreenHeader } from '@/components/ScreenHeader';
import { haptics } from '@/lib/haptics';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';

function GoogleGlyph() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.3 5.3C41.8 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </Svg>
  );
}

function MicrosoftGlyph() {
  return (
    <Svg width={18} height={18} viewBox="0 0 23 23">
      <Path fill="#F25022" d="M1 1h10v10H1z" />
      <Path fill="#7FBA00" d="M12 1h10v10H12z" />
      <Path fill="#00A4EF" d="M1 12h10v10H1z" />
      <Path fill="#FFB900" d="M12 12h10v10H12z" />
    </Svg>
  );
}

type Provider = 'google' | 'microsoft' | 'apple' | 'phone' | 'biometric';

function Row({
  provider,
  label,
  glyph,
  pending,
  onPress,
}: {
  provider: Provider;
  label: string;
  glyph: React.ReactNode;
  pending: Provider | null;
  onPress: (provider: Provider) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={pending != null}
      onPress={() => onPress(provider)}
      className="border-glass-border bg-surface-2/70 flex-row items-center justify-center gap-3 rounded-2xl border py-3.5 active:opacity-70"
    >
      {pending === provider ? <ActivityIndicator color="#2563FF" /> : glyph}
      <Text style={{ color: '#F8FAFC', fontFamily: 'Inter_600SemiBold' }} className="text-[15px]">
        {label}
      </Text>
    </Pressable>
  );
}

export default function Auth() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeAuth = useOnboardingStore((s) => s.completeAuth);
  const [pending, setPending] = useState<Provider | null>(null);

  const signIn = (provider: Provider) => {
    if (pending) return;
    haptics.medium();
    setPending(provider);
    setTimeout(() => {
      haptics.success();
      completeAuth();
      router.replace('/connect-email');
    }, 1100);
  };

  return (
    <View className="flex-1">
      <GradientBackground>
        <ScreenHeader title="Sign in" onBack={() => router.back()} />
        <View className="flex-1 px-5">
          <Animated.View entering={FadeInDown.duration(500)} className="mt-4 mb-8 items-center">
            <RelayLogo size={64} />
            <Text
              style={{ color: '#F8FAFC', fontFamily: 'Inter_700Bold' }}
              className="mt-4 text-2xl"
            >
              Welcome to Relay
            </Text>
            <Text
              style={{ color: '#94A3B8', fontFamily: 'Inter_400Regular' }}
              className="mt-1 text-sm"
            >
              Secure access to your unified inbox
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(500)} className="gap-3">
            <Row
              provider="google"
              label="Continue with Google"
              glyph={<GoogleGlyph />}
              pending={pending}
              onPress={signIn}
            />
            <Row
              provider="microsoft"
              label="Continue with Microsoft"
              glyph={<MicrosoftGlyph />}
              pending={pending}
              onPress={signIn}
            />
            <Row
              provider="apple"
              label="Continue with Apple"
              glyph={<Apple color="#F8FAFC" size={20} fill="#F8FAFC" />}
              pending={pending}
              onPress={signIn}
            />

            <View className="my-2 flex-row items-center gap-3">
              <View className="bg-glass-border h-px flex-1" />
              <Text style={{ color: '#64748B', fontFamily: 'Inter_500Medium' }} className="text-xs">
                or
              </Text>
              <View className="bg-glass-border h-px flex-1" />
            </View>

            <Row
              provider="phone"
              label="Continue with phone"
              glyph={<Phone color="#38BDF8" size={20} />}
              pending={pending}
              onPress={signIn}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(240).duration(500)}
            className="mt-6 items-center"
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Unlock with biometrics"
              disabled={pending != null}
              onPress={() => signIn('biometric')}
              className="border-glass-border bg-brand/15 h-16 w-16 items-center justify-center rounded-full border active:opacity-70"
            >
              <Fingerprint color="#2563FF" size={30} />
            </Pressable>
            <Text
              style={{ color: '#94A3B8', fontFamily: 'Inter_500Medium' }}
              className="mt-2 text-xs"
            >
              Unlock with Face ID / Touch ID
            </Text>
          </Animated.View>
        </View>

        <GlassCard
          style={{ paddingBottom: insets.bottom + 14 }}
          className="mx-5 mb-4 rounded-3xl p-4"
        >
          <View className="flex-row items-center justify-center gap-2">
            <ShieldCheck color="#22C55E" size={14} />
            <Text
              style={{ color: '#94A3B8', fontFamily: 'Inter_400Regular' }}
              className="text-[11px]"
            >
              Protected with Signal-grade end-to-end encryption
            </Text>
          </View>
        </GlassCard>
      </GradientBackground>
    </View>
  );
}
