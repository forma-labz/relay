import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, Crown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { NeonButton } from '@/components/NeonButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, gradients } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

const FEATURES = [
  'Unlimited AI Assistant',
  'Smart Composer & AI rewrite',
  'Unlimited semantic search',
  'Advanced analytics',
  'Priority MCP workflows',
];

/** 13 — Relay Pro Paywall */
export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [yearly, setYearly] = useState(true);

  return (
    <View className="flex-1">
      <GradientBackground glow>
        <ScreenHeader title="Relay Pro" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(450)} className="items-center pt-2">
            <View
              style={{
                backgroundColor: 'rgba(245,158,11,0.15)',
                borderColor: '#F59E0B',
                shadowColor: '#F59E0B',
                shadowOpacity: 0.45,
                shadowRadius: 20,
              }}
              className="mb-4 h-20 w-20 items-center justify-center rounded-full border"
            >
              <Crown color="#F59E0B" size={36} />
            </View>
            <Text
              style={{ color: colors.foreground, fontFamily: 'Inter_800ExtraBold', fontSize: 28 }}
            >
              Unlock Relay Pro
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 20,
              }}
            >
              Full orchestrator power — specialist agents, unlimited search, and advanced analytics.
            </Text>
          </Animated.View>

          <View className="mt-6 flex-row rounded-2xl border border-white/10 bg-black/30 p-1">
            <Pressable
              onPress={() => {
                haptics.selection();
                setYearly(false);
              }}
              className="flex-1 items-center rounded-xl py-3"
              style={{ backgroundColor: !yearly ? colors.brand : 'transparent' }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                }}
              >
                Monthly
              </Text>
              <Text style={{ color: '#E2E8F0', fontFamily: 'Inter_400Regular', fontSize: 12 }}>
                $9.99/mo
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                haptics.selection();
                setYearly(true);
              }}
              className="flex-1 items-center rounded-xl py-3"
              style={{ backgroundColor: yearly ? colors.brand : 'transparent' }}
            >
              <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>
                Yearly
              </Text>
              <Text style={{ color: '#E2E8F0', fontFamily: 'Inter_400Regular', fontSize: 12 }}>
                $99.99/yr
              </Text>
            </Pressable>
          </View>

          <View className="mt-6 gap-3">
            {FEATURES.map((f) => (
              <View key={f} className="flex-row items-center gap-3">
                <LinearGradient
                  colors={gradients.brand}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check color="#fff" size={13} />
                </LinearGradient>
                <Text
                  style={{ color: colors.foreground, fontFamily: 'Inter_500Medium', fontSize: 15 }}
                >
                  {f}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-8">
            <NeonButton
              label="Start Free Trial"
              onPress={() => {
                haptics.success();
                router.back();
              }}
            />
            <Text
              style={{
                color: colors.muted,
                fontFamily: 'Inter_400Regular',
                fontSize: 11,
                textAlign: 'center',
                marginTop: 12,
              }}
            >
              7-day trial · Cancel anytime · {yearly ? 'Billed annually' : 'Billed monthly'}
            </Text>
          </View>
        </ScrollView>
      </GradientBackground>
    </View>
  );
}
