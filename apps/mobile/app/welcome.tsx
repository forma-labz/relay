import { useRouter } from 'expo-router';
import { Lock, Mail, MessagesSquare, Shield } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { GradientBackground } from '@/components/GradientBackground';
import { NeonButton } from '@/components/NeonButton';
import { RelayLogo } from '@/components/RelayLogo';
import { colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

const SLIDES = [
  {
    key: 'welcome',
    title: 'Welcome to Relay',
    body: 'A secure way to message, email and manage your client relationships — orchestrated by AI over MCP.',
    visual: 'icons' as const,
  },
  {
    key: 'inbox',
    title: 'All your conversations in one place',
    body: 'Unified inbox for chat, email, and files — every channel as a discoverable MCP tool.',
    visual: 'inbox' as const,
  },
  {
    key: 'pro',
    title: 'Built for professionals',
    body: 'Enterprise-grade encryption, specialist AI agents, and workflows that span your stack.',
    visual: 'shield' as const,
  },
];

/** 01–03 — Onboarding */
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const finish = () => {
    haptics.medium();
    router.replace('/auth');
  };

  return (
    <View className="flex-1">
      <GradientBackground>
        <View style={{ paddingTop: insets.top + 20 }} className="items-center px-6">
          <RelayLogo size={56} />
          <Text
            style={{ color: colors.foreground, fontFamily: 'Inter_800ExtraBold', fontSize: 22 }}
            className="mt-3"
          >
            Relay
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          className="mt-4 flex-1"
        >
          {SLIDES.map((s) => (
            <View key={s.key} style={{ width }} className="justify-center px-7">
              <Animated.View entering={FadeInDown.duration(450)} className="items-center">
                {s.visual === 'icons' && (
                  <View className="mb-8 h-40 w-full flex-row items-center justify-center gap-3">
                    {(
                      [
                        { key: 'chat', Icon: MessagesSquare, tint: colors.brand, lift: 0 },
                        { key: 'mail', Icon: Mail, tint: colors.brand, lift: -12 },
                        { key: 'lock', Icon: Lock, tint: colors.sky, lift: 0 },
                      ] as const
                    ).map(({ key, Icon, tint, lift }) => (
                      <GlassCard
                        key={key}
                        className="h-20 w-20 items-center justify-center"
                        style={{
                          shadowColor: colors.brand,
                          shadowOpacity: 0.35,
                          shadowRadius: 16,
                          transform: [{ translateY: lift }],
                        }}
                      >
                        <Icon color={tint} size={28} />
                      </GlassCard>
                    ))}
                  </View>
                )}
                {s.visual === 'inbox' && (
                  <GlassCard className="mb-8 w-full p-4">
                    {['Sarah · Proposal.pdf', 'Marcus · API tier', 'Sofia · MSA redlines'].map(
                      (row, i) => (
                        <View
                          key={row}
                          className={`flex-row items-center gap-3 py-2.5 ${i < 2 ? 'border-b border-white/10' : ''}`}
                        >
                          <View
                            style={{ backgroundColor: i === 0 ? colors.brand : colors.brandPurple }}
                            className="h-9 w-9 items-center justify-center rounded-full"
                          >
                            <Text
                              style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 12 }}
                            >
                              {row[0]}
                            </Text>
                          </View>
                          <Text
                            style={{
                              color: colors.foreground,
                              fontFamily: 'Inter_500Medium',
                              fontSize: 14,
                            }}
                            className="flex-1"
                          >
                            {row}
                          </Text>
                        </View>
                      ),
                    )}
                  </GlassCard>
                )}
                {s.visual === 'shield' && (
                  <View
                    className="mb-8 h-28 w-28 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: 'rgba(99,102,241,0.18)',
                      borderWidth: 1.5,
                      borderColor: colors.brand,
                      shadowColor: colors.brand,
                      shadowOpacity: 0.6,
                      shadowRadius: 24,
                    }}
                  >
                    <Shield color={colors.brand} size={48} />
                  </View>
                )}

                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: 'Inter_700Bold',
                    fontSize: 26,
                    textAlign: 'center',
                  }}
                >
                  {s.title}
                </Text>
                <Text
                  style={{
                    color: colors.muted,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 15,
                    lineHeight: 22,
                    textAlign: 'center',
                    marginTop: 12,
                  }}
                >
                  {s.body}
                </Text>
              </Animated.View>
            </View>
          ))}
        </ScrollView>

        <View style={{ paddingBottom: insets.bottom + 20 }} className="px-6">
          <View className="mb-5 flex-row items-center justify-center gap-2">
            {SLIDES.map((s, i) => (
              <View
                key={s.key}
                style={{
                  width: i === index ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: i === index ? colors.brand : 'rgba(148,163,184,0.35)',
                }}
              />
            ))}
          </View>
          <NeonButton
            label={index === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            onPress={() => {
              if (index < SLIDES.length - 1) {
                scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
                setIndex(index + 1);
              } else finish();
            }}
          />
          <Pressable onPress={finish} className="mt-3 items-center py-2 active:opacity-70">
            <Text style={{ color: colors.muted, fontFamily: 'Inter_500Medium', fontSize: 13 }}>
              Skip
            </Text>
          </Pressable>
        </View>
      </GradientBackground>
    </View>
  );
}
