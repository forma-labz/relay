import { useRouter } from 'expo-router';
import { Bot, FolderLock, Mail, MessagesSquare, ShieldCheck, Users } from 'lucide-react-native';
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
import { Button } from 'heroui-native';

import { GlassCard } from '@/components/GlassCard';
import { GradientBackground } from '@/components/GradientBackground';
import { RelayLogo } from '@/components/RelayLogo';
import { haptics } from '@/lib/haptics';

const SLIDES = [
  {
    icon: MessagesSquare,
    color: '#2563FF',
    title: 'One unified inbox',
    body: 'Encrypted chats and professional email side by side, in a single beautiful thread.',
  },
  {
    icon: Bot,
    color: '#6B4EFF',
    title: 'An AI copilot',
    body: 'Summarize threads, draft replies, translate, and extract tasks in a tap.',
  },
  {
    icon: Users,
    color: '#38BDF8',
    title: 'CRM built in',
    body: 'Every contact, note, document and interaction — organized automatically.',
  },
  {
    icon: FolderLock,
    color: '#22C55E',
    title: 'Secure by design',
    body: 'End-to-end encryption and private document storage you fully control.',
  },
];

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

  return (
    <View className="flex-1">
      <GradientBackground>
        <View style={{ paddingTop: insets.top + 24 }} className="items-center">
          <RelayLogo size={72} />
          <Text
            style={{ color: '#F8FAFC', fontFamily: 'Inter_800ExtraBold' }}
            className="mt-3 text-2xl"
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
          className="mt-6 flex-1"
        >
          {SLIDES.map((s) => {
            const Icon = s.icon;
            return (
              <View key={s.title} style={{ width }} className="items-center justify-center px-8">
                <Animated.View entering={FadeInDown.duration(500)} className="w-full items-center">
                  <View
                    style={{ backgroundColor: s.color + '22' }}
                    className="mb-8 h-24 w-24 items-center justify-center rounded-3xl"
                  >
                    <Icon color={s.color} size={44} />
                  </View>
                  <Text
                    style={{ color: '#F8FAFC', fontFamily: 'Inter_700Bold' }}
                    className="text-center text-[26px]"
                  >
                    {s.title}
                  </Text>
                  <Text
                    style={{ color: '#94A3B8', fontFamily: 'Inter_400Regular' }}
                    className="mt-3 max-w-xs text-center text-base leading-6"
                  >
                    {s.body}
                  </Text>
                </Animated.View>
              </View>
            );
          })}
        </ScrollView>

        <View className="mb-6 flex-row justify-center gap-2">
          {SLIDES.map((slide, i) => (
            <Pressable
              key={slide.title}
              onPress={() => {
                haptics.selection();
                scrollRef.current?.scrollTo({ x: i * width, animated: true });
                setIndex(i);
              }}
            >
              <View
                style={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === index ? '#2563FF' : '#334155',
                }}
              />
            </Pressable>
          ))}
        </View>

        <GlassCard
          style={{ paddingBottom: insets.bottom + 16 }}
          className="mx-5 mb-4 rounded-t-3xl p-5"
        >
          <View className="mb-4 flex-row items-center justify-center gap-2">
            <ShieldCheck color="#22C55E" size={16} />
            <Text style={{ color: '#94A3B8', fontFamily: 'Inter_500Medium' }} className="text-xs">
              End-to-end encrypted · Private by default
            </Text>
          </View>
          <Button
            onPress={() => {
              haptics.medium();
              router.push('/auth');
            }}
          >
            <Button.Label>Get Started</Button.Label>
          </Button>
          <Button
            variant="tertiary"
            className="mt-2"
            onPress={() => {
              haptics.selection();
              router.push('/auth');
            }}
          >
            <Mail color="#94A3B8" size={16} />
            <Button.Label>I already have an account</Button.Label>
          </Button>
        </GlassCard>
      </GradientBackground>
    </View>
  );
}
