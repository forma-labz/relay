import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from 'heroui-native';

import { GlassCard } from '@/components/GlassCard';
import { GradientBackground } from '@/components/GradientBackground';
import { InitialsAvatar } from '@/components/InitialsAvatar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { haptics } from '@/lib/haptics';
import { getContact } from '@/lib/mockData';
import { useContactsStore } from '@/lib/stores/contactsStore';
import { relativeTime } from '@/lib/utils';

const TIMELINE = [
  { icon: MessageCircle, color: '#22C55E', label: 'Sent a message', when: '12m ago' },
  { icon: Mail, color: '#6B4EFF', label: 'Emailed the revised deck', when: '2h ago' },
  { icon: FileText, color: '#EF4444', label: 'Shared Relay_Brand_v3.pdf', when: '1d ago' },
  { icon: CalendarClock, color: '#F59E0B', label: 'Kickoff call completed', when: '3d ago' },
];

const TASKS = [
  { label: 'Send Q3 proposal', done: false },
  { label: 'Confirm renewal date', done: false },
  { label: 'Share brand guidelines', done: true },
];

function Action({
  icon: Icon,
  label,
  color,
  muted,
}: {
  icon: typeof Mail;
  label: string;
  color: string;
  muted: string;
}) {
  return (
    <View className="flex-1 items-center gap-1.5">
      <View
        style={{ backgroundColor: color + '1F' }}
        className="h-12 w-12 items-center justify-center rounded-2xl active:opacity-70"
      >
        <Icon color={color} size={22} />
      </View>
      <Text style={{ color: muted, fontFamily: 'Inter_500Medium' }} className="text-[11px]">
        {label}
      </Text>
    </View>
  );
}

export default function ContactProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [foreground, muted, accent, warning, success] = useThemeColor([
    'foreground',
    'muted',
    'accent',
    'warning',
    'success',
  ]);

  const storeContact = useContactsStore((s) => s.contacts.find((c) => c.id === id));
  const toggleFavorite = useContactsStore((s) => s.toggleFavorite);
  const contact = storeContact ?? (id ? getContact(id) : undefined);

  if (!contact) {
    return (
      <View className="flex-1">
        <GradientBackground glow={false}>
          <ScreenHeader title="Contact" onBack={() => router.back()} />
          <View className="flex-1 items-center justify-center">
            <Text style={{ color: muted, fontFamily: 'Inter_500Medium' }}>Contact not found</Text>
          </View>
        </GradientBackground>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <GradientBackground>
        <ScreenHeader
          title="Profile"
          onBack={() => router.back()}
          right={
            <Star
              onPress={() => {
                haptics.selection();
                toggleFavorite(contact.id);
              }}
              color={contact.favorite ? warning : muted}
              fill={contact.favorite ? warning : 'transparent'}
              size={22}
            />
          }
        />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400)} className="items-center pt-2 pb-4">
            <InitialsAvatar
              initials={contact.initials}
              color={contact.avatarColor}
              size={92}
              ring
            />
            <Text
              style={{ color: foreground, fontFamily: 'Inter_700Bold' }}
              className="mt-3 text-2xl"
            >
              {contact.name}
            </Text>
            {contact.role && (
              <View className="mt-1 flex-row items-center gap-1.5">
                <Building2 color={muted} size={13} />
                <Text style={{ color: muted, fontFamily: 'Inter_500Medium' }} className="text-sm">
                  {contact.role} · {contact.company}
                </Text>
              </View>
            )}
            <View className="mt-3 flex-row flex-wrap justify-center gap-1.5">
              {contact.tags.map((t) => (
                <View key={t} className="bg-brand/12 rounded-full px-2.5 py-1">
                  <Text
                    style={{ color: accent, fontFamily: 'Inter_500Medium' }}
                    className="text-[11px]"
                  >
                    {t}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(80).duration(400)}
            className="border-glass-border bg-surface mb-4 flex-row justify-around rounded-3xl border px-2 py-4"
          >
            <Action icon={MessageCircle} label="Chat" color="#22C55E" muted={muted} />
            <Action icon={Mail} label="Email" color="#6B4EFF" muted={muted} />
            <Action icon={Phone} label="Call" color="#38BDF8" muted={muted} />
            <Action icon={CalendarClock} label="Meet" color="#F59E0B" muted={muted} />
          </Animated.View>

          {/* Relationship insight */}
          <Animated.View entering={FadeInDown.delay(140).duration(400)}>
            <GlassCard className="mb-4 rounded-3xl p-4">
              <View className="flex-row items-center gap-2">
                <Sparkles color="#6B4EFF" size={16} />
                <Text
                  style={{ color: foreground, fontFamily: 'Inter_600SemiBold' }}
                  className="text-sm"
                >
                  Relationship insight
                </Text>
              </View>
              <Text
                style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                className="mt-2 text-[13px] leading-5"
              >
                Highly engaged — responds within an hour on average. Last interaction{' '}
                {relativeTime(contact.lastInteraction)} ago. Renewal conversation recommended this
                quarter.
              </Text>
              <View className="mt-3 flex-row items-center gap-1.5">
                <TrendingUp color={success} size={14} />
                <Text
                  style={{ color: success, fontFamily: 'Inter_600SemiBold' }}
                  className="text-xs"
                >
                  Health score 92 · Strong
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Notes */}
          {contact.notes && (
            <Animated.View
              entering={FadeInDown.delay(180).duration(400)}
              className="border-glass-border bg-surface mb-4 rounded-3xl border p-4"
            >
              <Text
                style={{ color: muted, fontFamily: 'Inter_600SemiBold' }}
                className="mb-1.5 text-xs tracking-wide uppercase"
              >
                Notes
              </Text>
              <Text
                style={{ color: foreground, fontFamily: 'Inter_400Regular' }}
                className="text-[14px] leading-5"
              >
                {contact.notes}
              </Text>
            </Animated.View>
          )}

          {/* Tasks */}
          <Animated.View
            entering={FadeInDown.delay(220).duration(400)}
            className="border-glass-border bg-surface mb-4 rounded-3xl border p-4"
          >
            <Text
              style={{ color: muted, fontFamily: 'Inter_600SemiBold' }}
              className="mb-2 text-xs tracking-wide uppercase"
            >
              Tasks
            </Text>
            {TASKS.map((t) => (
              <View key={t.label} className="flex-row items-center gap-2.5 py-1.5">
                <CheckCircle2
                  color={t.done ? success : muted}
                  fill={t.done ? success : 'transparent'}
                  size={18}
                />
                <Text
                  style={{
                    color: t.done ? muted : foreground,
                    fontFamily: 'Inter_500Medium',
                    textDecorationLine: t.done ? 'line-through' : 'none',
                  }}
                  className="text-[14px]"
                >
                  {t.label}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Timeline */}
          <Animated.View
            entering={FadeInDown.delay(260).duration(400)}
            className="border-glass-border bg-surface rounded-3xl border p-4"
          >
            <Text
              style={{ color: muted, fontFamily: 'Inter_600SemiBold' }}
              className="mb-3 text-xs tracking-wide uppercase"
            >
              Communication history
            </Text>
            {TIMELINE.map((item, i) => {
              const Icon = item.icon;
              const last = i === TIMELINE.length - 1;
              return (
                <View key={i} className="flex-row gap-3">
                  <View className="items-center">
                    <View
                      style={{ backgroundColor: item.color + '1F' }}
                      className="h-9 w-9 items-center justify-center rounded-full"
                    >
                      <Icon color={item.color} size={16} />
                    </View>
                    {!last && <View className="bg-glass-border my-1 w-px flex-1" />}
                  </View>
                  <View className={last ? 'pb-0' : 'pb-4'}>
                    <Text
                      style={{ color: foreground, fontFamily: 'Inter_500Medium' }}
                      className="text-[14px]"
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                      className="text-[12px]"
                    >
                      {item.when}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        </ScrollView>
      </GradientBackground>
    </View>
  );
}
