import { useRouter } from 'expo-router';
import { Check, Lock, Mail, Server } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { GradientBackground } from '@/components/GradientBackground';
import { McpBadge } from '@/components/McpBadge';
import { NeonButton } from '@/components/NeonButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { env } from '@/lib/env';
import { haptics } from '@/lib/haptics';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { connectEmailProvider } from '@/services/emailAccounts';

function GmailGlyph() {
  return (
    <Svg width={26} height={26} viewBox="0 0 48 48">
      <Path fill="#4285F4" d="M6 12v24a3 3 0 003 3h4V17.8L6 12z" />
      <Path fill="#34A853" d="M42 12v24a3 3 0 01-3 3h-4V17.8L42 12z" />
      <Path fill="#FBBC04" d="M35 39V17.8L24 26 13 17.8V39h22z" />
      <Path fill="#EA4335" d="M13 12l11 8.2L35 12l4-3H9l4 3z" />
      <Path fill="#C5221F" d="M6 12l7 5.8V39H9a3 3 0 01-3-3V12z" />
    </Svg>
  );
}

function OutlookGlyph() {
  return (
    <Svg width={26} height={26} viewBox="0 0 48 48">
      <Path fill="#0364B8" d="M44 12v24a2 2 0 01-2 2H22V10h20a2 2 0 012 2z" />
      <Path fill="#0A2767" d="M44 18l-11 7v-7z" />
      <Path fill="#28A8EA" d="M22 14h11v11H22z" />
      <Path fill="#0078D4" d="M4 10h20v28H6a2 2 0 01-2-2V10z" />
      <Path
        fill="#fff"
        d="M14 17c-3.3 0-5.5 2.8-5.5 7s2.2 7 5.5 7 5.5-2.8 5.5-7-2.2-7-5.5-7zm0 11c-1.6 0-2.7-1.6-2.7-4s1.1-4 2.7-4 2.7 1.6 2.7 4-1.1 4-2.7 4z"
      />
    </Svg>
  );
}

interface ProviderDef {
  id: 'gmail' | 'outlook' | 'imap';
  name: string;
  desc: string;
  glyph: React.ReactNode;
  /** MCP server this provider maps to in the orchestrator registry. */
  mcpServer: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    desc: 'Google Workspace & personal',
    glyph: <GmailGlyph />,
    mcpServer: 'gmail-mock',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    desc: 'Microsoft 365 & Hotmail',
    glyph: <OutlookGlyph />,
    mcpServer: 'gmail-mock',
  },
  {
    id: 'imap',
    name: 'Other Email',
    desc: 'IMAP / SMTP providers',
    glyph: <Server color={colors.sky} size={24} />,
    mcpServer: 'gmail-mock',
  },
];

/** 04 — Connect Email (registers email MCP servers) */
export default function ConnectEmail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeEmail = useOnboardingStore((s) => s.completeEmail);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);

  const connect = async (id: ProviderDef['id']) => {
    if (connecting || connected.includes(id)) return;
    haptics.medium();
    setConnecting(id);
    try {
      if (__DEV__ && env.demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 700));
      } else if (id === 'imap') {
        throw new Error(
          'Custom IMAP/SMTP credentials must be entered in Settings after your Relay backend is configured.',
        );
      } else {
        await connectEmailProvider(id);
      }
      haptics.success();
      setConnected((prev) => [...prev, id]);
    } catch (error) {
      haptics.error();
      Alert.alert(
        'Unable to connect account',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setConnecting(null);
    }
  };

  const finish = () => {
    haptics.success();
    completeEmail();
    router.replace('/(tabs)/inbox');
  };

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader title="Connect email" onBack={() => router.back()} />
        <ScrollView contentContainerClassName="px-5 pb-6" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)} className="mb-6">
            <View
              style={{ backgroundColor: 'rgba(99,102,241,0.18)' }}
              className="mb-4 h-16 w-16 items-center justify-center rounded-3xl"
            >
              <Mail color={colors.brand} size={30} />
            </View>
            <View className="mb-2 flex-row items-center gap-2">
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 24 }}>
                Link your accounts
              </Text>
              <McpBadge />
            </View>
            <Text
              style={{
                color: colors.muted,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              Connecting an account registers it as an MCP server the Email Agent can use.
            </Text>
          </Animated.View>

          {PROVIDERS.map((p, i) => {
            const isConnected = connected.includes(p.id);
            const isBusy = connecting === p.id;
            return (
              <Animated.View key={p.id} entering={FadeInDown.delay(80 * i).duration(400)}>
                <Pressable
                  onPress={() => void connect(p.id)}
                  disabled={!!connecting || isConnected}
                  className="mb-3 active:opacity-80"
                >
                  <GlassCard className="flex-row items-center gap-3.5 px-4 py-4">
                    <View
                      style={{ backgroundColor: colors.surface2 }}
                      className="h-12 w-12 items-center justify-center rounded-2xl"
                    >
                      {p.glyph}
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{
                          color: colors.foreground,
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 16,
                        }}
                      >
                        {p.name}
                      </Text>
                      <Text
                        style={{
                          color: colors.muted,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                        }}
                      >
                        {p.desc}
                      </Text>
                    </View>
                    {isBusy ? (
                      <ActivityIndicator color={colors.brand} />
                    ) : isConnected ? (
                      <View
                        style={{ backgroundColor: 'rgba(34,197,94,0.2)' }}
                        className="h-8 w-8 items-center justify-center rounded-full"
                      >
                        <Check color={colors.success} size={16} />
                      </View>
                    ) : (
                      <Text
                        style={{
                          color: colors.brand,
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 13,
                        }}
                      >
                        Connect
                      </Text>
                    )}
                  </GlassCard>
                </Pressable>
              </Animated.View>
            );
          })}

          <View className="mt-4 flex-row items-start gap-2 px-1">
            <Lock color={colors.sky} size={16} />
            <Text
              style={{
                color: colors.muted,
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                flex: 1,
                lineHeight: 18,
              }}
            >
              End-to-end encryption. OAuth tokens stay in secure storage — the Security Agent
              validates permissions before any MCP tool runs.
            </Text>
          </View>
        </ScrollView>

        <View style={{ paddingBottom: insets.bottom + 16 }} className="px-5 pt-2">
          <NeonButton
            label={connected.length ? 'Continue to Inbox' : 'Skip for now'}
            variant={connected.length ? 'primary' : 'secondary'}
            onPress={finish}
          />
        </View>
      </GradientBackground>
    </View>
  );
}
