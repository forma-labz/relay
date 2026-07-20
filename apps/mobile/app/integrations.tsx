import { useRouter } from 'expo-router';
import { Plus, Server } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { GradientBackground } from '@/components/GradientBackground';
import { McpBadge } from '@/components/McpBadge';
import { NeonButton } from '@/components/NeonButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { MCP_SERVERS, type McpHealth } from '@/mcp/registry';

function healthColor(h: McpHealth): string {
  if (h === 'healthy') return colors.success;
  if (h === 'degraded') return colors.warning;
  return colors.muted;
}

/** MCP Registry / Integrations Hub — discoverable capability OS. */
export default function IntegrationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader
          title="MCP Registry"
          subtitle="Integrations hub"
          onBack={() => router.back()}
          right={<McpBadge />}
        />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              color: colors.muted,
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              lineHeight: 19,
              marginBottom: 16,
            }}
          >
            Every capability is a discoverable MCP server. The Relay Orchestrator routes specialist
            agents to healthy tools below.
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {MCP_SERVERS.map((s, i) => (
              <Animated.View
                key={s.id}
                entering={FadeInDown.delay(i * 40).duration(320)}
                style={{ width: '47%', flexGrow: 1 }}
              >
                <GlassCard className="p-3.5">
                  <View className="mb-2 flex-row items-center justify-between">
                    <View
                      style={{ backgroundColor: s.iconColor + '33' }}
                      className="h-9 w-9 items-center justify-center rounded-xl"
                    >
                      <Server
                        color={s.iconColor === '#FFFFFF' ? colors.foreground : s.iconColor}
                        size={16}
                      />
                    </View>
                    <View
                      style={{ backgroundColor: healthColor(s.health) }}
                      className="h-2 w-2 rounded-full"
                    />
                  </View>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                    }}
                  >
                    {s.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.muted,
                      fontFamily: 'Inter_400Regular',
                      fontSize: 11,
                      marginTop: 4,
                      minHeight: 32,
                    }}
                    numberOfLines={2}
                  >
                    {s.description}
                  </Text>
                  <Text
                    style={{
                      color: healthColor(s.health),
                      fontFamily: 'Inter_500Medium',
                      fontSize: 10,
                      marginTop: 8,
                      textTransform: 'capitalize',
                    }}
                  >
                    {s.health}
                  </Text>
                </GlassCard>
              </Animated.View>
            ))}
          </View>

          <View className="mt-5">
            <NeonButton
              label="Add New MCP"
              onPress={() => {
                haptics.selection();
                router.push('/connect-email');
              }}
            />
            <Pressable
              onPress={() => router.push('/paywall')}
              className="mt-3 flex-row items-center justify-center gap-2 py-2 active:opacity-70"
            >
              <Plus color={colors.brandPurple} size={16} />
              <Text
                style={{ color: colors.brandPurple, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}
              >
                Unlock marketplace with Pro
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </GradientBackground>
    </View>
  );
}
