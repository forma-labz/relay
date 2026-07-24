import { useRouter } from 'expo-router';
import {
  Bell,
  CalendarClock,
  CheckCheck,
  ListChecks,
  Mail,
  MessageCircle,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from 'heroui-native';

import { EmptyState } from '@/components/EmptyState';
import { GradientBackground } from '@/components/GradientBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { haptics } from '@/lib/haptics';
import { useNotificationsStore } from '@/lib/stores/notificationsStore';
import type { NotificationType } from '@/lib/types';
import { relativeTime } from '@/lib/utils';

const META: Record<NotificationType, { icon: typeof Mail; color: string; tint: string }> = {
  message: { icon: MessageCircle, color: '#16C784', tint: 'rgba(22,199,132,0.16)' },
  email: { icon: Mail, color: '#6B4EFF', tint: 'rgba(107,78,255,0.16)' },
  task: { icon: ListChecks, color: '#F5A524', tint: 'rgba(245,165,36,0.16)' },
  calendar: { icon: CalendarClock, color: '#38BDF8', tint: 'rgba(56,189,248,0.16)' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [foreground, muted, accent] = useThemeColor(['foreground', 'muted', 'accent']);
  const notifications = useNotificationsStore((s) => s.notifications);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const markRead = useNotificationsStore((s) => s.markRead);

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader
          title="Notifications"
          onBack={() => router.back()}
          right={
            <Pressable
              accessibilityLabel="Mark all read"
              onPress={() => {
                haptics.selection();
                markAllRead();
              }}
              className="bg-surface-2/70 h-10 w-10 items-center justify-center rounded-full"
            >
              <CheckCheck color={accent} size={18} />
            </Pressable>
          }
        />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="All caught up" message="You have no notifications." />
          ) : (
            notifications.map((n, i) => {
              const m = META[n.type];
              const Icon = m.icon;
              return (
                <Animated.View key={n.id} entering={FadeInDown.delay(i * 40).duration(340)}>
                  <Pressable
                    onPress={() => {
                      haptics.selection();
                      markRead(n.id);
                    }}
                    style={{ opacity: n.read ? 0.6 : 1 }}
                    className="border-glass-border bg-surface mb-2 flex-row items-center gap-3 rounded-3xl border p-3.5 active:opacity-70"
                  >
                    <View
                      style={{ backgroundColor: m.tint }}
                      className="h-11 w-11 items-center justify-center rounded-2xl"
                    >
                      <Icon color={m.color} size={20} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text
                          style={{ color: foreground, fontFamily: 'Inter_600SemiBold' }}
                          className="text-[14px]"
                        >
                          {n.title}
                        </Text>
                        <Text
                          style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                          className="text-[11px]"
                        >
                          {relativeTime(n.timestamp)}
                        </Text>
                      </View>
                      <Text
                        numberOfLines={2}
                        style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                        className="mt-0.5 text-[13px]"
                      >
                        {n.body}
                      </Text>
                    </View>
                    {!n.read && (
                      <View style={{ backgroundColor: accent }} className="h-2 w-2 rounded-full" />
                    )}
                  </Pressable>
                </Animated.View>
              );
            })
          )}
        </ScrollView>
      </GradientBackground>
    </View>
  );
}
