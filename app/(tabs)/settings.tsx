import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Database,
  Lock,
  LogOut,
  type LucideIcon,
  Mail,
  Monitor,
  Moon,
  Shield,
  Sun,
  UserCog,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Switch, useThemeColor } from 'heroui-native';

import { GradientBackground } from '@/components/GradientBackground';
import { InitialsAvatar } from '@/components/InitialsAvatar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { currentUser } from '@/lib/mockData';
import { haptics } from '@/lib/haptics';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import type { ThemePref } from '@/lib/types';

const THEME_OPTIONS: { value: ThemePref; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [foreground, muted, accent] = useThemeColor(['foreground', 'muted', 'accent']);
  const s = useSettingsStore();
  const signOut = useOnboardingStore((state) => state.signOut);

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader title="Settings" large />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <Pressable
              onPress={haptics.selection}
              className="border-glass-border bg-surface mb-5 flex-row items-center gap-3 rounded-3xl border p-4 active:opacity-70"
            >
              <InitialsAvatar
                initials={currentUser.initials}
                color={currentUser.avatarColor}
                size={56}
                ring
              />
              <View className="flex-1">
                <Text
                  style={{ color: foreground, fontFamily: 'Inter_700Bold' }}
                  className="text-lg"
                >
                  {s.profileName}
                </Text>
                <Text
                  style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                  className="text-[13px]"
                >
                  {s.profileEmail}
                </Text>
                <View className="bg-brand/15 mt-1.5 self-start rounded-full px-2.5 py-0.5">
                  <Text
                    style={{ color: accent, fontFamily: 'Inter_600SemiBold' }}
                    className="text-[11px]"
                  >
                    {currentUser.plan}
                  </Text>
                </View>
              </View>
              <ChevronRight color={muted} size={20} />
            </Pressable>
          </Animated.View>

          {/* Appearance */}
          <Section title="Appearance">
            <View className="flex-row gap-2 p-3">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = s.theme === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      haptics.selection();
                      s.setTheme(opt.value);
                    }}
                    style={{ borderColor: active ? accent : 'transparent' }}
                    className="bg-surface-2/60 flex-1 items-center gap-1.5 rounded-2xl border-2 py-3 active:opacity-70"
                  >
                    <Icon color={active ? accent : muted} size={20} />
                    <Text
                      style={{ color: active ? foreground : muted, fontFamily: 'Inter_500Medium' }}
                      className="text-[12px]"
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* Connected accounts */}
          <Section title="Connected accounts">
            {s.accounts.map((acc, i) => (
              <Row
                key={acc.id}
                icon={Mail}
                iconColor="#6B4EFF"
                label={acc.email}
                sub={`${acc.provider.toUpperCase()} · ${acc.status}`}
                last={i === s.accounts.length - 1}
              />
            ))}
          </Section>

          {/* Security */}
          <Section title="Security & privacy">
            <ToggleRow
              icon={Lock}
              iconColor="#22C55E"
              label="End-to-end encryption"
              value={s.encryptionEnabled}
              onToggle={() => s.toggle('encryptionEnabled')}
            />
            <ToggleRow
              icon={Shield}
              iconColor="#38BDF8"
              label="Biometric unlock"
              value={s.biometricsEnabled}
              onToggle={() => s.toggle('biometricsEnabled')}
            />
            <Row icon={Shield} iconColor="#94A3B8" label="Privacy policy" last />
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            <ToggleRow
              icon={Mail}
              iconColor="#6B4EFF"
              label="Email notifications"
              value={s.emailNotifications}
              onToggle={() => s.toggle('emailNotifications')}
            />
            <ToggleRow
              icon={Bell}
              iconColor="#F59E0B"
              label="Message notifications"
              value={s.messageNotifications}
              onToggle={() => s.toggle('messageNotifications')}
            />
            <ToggleRow
              icon={Bell}
              iconColor="#2563FF"
              label="Task reminders"
              value={s.taskReminders}
              onToggle={() => s.toggle('taskReminders')}
              last
            />
          </Section>

          {/* Account */}
          <Section title="Account">
            <Row
              icon={CreditCard}
              iconColor="#22C55E"
              label="Subscription"
              sub={currentUser.plan}
              onPress={haptics.selection}
            />
            <Row icon={Database} iconColor="#38BDF8" label="Storage" sub="4.2 GB of 50 GB used" />
            <Row icon={UserCog} iconColor="#6B4EFF" label="Manage profile" last />
          </Section>

          <Animated.View entering={FadeInDown.delay(120).duration(400)}>
            <Pressable
              onPress={() => {
                haptics.medium();
                signOut();
                router.replace('/welcome');
              }}
              className="border-glass-border bg-surface mt-2 flex-row items-center justify-center gap-2 rounded-2xl border py-3.5 active:opacity-70"
            >
              <LogOut color="#EF4444" size={18} />
              <Text
                style={{ color: '#EF4444', fontFamily: 'Inter_600SemiBold' }}
                className="text-[15px]"
              >
                Sign out
              </Text>
            </Pressable>
          </Animated.View>

          <Text
            style={{ color: muted, fontFamily: 'Inter_400Regular' }}
            className="mt-6 text-center text-xs"
          >
            Relay v1.0.0 · Chat Fast. Email Professionally.
          </Text>
        </ScrollView>
      </GradientBackground>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [muted] = useThemeColor(['muted']);
  return (
    <Animated.View entering={FadeInDown.duration(400)} className="mb-5">
      <Text
        style={{ color: muted, fontFamily: 'Inter_600SemiBold' }}
        className="mb-2 ml-1 text-xs tracking-wide uppercase"
      >
        {title}
      </Text>
      <View className="border-glass-border bg-surface overflow-hidden rounded-3xl border">
        {children}
      </View>
    </Animated.View>
  );
}

function Row({
  icon: Icon,
  iconColor,
  label,
  sub,
  last,
  onPress,
}: {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  sub?: string;
  last?: boolean;
  onPress?: () => void;
}) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);
  return (
    <Pressable
      onPress={onPress ?? haptics.selection}
      className={`flex-row items-center gap-3 px-4 py-3.5 active:opacity-70 ${last ? '' : 'border-glass-border border-b'}`}
    >
      <View
        style={{ backgroundColor: iconColor + '1F' }}
        className="h-9 w-9 items-center justify-center rounded-xl"
      >
        <Icon color={iconColor} size={17} />
      </View>
      <View className="flex-1">
        <Text style={{ color: foreground, fontFamily: 'Inter_500Medium' }} className="text-[14px]">
          {label}
        </Text>
        {sub && (
          <Text style={{ color: muted, fontFamily: 'Inter_400Regular' }} className="text-[12px]">
            {sub}
          </Text>
        )}
      </View>
      <ChevronRight color={muted} size={18} />
    </Pressable>
  );
}

function ToggleRow({
  icon: Icon,
  iconColor,
  label,
  value,
  onToggle,
  last,
}: {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  const [foreground] = useThemeColor(['foreground']);
  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-3 ${last ? '' : 'border-glass-border border-b'}`}
    >
      <View
        style={{ backgroundColor: iconColor + '1F' }}
        className="h-9 w-9 items-center justify-center rounded-xl"
      >
        <Icon color={iconColor} size={17} />
      </View>
      <Text
        style={{ color: foreground, fontFamily: 'Inter_500Medium' }}
        className="flex-1 text-[14px]"
      >
        {label}
      </Text>
      <Switch
        isSelected={value}
        onSelectedChange={() => {
          haptics.selection();
          onToggle();
        }}
      />
    </View>
  );
}
