import {
  FileText,
  ListChecks,
  MessagesSquare,
  PenLine,
  Send,
  Sparkles,
  Wand2,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInUp,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from 'heroui-native';

import { GradientBackground } from '@/components/GradientBackground';
import { RelayLogo } from '@/components/RelayLogo';
import { ScreenHeader } from '@/components/ScreenHeader';
import { aiSuggestions } from '@/lib/mockData';
import { haptics } from '@/lib/haptics';
import { useAiStore } from '@/lib/stores/aiStore';
import type { AiActionType } from '@/lib/types';

const QUICK: { type: AiActionType; label: string; icon: typeof Wand2; color: string }[] = [
  { type: 'summary', label: 'Summarize inbox', icon: MessagesSquare, color: '#2563FF' },
  { type: 'draft', label: 'Draft email', icon: PenLine, color: '#6B4EFF' },
  { type: 'tasks', label: 'Extract tasks', icon: ListChecks, color: '#38BDF8' },
  { type: 'notes', label: 'Meeting notes', icon: FileText, color: '#22C55E' },
];

export default function AiScreen() {
  const insets = useSafeAreaInsets();
  const [foreground, muted, accent] = useThemeColor(['foreground', 'muted', 'accent']);
  const messages = useAiStore((s) => s.messages);
  const thinking = useAiStore((s) => s.thinking);
  const send = useAiStore((s) => s.send);
  const runAction = useAiStore((s) => s.runAction);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length, thinking]);

  const onSend = () => {
    if (!draft.trim()) return;
    haptics.light();
    send(draft);
    setDraft('');
  };

  const onlyGreeting = messages.length <= 1;

  return (
    <View className="flex-1">
      <GradientBackground glow={onlyGreeting}>
        <ScreenHeader
          title="Relay AI"
          subtitle="Your communication copilot"
          right={<Sparkles color={accent} size={20} />}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top + 40}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {onlyGreeting && (
              <View className="items-center py-4">
                <RelayLogo size={64} />
              </View>
            )}

            {messages.map((m, i) => (
              <Animated.View
                key={m.id}
                entering={FadeInUp.duration(320)}
                className={`my-1.5 max-w-[88%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
              >
                <View
                  className={`rounded-3xl px-4 py-3 ${m.role === 'user' ? 'bg-brand rounded-br-md' : 'border-glass-border bg-surface rounded-bl-md border'}`}
                >
                  {m.role === 'assistant' && i > 0 && (
                    <View className="mb-1.5 flex-row items-center gap-1.5">
                      <Sparkles color={accent} size={12} />
                      <Text
                        style={{ color: accent, fontFamily: 'Inter_600SemiBold' }}
                        className="text-[11px]"
                      >
                        Relay AI
                      </Text>
                    </View>
                  )}
                  <Text
                    style={{
                      color: m.role === 'user' ? '#fff' : foreground,
                      fontFamily: 'Inter_400Regular',
                    }}
                    className="text-[14px] leading-6"
                  >
                    {m.body}
                  </Text>
                  {m.role === 'assistant' && m.traceLabel ? (
                    <Text
                      style={{ color: muted, fontFamily: 'Inter_500Medium' }}
                      className="mt-2 text-[11px]"
                    >
                      {m.traceLabel}
                    </Text>
                  ) : null}
                </View>
              </Animated.View>
            ))}

            {thinking && (
              <Animated.View entering={FadeInUp} className="my-1.5 self-start">
                <View className="border-glass-border bg-surface flex-row items-center gap-1.5 rounded-3xl rounded-bl-md border px-4 py-3.5">
                  {[0, 1, 2].map((i) => (
                    <ThinkingDot key={i} index={i} />
                  ))}
                </View>
              </Animated.View>
            )}

            {onlyGreeting && (
              <View className="mt-2">
                {aiSuggestions.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      haptics.selection();
                      runAction(s.type, s.title);
                    }}
                    className="border-glass-border bg-surface mb-2 flex-row items-center gap-3 rounded-2xl border p-3.5 active:opacity-70"
                  >
                    <View className="bg-brand/12 h-9 w-9 items-center justify-center rounded-xl">
                      <Wand2 color={accent} size={17} />
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{ color: foreground, fontFamily: 'Inter_600SemiBold' }}
                        className="text-[14px]"
                      >
                        {s.title}
                      </Text>
                      <Text
                        style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                        className="text-[12px]"
                      >
                        {s.detail}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Quick actions row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingVertical: 8 }}
          >
            {QUICK.map((q) => {
              const Icon = q.icon;
              return (
                <Pressable
                  key={q.type}
                  onPress={() => {
                    haptics.selection();
                    runAction(q.type, q.label);
                  }}
                  className="border-glass-border bg-surface-2/70 flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 active:opacity-70"
                >
                  <Icon color={q.color} size={15} />
                  <Text
                    style={{ color: foreground, fontFamily: 'Inter_500Medium' }}
                    className="text-[12px]"
                  >
                    {q.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View
            style={{ paddingBottom: insets.bottom + 8 }}
            className="border-glass-border bg-surface/80 flex-row items-end gap-2 border-t px-3 pt-2"
          >
            <View className="border-glass-border bg-surface-2/70 max-h-28 flex-1 rounded-3xl border px-4 py-2.5">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Ask Relay AI anything…"
                placeholderTextColor={muted}
                multiline
                style={{
                  color: foreground,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 15,
                  maxHeight: 96,
                  padding: 0,
                }}
              />
            </View>
            <Pressable
              accessibilityLabel="Send"
              onPress={onSend}
              style={{ backgroundColor: accent }}
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
            >
              <Send color="#fff" size={18} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </GradientBackground>
    </View>
  );
}

function ThinkingDot({ index }: { index: number }) {
  const v = useSharedValue(0.3);
  useEffect(() => {
    v.value = withDelay(index * 160, withRepeat(withTiming(1, { duration: 500 }), -1, true));
    return () => cancelAnimation(v);
  }, [v, index]);
  const style = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: -v.value * 3 }],
  }));
  return (
    <Animated.View
      style={[style, { width: 6, height: 6, borderRadius: 3, backgroundColor: '#38BDF8' }]}
    />
  );
}
