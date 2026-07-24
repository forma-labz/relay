import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  AlignLeft,
  Languages,
  Minimize2,
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { McpBadge } from '@/components/McpBadge';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, gradients } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

/** AI toolbar actions — routed via Email Agent / Smart Composer MCP tools. */
type AiTool = 'rewrite' | 'improve' | 'shorten' | 'translate';

const AI_TOOLS: { id: AiTool; label: string; icon: typeof Wand2 }[] = [
  { id: 'rewrite', label: 'AI Rewrite', icon: Wand2 },
  { id: 'improve', label: 'Improve', icon: Sparkles },
  { id: 'shorten', label: 'Shorten', icon: Minimize2 },
  { id: 'translate', label: 'Translate', icon: Languages },
];

/** 07 — Smart Composer */
export default function ComposeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [to, setTo] = useState('sarah@acme.com');
  const [subject, setSubject] = useState('Project update & next steps');
  const [body, setBody] = useState(
    "Hi Sarah,\n\nThanks for the call earlier. I've attached the latest proposal and would love to schedule a follow-up.\n\nBest,\nJordan",
  );
  const [busy, setBusy] = useState<AiTool | null>(null);

  const runTool = (tool: AiTool) => {
    if (!body.trim()) {
      haptics.medium();
      return;
    }
    haptics.selection();
    setBusy(tool);
    // MCP integration point: POST /v1/ai/actions → Email Agent → model router
    setTimeout(() => {
      if (tool === 'rewrite' || tool === 'improve') {
        setBody(
          "Hi Sarah,\n\nGreat speaking earlier — I've attached BrightPath_Proposal_v3.pdf. Are you free Thursday 2pm to walk through pricing and onboarding?\n\nBest,\nJordan",
        );
      } else if (tool === 'shorten') {
        setBody('Hi Sarah — proposal attached. Free Thursday 2pm to review?\n\n— Jordan');
      } else {
        setBody(
          'Hola Sarah,\n\nAdjunto la propuesta más reciente. ¿Podemos agendar una llamada el jueves a las 2pm?\n\nSaludos,\nJordan',
        );
      }
      haptics.success();
      setBusy(null);
    }, 900);
  };

  const sendNow = () => {
    haptics.success();
    // MCP: email.send requires approval via Security Agent in production
    router.push('/(tabs)/inbox');
  };

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader
          title="New Message"
          subtitle="Smart Composer"
          onBack={() => router.push('/(tabs)/inbox')}
          right={<McpBadge label="Email" />}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top + 40}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.duration(350)}>
              <Field label="To" value={to} onChangeText={setTo} />
              <Field label="Subject" value={subject} onChangeText={setSubject} />
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.glassBorder,
                  minHeight: 220,
                }}
                className="mt-3 rounded-2xl border px-4 py-3"
              >
                <View className="mb-2 flex-row items-center gap-1.5">
                  <AlignLeft color={colors.muted} size={14} />
                  <Text
                    style={{ color: colors.muted, fontFamily: 'Inter_500Medium', fontSize: 12 }}
                  >
                    Body
                  </Text>
                </View>
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  multiline
                  placeholder="Write your message…"
                  placeholderTextColor={colors.muted}
                  style={{
                    color: colors.foreground,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 15,
                    lineHeight: 22,
                    minHeight: 160,
                    textAlignVertical: 'top',
                  }}
                />
              </View>
            </Animated.View>
          </ScrollView>

          {/* AI Toolbar — Email Agent quick actions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.glassBorder,
              backgroundColor: 'rgba(22,22,31,0.92)',
            }}
          >
            {AI_TOOLS.map((t) => {
              const Icon = t.icon;
              const active = busy === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => runTool(t.id)}
                  disabled={!!busy}
                  className="active:opacity-80"
                >
                  <View
                    style={{
                      borderColor: active ? colors.brand : colors.glassBorder,
                      backgroundColor: active ? 'rgba(99,102,241,0.2)' : colors.surface2,
                      shadowColor: active ? colors.brand : 'transparent',
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                    }}
                    className="flex-row items-center gap-1.5 rounded-full border px-3.5 py-2"
                  >
                    {active ? (
                      <ActivityIndicator color={colors.brand} size="small" />
                    ) : (
                      <Icon color={colors.brandPurple} size={14} />
                    )}
                    <Text
                      style={{
                        color: colors.foreground,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 12,
                      }}
                    >
                      {t.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View
            style={{ paddingBottom: insets.bottom + 10 }}
            className="flex-row items-center gap-3 border-t border-white/10 px-4 pt-3"
          >
            <Pressable
              accessibilityLabel="Attach"
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
              style={{ backgroundColor: colors.surface2 }}
            >
              <Paperclip color={colors.muted} size={20} />
            </Pressable>
            <Pressable onPress={sendNow} className="flex-1 active:opacity-90">
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: colors.brand,
                  shadowOpacity: 0.5,
                  shadowRadius: 14,
                }}
              >
                <Send color="#fff" size={18} />
                <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 }}>
                  Send
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </GradientBackground>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View
      style={{ backgroundColor: colors.surface, borderColor: colors.glassBorder }}
      className="mt-3 rounded-2xl border px-4 py-3"
    >
      <Text style={{ color: colors.muted, fontFamily: 'Inter_500Medium', fontSize: 11 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.muted}
        style={{
          color: colors.foreground,
          fontFamily: 'Inter_500Medium',
          fontSize: 15,
          padding: 0,
          marginTop: 4,
        }}
      />
    </View>
  );
}
