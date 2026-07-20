import { useRouter } from 'expo-router';
import { Check, ChevronRight, Mail, Plus, Server } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { GradientBackground } from '@/components/GradientBackground';
import { RelayButton } from '@/components/RelayButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { haptics } from '@/lib/haptics';
import { env } from '@/lib/env';
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
}

const PROVIDERS: ProviderDef[] = [
  { id: 'gmail', name: 'Gmail', desc: 'Google Workspace & personal', glyph: <GmailGlyph /> },
  { id: 'outlook', name: 'Outlook', desc: 'Microsoft 365 & Hotmail', glyph: <OutlookGlyph /> },
  {
    id: 'imap',
    name: 'IMAP / SMTP',
    desc: 'Any other email provider',
    glyph: <Server color="#38BDF8" size={24} />,
  },
];

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
            <View className="bg-brand/15 mb-4 h-16 w-16 items-center justify-center rounded-3xl">
              <Mail color="#2563FF" size={30} />
            </View>
            <Text style={{ color: '#F8FAFC', fontFamily: 'Inter_700Bold' }} className="text-2xl">
              Link your accounts
            </Text>
            <Text
              style={{ color: '#94A3B8', fontFamily: 'Inter_400Regular' }}
              className="mt-1 text-sm leading-5"
            >
              Bring email and chat into one place. You can add more accounts anytime from Settings.
            </Text>
          </Animated.View>

          <View className="gap-3">
            {PROVIDERS.map((p, i) => {
              const isConnected = connected.includes(p.id);
              const isConnecting = connecting === p.id;
              return (
                <Animated.View key={p.id} entering={FadeInDown.delay(100 + i * 90).duration(450)}>
                  <Pressable onPress={() => connect(p.id)} disabled={isConnected}>
                    <GlassCard className="flex-row items-center gap-3 rounded-3xl p-4">
                      <View className="bg-surface-2 h-11 w-11 items-center justify-center rounded-2xl">
                        {p.glyph}
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ color: '#F8FAFC', fontFamily: 'Inter_600SemiBold' }}
                          className="text-base"
                        >
                          {p.name}
                        </Text>
                        <Text
                          style={{
                            color: isConnected ? '#22C55E' : '#94A3B8',
                            fontFamily: 'Inter_400Regular',
                          }}
                          className="text-xs"
                        >
                          {isConnected ? 'Connected' : isConnecting ? 'Connecting…' : p.desc}
                        </Text>
                      </View>
                      {isConnecting ? (
                        <ActivityIndicator color="#2563FF" />
                      ) : isConnected ? (
                        <View className="bg-success h-7 w-7 items-center justify-center rounded-full">
                          <Check color="#fff" size={16} />
                        </View>
                      ) : (
                        <View className="bg-brand/15 h-7 w-7 items-center justify-center rounded-full">
                          <Plus color="#2563FF" size={16} />
                        </View>
                      )}
                    </GlassCard>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        <View style={{ paddingBottom: insets.bottom + 12 }} className="gap-2 px-5 pt-2">
          <RelayButton label={connected.length > 0 ? 'Continue' : 'Skip for now'} onPress={finish}>
            <ChevronRight color="#fff" size={18} />
          </RelayButton>
        </View>
      </GradientBackground>
    </View>
  );
}
