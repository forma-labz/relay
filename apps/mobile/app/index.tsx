import { LinearGradient } from 'expo-linear-gradient';
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
import { colors, gradients } from '@/constants/theme';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';

const PARTICLES = [
  { x: -120, y: -160, size: 3, delay: 0 },
  { x: 110, y: -120, size: 2, delay: 200 },
  { x: -90, y: 140, size: 2.5, delay: 400 },
  { x: 130, y: 120, size: 2, delay: 150 },
  { x: 0, y: -210, size: 2, delay: 320 },
  { x: 60, y: 190, size: 3, delay: 500 },
  { x: -40, y: -80, size: 1.5, delay: 100 },
  { x: 90, y: 60, size: 2, delay: 280 },
];

function Particle({ x, y, size, delay }: (typeof PARTICLES)[number]) {
  const opacity = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(0.85, { duration: 1400 }), -1, true));
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
          backgroundColor: '#E9D5FF',
        },
        style,
      ]}
    />
  );
}

/** 00 — Splash */
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
  }, [scale, glow]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const t = setTimeout(() => {
      if (!authed) router.replace('/welcome');
      else if (!emailConnected) router.replace('/connect-email');
      else router.replace('/(tabs)/inbox');
    }, 1800);
    return () => clearTimeout(t);
  }, [hydrated, authed, emailConnected, router]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + glow.value * 0.45,
    transform: [{ scale: 0.92 + glow.value * 0.14 }],
  }));

  return (
    <View className="flex-1">
      <GradientBackground glow>
        <View style={StyleSheet.absoluteFill} className="items-center justify-center">
          {PARTICLES.map((p) => (
            <Particle key={`${p.x}-${p.y}-${p.delay}`} {...p} />
          ))}

          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 220,
                height: 220,
                borderRadius: 120,
                backgroundColor: colors.brandPurple,
              },
              ringStyle,
            ]}
          />

          <Animated.View style={logoStyle}>
            <RelayLogo size={112} />
          </Animated.View>

          <Animated.View entering={FadeIn.delay(280).duration(500)} className="mt-7 items-center">
            <Text
              style={{ color: colors.foreground, fontFamily: 'Inter_800ExtraBold', fontSize: 36 }}
            >
              Relay
            </Text>
            <LinearGradient
              colors={gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ marginTop: 10, borderRadius: 8, paddingHorizontal: 2, paddingVertical: 2 }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  color: '#fff',
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                Chat fast. Email professionally.
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </GradientBackground>
    </View>
  );
}
