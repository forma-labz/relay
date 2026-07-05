import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GradientBackground } from '@/components/GradientBackground';
import { RelayLogo } from '@/components/RelayLogo';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';

const PARTICLES = [
  { x: -120, y: -160, size: 8, delay: 0 },
  { x: 110, y: -120, size: 5, delay: 200 },
  { x: -90, y: 140, size: 6, delay: 400 },
  { x: 130, y: 120, size: 4, delay: 150 },
  { x: 0, y: -210, size: 5, delay: 320 },
  { x: 60, y: 190, size: 7, delay: 500 },
];

function Particle({ x, y, size, delay }: (typeof PARTICLES)[number]) {
  const opacity = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(0.7, { duration: 1400 }), -1, true));
    drift.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    return () => {
      cancelAnimation(opacity);
      cancelAnimation(drift);
    };
  }, [opacity, drift, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x }, { translateY: y - drift.value * 12 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: '#38BDF8',
        },
        style,
      ]}
    />
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const authed = useOnboardingStore((s) => s.authed);
  const emailConnected = useOnboardingStore((s) => s.emailConnected);
  const hydrated = useOnboardingStore((s) => s.hydrated);

  const scale = useSharedValue(0.7);
  const glow = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 520, easing: Easing.out(Easing.back(1.6)) }),
      withTiming(1, { duration: 260 }),
    );
    glow.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
    return () => {
      cancelAnimation(scale);
      cancelAnimation(glow);
    };
  }, [scale, glow]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const t = setTimeout(() => {
      if (!authed) router.replace('/welcome');
      else if (!emailConnected) router.replace('/connect-email');
      else router.replace('/(tabs)/inbox');
    }, 1900);
    return () => clearTimeout(t);
  }, [hydrated, authed, emailConnected, router]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.3 + glow.value * 0.4 }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <GradientBackground>
        <View className="flex-1 items-center justify-center">
          {PARTICLES.map((p, i) => (
            <Particle key={i} {...p} />
          ))}

          <Animated.View
            style={[
              glowStyle,
              {
                position: 'absolute',
                width: 220,
                height: 220,
                borderRadius: 200,
                backgroundColor: '#2563FF',
              },
            ]}
          />

          <Animated.View style={logoStyle}>
            <RelayLogo size={112} />
          </Animated.View>

          <Animated.View entering={FadeIn.delay(500).duration(600)} className="mt-7 items-center">
            <Text
              style={{ color: '#F8FAFC', fontFamily: 'Inter_800ExtraBold' }}
              className="text-4xl"
            >
              Relay
            </Text>
            <Text
              style={{ color: '#94A3B8', fontFamily: 'Inter_500Medium' }}
              className="mt-1 text-sm"
            >
              Chat Fast. Email Professionally.
            </Text>
          </Animated.View>

          <LoadingDots />
        </View>
      </GradientBackground>
    </View>
  );
}

function LoadingDots() {
  return (
    <Animated.View
      entering={FadeIn.delay(900).duration(500)}
      className="absolute bottom-24 flex-row gap-2"
    >
      {[0, 1, 2].map((i) => (
        <Dot key={i} index={i} />
      ))}
    </Animated.View>
  );
}

function Dot({ index }: { index: number }) {
  const v = useSharedValue(0.3);
  useEffect(() => {
    v.value = withDelay(index * 180, withRepeat(withTiming(1, { duration: 620 }), -1, true));
    return () => cancelAnimation(v);
  }, [v, index]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: v.value }] }));
  return (
    <Animated.View
      style={[style, { width: 8, height: 8, borderRadius: 4, backgroundColor: '#38BDF8' }]}
    />
  );
}
