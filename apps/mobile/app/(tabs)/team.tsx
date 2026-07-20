import { useRouter } from 'expo-router';
import { Activity, Inbox, TrendingUp, Users } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { GlassCard } from '@/components/GlassCard';
import { GradientBackground } from '@/components/GradientBackground';
import { McpBadge } from '@/components/McpBadge';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

const SHARED = [
  { id: '1', title: 'Unassigned · Proposal follow-up', who: 'BrightPath', unread: 2 },
  { id: '2', title: 'Legal · MSA redlines', who: 'Atlas', unread: 1 },
  { id: '3', title: 'Shared · Onboarding pack', who: 'Acme Corp', unread: 0 },
];

/** 14 — Team Workspace */
export default function TeamScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader
          title="Team Workspace"
          subtitle="Acme Corp Team"
          right={<McpBadge label="Shared" />}
        />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400)} className="mb-4 flex-row gap-3">
            <StatCard icon={Users} label="Members" value="12" />
            <StatCard icon={Inbox} label="Shared" value="38" />
            <StatCard icon={Activity} label="Active" value="6" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(400)}>
            <GlassCard className="mb-4 p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text
                  style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16 }}
                >
                  Team Activity
                </Text>
                <View className="flex-row items-center gap-1">
                  <TrendingUp color={colors.success} size={14} />
                  <Text
                    style={{ color: colors.success, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}
                  >
                    +23%
                  </Text>
                </View>
              </View>
              <ActivityGraph />
              <Text
                style={{
                  color: colors.muted,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  marginTop: 10,
                }}
              >
                Productivity across shared inbox & AI workflows this week.
              </Text>
            </GlassCard>
          </Animated.View>

          <Text
            style={{
              color: colors.foreground,
              fontFamily: 'Inter_700Bold',
              fontSize: 16,
              marginBottom: 10,
            }}
          >
            Shared Inbox
          </Text>
          {SHARED.map((item, i) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(120 + i * 60).duration(350)}>
              <Pressable
                onPress={() => {
                  haptics.selection();
                  router.push('/(tabs)/inbox');
                }}
                className="mb-2.5 active:opacity-80"
              >
                <GlassCard className="flex-row items-center gap-3 px-4 py-3.5">
                  <View
                    style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}
                    className="h-10 w-10 items-center justify-center rounded-full"
                  >
                    <Text
                      style={{ color: colors.brand, fontFamily: 'Inter_700Bold', fontSize: 13 }}
                    >
                      {item.who[0]}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{
                        color: colors.foreground,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 14,
                      }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{ color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 12 }}
                    >
                      {item.who}
                    </Text>
                  </View>
                  {item.unread > 0 && (
                    <View
                      style={{ backgroundColor: colors.brand }}
                      className="min-w-5 items-center rounded-full px-1.5 py-0.5"
                    >
                      <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 11 }}>
                        {item.unread}
                      </Text>
                    </View>
                  )}
                </GlassCard>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </GradientBackground>
    </View>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <GlassCard className="flex-1 items-center py-3.5">
      <Icon color={colors.brandPurple} size={18} />
      <Text
        style={{
          color: colors.foreground,
          fontFamily: 'Inter_700Bold',
          fontSize: 18,
          marginTop: 6,
        }}
      >
        {value}
      </Text>
      <Text style={{ color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 11 }}>
        {label}
      </Text>
    </GlassCard>
  );
}

function ActivityGraph() {
  return (
    <Svg width="100%" height={72} viewBox="0 0 300 72">
      <Path
        d="M0 50 C40 48, 60 30, 90 34 S140 55, 170 28 S230 18, 260 22 S290 40, 300 30"
        stroke={colors.brand}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M0 50 C40 48, 60 30, 90 34 S140 55, 170 28 S230 18, 260 22 S290 40, 300 30 L300 72 L0 72 Z"
        fill="rgba(99,102,241,0.18)"
      />
    </Svg>
  );
}
