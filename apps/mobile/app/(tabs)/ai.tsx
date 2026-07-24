import { FileText, ListChecks, MessagesSquare, PenLine, Send, Sparkles } from 'lucide-react-native';
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

import { AiOrb } from '@/components/AiOrb';
import { GradientBackground } from '@/components/GradientBackground';
import { McpBadge } from '@/components/McpBadge';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { aiSuggestions } from '@/lib/mockData';
import { haptics } from '@/lib/haptics';
import { useAiStore } from '@/lib/stores/aiStore';
import type { AiActionType } from '@/lib/types';

const QUICK: { type: AiActionType; label: string; icon: typeof Sparkles; color: string }[] = [
  { type: 'summary', label: 'Summarize', icon: MessagesSquare, color: colors.brand },
  { type: 'draft', label: 'Draft email', icon: PenLine, color: colors.brandPurple },
  { type: 'tasks', label: 'Extract tasks', icon: ListChecks, color: colors.sky },
  { type: 'notes', label: 'Meeting notes', icon: FileText, color: colors.success },
];

/** 10 — AI Assistant (Orchestrator entry) */
export default function AiScreen() {
  const insets = useSafeAreaInsets();
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
        <ScreenHeader title="Relay AI" subtitle="Orchestrator · MCP tools" right={<McpBadge />} />

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
              <View className="items-center py-5">
                <AiOrb size={96} hero />
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: 'Inter_700Bold',
                    fontSize: 22,
                    marginTop: 18,
                  }}
                >
                  Hi Jordan! How can I help?
                </Text>
                <Text
                  style={{
                    color: colors.muted,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    marginTop: 6,
                    textAlign: 'center',
                  }}
                >
                  Ask anything — I plan across Email, Calendar, Drive, and CRM MCP servers.
                </Text>
              </View>
            )}

            {messages.map((m, i) => (
              <Animated.View
                key={m.id}
                entering={FadeInUp.duration(320)}
                className={`my-1.5 max-w-[88%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
              >
                <View
                  className={`rounded-3xl px-4 py-3 ${m.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md border'}`}
                  style={
                    m.role === 'user'
                      ? {
                          backgroundColor: colors.brand,
                          shadowColor: colors.brand,
                          shadowOpacity: 0.35,
                          shadowRadius: 12,
                        }
                      : {
                          backgroundColor: colors.surface,
                          borderColor: colors.glassBorder,
                        }
                  }
                >
                  {m.role === 'assistant' && i > 0 && (
                    <View className="mb-1.5 flex-row items-center gap-1.5">
                      <Sparkles color={colors.brandPurple} size={12} />
                      <Text
                        style={{
                          color: colors.brandPurple,
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 11,
                        }}
                      >
                        Relay AI
                      </Text>
                    </View>
                  )}
                  <Text
                    style={{
                      color: m.role === 'user' ? '#fff' : colors.foreground,
                      fontFamily: 'Inter_400Regular',
                      fontSize: 14,
                      lineHeight: 22,
                    }}
                  >
                    {m.body}
                  </Text>
                  {m.role === 'assistant' && m.traceLabel ? (
                    <Text
                      style={{
                        color: colors.muted,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 11,
                        marginTop: 8,
                      }}
                    >
                      {m.traceLabel}
                    </Text>
                  ) : null}
                </View>
              </Animated.View>
            ))}

            {thinking && (
              <Animated.View entering={FadeInUp} className="my-1.5 self-start">
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.glassBorder,
                  }}
                  className="flex-row items-center gap-1.5 rounded-3xl rounded-bl-md border px-4 py-3.5"
                >
                  {[0, 1, 2].map((i) => (
                    <ThinkingDot key={i} index={i} />
                  ))}
                </View>
              </Animated.View>
            )}

            {onlyGreeting && (
              <View className="mt-2 flex-row flex-wrap gap-2">
                {aiSuggestions.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      haptics.selection();
                      runAction(s.type, s.title);
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.glassBorder,
                      width: '48%',
                      flexGrow: 1,
                    }}
                    className="rounded-2xl border p-3.5 active:opacity-70"
                  >
                    <Sparkles color={colors.brandPurple} size={18} />
                    <Text
                      style={{
                        color: colors.foreground,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 13,
                        marginTop: 8,
                      }}
                    >
                      {s.title}
                    </Text>
                    <Text
                      style={{
                        color: colors.muted,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 11,
                        marginTop: 4,
                      }}
                      numberOfLines={2}
                    >
                      {s.detail}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>

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
                  style={{
                    backgroundColor: colors.surface2,
                    borderColor: colors.glassBorder,
                  }}
                  className="flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 active:opacity-70"
                >
                  <Icon color={q.color} size={15} />
                  <Text
                    style={{
                      color: colors.foreground,
                      fontFamily: 'Inter_500Medium',
                      fontSize: 12,
                    }}
                  >
                    {q.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View
            style={{
              paddingBottom: insets.bottom + 8,
              borderTopColor: colors.glassBorder,
              backgroundColor: 'rgba(22,22,31,0.85)',
            }}
            className="flex-row items-end gap-2 border-t px-3 pt-2"
          >
            <View
              style={{
                backgroundColor: colors.surface2,
                borderColor: colors.glassBorder,
              }}
              className="max-h-28 flex-1 rounded-3xl border px-4 py-2.5"
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Ask Relay AI anything…"
                placeholderTextColor={colors.muted}
                multiline
                style={{
                  color: colors.foreground,
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
              style={{
                backgroundColor: colors.brand,
                shadowColor: colors.brand,
                shadowOpacity: 0.55,
                shadowRadius: 12,
              }}
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
      style={[style, { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brandPurple }]}
    />
  );
}
