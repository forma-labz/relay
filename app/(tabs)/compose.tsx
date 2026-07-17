import { useRouter } from 'expo-router';
import {
  Clock,
  Languages,
  ListChecks,
  Paperclip,
  Send,
  Sparkles,
  Wand2,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { RelayButton } from '@/components/RelayButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { haptics } from '@/lib/haptics';

type Mode = 'message' | 'email';
type AiTool = 'rewrite' | 'translate' | 'summarize';

const AI_TOOLS: { id: AiTool; label: string; icon: typeof Wand2 }[] = [
  { id: 'rewrite', label: 'Rewrite', icon: Wand2 },
  { id: 'translate', label: 'Translate', icon: Languages },
  { id: 'summarize', label: 'Summarize', icon: ListChecks },
];

export default function ComposeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('message');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState<AiTool | null>(null);
  const [scheduled, setScheduled] = useState<string | null>(null);

  const runTool = (tool: AiTool) => {
    if (!body.trim()) {
      haptics.medium();
      return;
    }
    haptics.selection();
    setBusy(tool);
    setTimeout(() => {
      if (tool === 'rewrite') {
        setBody(
          "Hi there,\n\nThanks so much for your time today — I really valued the conversation. I'll pull together the next steps and share a short plan by tomorrow.\n\nBest,\nJordan",
        );
      } else if (tool === 'translate') {
        setBody(
          'Hola,\n\nMuchas gracias por tu tiempo hoy. Prepararé los próximos pasos y compartiré un breve plan mañana.\n\nSaludos,\nJordan',
        );
      } else {
        setBody('Summary: Recapped the call, agreed on next steps, plan to follow tomorrow.');
      }
      haptics.success();
      setBusy(null);
    }, 1000);
  };

  const schedule = () => {
    haptics.selection();
    setScheduled(scheduled ? null : 'Tomorrow, 9:00 AM');
  };

  const sendNow = () => {
    haptics.success();
    router.push('/(tabs)/inbox');
  };

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader
          title="Compose"
          subtitle="AI-powered messaging"
          onBack={() => router.push('/(tabs)/inbox')}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top + 40}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-4">
              <SegmentedControl
                options={[
                  { value: 'message', label: 'Message' },
                  { value: 'email', label: 'Email' },
                ]}
                value={mode}
                onChange={(v) => setMode(v)}
              />
            </View>

            <Field label="To">
              <TextInput
                value={to}
                onChangeText={setTo}
                placeholder={mode === 'email' ? 'name@company.com' : 'Search contacts'}
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                className="text-foreground"
                style={{ fontFamily: 'Inter_400Regular', fontSize: 15 }}
              />
            </Field>

            {mode === 'email' && (
              <Animated.View entering={FadeInDown.duration(300)} layout={LinearTransition}>
                <Field label="Subject">
                  <TextInput
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Add a subject"
                    placeholderTextColor="#64748B"
                    className="text-foreground"
                    style={{ fontFamily: 'Inter_500Medium', fontSize: 15 }}
                  />
                </Field>
              </Animated.View>
            )}

            <Animated.View
              layout={LinearTransition}
              className="border-glass-border bg-surface mt-1 rounded-3xl border p-4"
            >
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder={mode === 'email' ? 'Write your email…' : 'Type a message…'}
                placeholderTextColor="#64748B"
                multiline
                className="text-foreground"
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 15,
                  minHeight: 160,
                  lineHeight: 22,
                  textAlignVertical: 'top',
                }}
              />
              {busy && (
                <Animated.View entering={FadeIn} className="mt-3 flex-row items-center gap-2">
                  <ActivityIndicator color="#2563FF" size="small" />
                  <Text
                    style={{ color: '#94A3B8', fontFamily: 'Inter_500Medium' }}
                    className="text-xs"
                  >
                    Relay AI is working…
                  </Text>
                </Animated.View>
              )}
            </Animated.View>

            <View className="mt-4">
              <View className="mb-2 flex-row items-center gap-1.5">
                <Sparkles color="#6B4EFF" size={14} />
                <Text
                  style={{ color: '#94A3B8', fontFamily: 'Inter_600SemiBold' }}
                  className="text-xs tracking-wide uppercase"
                >
                  AI tools
                </Text>
              </View>
              <View className="flex-row gap-2">
                {AI_TOOLS.map((t) => {
                  const Icon = t.icon;
                  const active = busy === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => runTool(t.id)}
                      className="border-glass-border bg-surface-2/70 flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl border py-3 active:opacity-70"
                    >
                      <Icon color={active ? '#2563FF' : '#38BDF8'} size={16} />
                      <Text
                        style={{ color: '#F8FAFC', fontFamily: 'Inter_600SemiBold' }}
                        className="text-[13px]"
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={schedule}
              className="border-glass-border bg-surface-2/70 mt-3 flex-row items-center gap-2.5 rounded-2xl border px-4 py-3.5 active:opacity-70"
            >
              <Clock color="#F59E0B" size={18} />
              <Text
                style={{ color: '#F8FAFC', fontFamily: 'Inter_500Medium' }}
                className="flex-1 text-sm"
              >
                {scheduled ? `Scheduled · ${scheduled}` : 'Schedule send'}
              </Text>
              {scheduled && (
                <Text
                  style={{ color: '#F59E0B', fontFamily: 'Inter_600SemiBold' }}
                  className="text-xs"
                >
                  Tap to clear
                </Text>
              )}
            </Pressable>
          </ScrollView>

          <View
            style={{ paddingBottom: insets.bottom + 10 }}
            className="border-glass-border bg-surface/80 flex-row gap-2 border-t px-4 pt-3"
          >
            <RelayButton
              variant="secondary"
              iconOnly
              accessibilityLabel="Add attachment"
              onPress={haptics.selection}
            >
              <Paperclip color="#94A3B8" size={18} />
            </RelayButton>
            <RelayButton
              className="flex-1"
              label={scheduled ? 'Schedule' : mode === 'email' ? 'Send email' : 'Send message'}
              onPress={sendNow}
            >
              <Send color="#fff" size={17} />
            </RelayButton>
          </View>
        </KeyboardAvoidingView>
      </GradientBackground>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="border-glass-border bg-surface mb-2 flex-row items-center gap-3 rounded-2xl border px-4 py-3">
      <Text
        style={{ color: '#64748B', fontFamily: 'Inter_600SemiBold', width: 60 }}
        className="text-sm"
      >
        {label}
      </Text>
      <View className="flex-1">{children}</View>
    </View>
  );
}
