import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  Bot,
  Building2,
  Crown,
  Network,
  PenLine,
  Search,
  Shield,
  Users,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { NeonButton } from '@/components/NeonButton';
import { PremiumPaywallCard } from '@/components/PremiumPaywallCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, radii } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import type { BillingPeriod, SubscriptionPlan } from '@/lib/types';

const PRO_FEATURES = [
  { label: 'AI Assistant', icon: Bot },
  { label: 'Smart Composer', icon: PenLine },
  { label: 'Unlimited Search', icon: Search },
  { label: 'Advanced Analytics', icon: BarChart3 },
];

const BUSINESS_FEATURES = [
  { label: 'Everything in Pro', icon: Crown },
  { label: 'Secure Relay Network', icon: Network },
  { label: 'Team workspace', icon: Users },
  { label: 'Admin & priority MCP', icon: Building2 },
];

const PRICING: Record<
  Exclude<SubscriptionPlan, 'Free'>,
  Record<BillingPeriod, { price: string; period: string }>
> = {
  Pro: {
    monthly: { price: '$9.99', period: '/mo' },
    yearly: { price: '$99.99', period: '/yr' },
  },
  Business: {
    monthly: { price: '$19.99', period: '/mo' },
    yearly: { price: '$199.99', period: '/yr' },
  },
};

/** 13 — Relay Pro / Business Paywall */
export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setPlan = useSettingsStore((s) => s.setPlan);
  const [yearly, setYearly] = useState(true);
  const [selected, setSelected] = useState<Exclude<SubscriptionPlan, 'Free'>>('Pro');
  const period: BillingPeriod = yearly ? 'yearly' : 'monthly';

  return (
    <View className="flex-1">
      <GradientBackground glow>
        <ScreenHeader title="Upgrade" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(450)} className="items-center pt-1">
            <View
              style={{
                backgroundColor: 'rgba(245,165,36,0.15)',
                borderColor: colors.warning,
                shadowColor: colors.warning,
                shadowOpacity: 0.4,
                shadowRadius: 18,
                borderRadius: radii.full,
              }}
              className="mb-4 h-18 w-18 items-center justify-center border"
            >
              <View className="h-[72px] w-[72px] items-center justify-center">
                <Crown color={colors.warning} size={34} />
              </View>
            </View>
            <Text
              style={{ color: colors.foreground, fontFamily: 'Inter_800ExtraBold', fontSize: 26 }}
            >
              Upgrade to Relay Pro
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 20,
                paddingHorizontal: 12,
              }}
            >
              Unlock AI workflows, Smart Composer, and enterprise Secure Relay for your workspace.
            </Text>
          </Animated.View>

          {/* Billing period */}
          <View
            className="mt-6 flex-row p-1"
            style={{
              borderRadius: radii.xl,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              backgroundColor: 'rgba(7,11,23,0.45)',
            }}
          >
            <Pressable
              onPress={() => {
                haptics.selection();
                setYearly(false);
              }}
              className="flex-1 items-center py-3"
              style={{
                borderRadius: radii.lg,
                backgroundColor: !yearly ? colors.brand : 'transparent',
              }}
            >
              <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>
                Monthly
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                haptics.selection();
                setYearly(true);
              }}
              className="flex-1 items-center py-3"
              style={{
                borderRadius: radii.lg,
                backgroundColor: yearly ? colors.brand : 'transparent',
              }}
            >
              <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>
                Yearly
              </Text>
              <Text
                style={{
                  color: yearly ? 'rgba(255,255,255,0.85)' : colors.brandPurple,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 10,
                  marginTop: 2,
                }}
              >
                Save 17%
              </Text>
            </Pressable>
          </View>

          {/* Plan cards */}
          <View className="mt-5 flex-row gap-3">
            <PremiumPaywallCard
              name="Pro"
              price={PRICING.Pro[period].price}
              period={PRICING.Pro[period].period}
              features={PRO_FEATURES}
              selected={selected === 'Pro'}
              onSelect={() => setSelected('Pro')}
            />
            <PremiumPaywallCard
              name="Business"
              price={PRICING.Business[period].price}
              period={PRICING.Business[period].period}
              badge="Teams"
              features={BUSINESS_FEATURES}
              selected={selected === 'Business'}
              onSelect={() => setSelected('Business')}
            />
          </View>

          {/* Feature highlight strip */}
          <Animated.View entering={FadeInDown.delay(120).duration(400)} className="mt-5">
            <View
              style={{
                borderRadius: radii.xl,
                borderWidth: 1,
                borderColor: colors.glassBorder,
                backgroundColor: colors.card,
                padding: 16,
              }}
            >
              <View className="mb-3 flex-row items-center gap-2">
                <Shield color={colors.brand} size={18} strokeWidth={2} />
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                  }}
                >
                  Included with {selected}
                </Text>
              </View>
              {(selected === 'Pro' ? PRO_FEATURES : BUSINESS_FEATURES).map((f) => {
                const Icon = f.icon;
                return (
                  <View key={f.label} className="mb-2.5 flex-row items-center gap-3">
                    <LinearGradient
                      colors={['#2D6BFF', '#8B5CF6']}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon color="#fff" size={14} strokeWidth={2} />
                    </LinearGradient>
                    <Text
                      style={{
                        color: colors.foreground,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 14,
                      }}
                    >
                      {f.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          <View className="mt-7">
            <NeonButton
              label="Start Free Trial"
              onPress={() => {
                haptics.success();
                setPlan(selected);
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
              7-day free trial · Cancel anytime · {yearly ? 'Billed annually' : 'Billed monthly'}
            </Text>
          </View>
        </ScrollView>
      </GradientBackground>
    </View>
  );
}
