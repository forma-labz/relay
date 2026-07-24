import { useRouter } from 'expo-router';
import { Activity, Gauge, Globe2, Shield, Smartphone, Split } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Switch } from 'heroui-native';
import { useEffect } from 'react';

import { GradientBackground } from '@/components/GradientBackground';
import { NeonButton } from '@/components/NeonButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { colors, radii } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import {
  secureRelayGateway,
  secureRelayRegionLabel,
  useSecureRelayStore,
} from '@/lib/stores/secureRelayStore';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import type { SecureRelayRegion } from '@/lib/types';

const REGIONS: SecureRelayRegion[] = ['us', 'eu', 'apac'];

const NODES = [
  { left: 18, top: 28, delay: 0 },
  { left: 72, top: 22, delay: 200 },
  { left: 48, top: 55, delay: 400 },
  { left: 28, top: 72, delay: 150 },
  { left: 68, top: 68, delay: 320 },
];

function NetworkNode({
  left,
  top,
  delay,
  active,
}: {
  left: number;
  top: number;
  delay: number;
  active: boolean;
}) {
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    if (!active) {
      pulse.value = 0.25;
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 1400 + delay }), -1, true);
  }, [active, delay, pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.85 + pulse.value * 0.25 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: active ? colors.success : colors.muted,
          shadowColor: colors.success,
          shadowOpacity: active ? 0.8 : 0,
          shadowRadius: 8,
        } as const,
        style,
      ]}
    />
  );
}

/** Secure Relay Network — mock enterprise encrypted tunnel UI. */
export default function SecureRelayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const plan = useSettingsStore((s) => s.plan);
  const {
    status,
    region,
    splitTunneling,
    latencyMs,
    bandwidthMbps,
    connectedDevices,
    connecting,
    setRegion,
    setSplitTunneling,
    connect,
    disconnect,
  } = useSecureRelayStore();

  const [upsellVisible, setUpsellVisible] = useState(false);
  const isBusiness = plan === 'Business';
  const isProtected = status === 'protected';

  const onConnectPress = async () => {
    if (!isBusiness) {
      haptics.warning();
      setUpsellVisible(true);
      return;
    }
    if (isProtected || connecting) {
      disconnect();
      return;
    }
    await connect();
  };

  return (
    <View className="flex-1">
      <GradientBackground glow>
        <ScreenHeader title="Secure Relay" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400)} className="items-center pt-2">
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isProtected
                  ? 'rgba(22,199,132,0.15)'
                  : status === 'limited'
                    ? 'rgba(245,165,36,0.15)'
                    : 'rgba(45,107,255,0.12)',
                borderWidth: 1,
                borderColor: isProtected
                  ? colors.success
                  : status === 'limited'
                    ? colors.warning
                    : colors.brand,
                shadowColor: isProtected ? colors.success : colors.brand,
                shadowOpacity: 0.4,
                shadowRadius: 20,
              }}
            >
              <Shield
                color={
                  isProtected
                    ? colors.success
                    : status === 'limited'
                      ? colors.warning
                      : colors.brand
                }
                size={44}
                strokeWidth={1.75}
              />
            </View>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: 'Inter_700Bold',
                fontSize: 22,
                marginTop: 16,
              }}
            >
              Secure Relay Network
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 19,
                paddingHorizontal: 8,
              }}
            >
              Encrypted tunnel between Relay clients and Relay infrastructure. Enable per workspace
              for enterprise private gateways.
            </Text>
            <StatusBadge status={status} size="md" className="mt-4" />
          </Animated.View>

          {/* Network visualization */}
          <Animated.View entering={FadeIn.delay(100).duration(500)} className="mt-6">
            <View
              style={{
                height: 160,
                borderRadius: radii.xl,
                borderWidth: 1,
                borderColor: colors.glassBorder,
                backgroundColor: colors.card,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.35,
                }}
              >
                {/* soft grid lines */}
                {[20, 50, 80].map((top) => (
                  <View
                    key={`h-${top}`}
                    style={{
                      position: 'absolute',
                      top: `${top}%`,
                      left: 0,
                      right: 0,
                      height: 1,
                      backgroundColor: 'rgba(45,107,255,0.25)',
                    }}
                  />
                ))}
                {[25, 50, 75].map((left) => (
                  <View
                    key={`v-${left}`}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: 'rgba(139,92,246,0.2)',
                    }}
                  />
                ))}
              </View>
              {NODES.map((n) => (
                <NetworkNode key={`${n.left}-${n.top}`} {...n} active={isProtected || connecting} />
              ))}
              <View className="absolute right-3 bottom-3 left-3 flex-row items-center justify-between">
                <Text style={{ color: colors.muted, fontFamily: 'Inter_500Medium', fontSize: 11 }}>
                  {secureRelayGateway(region)}
                </Text>
                <Text style={{ color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 11 }}>
                  WireGuard-class tunnel
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Metrics */}
          <View className="mt-4 flex-row gap-3">
            <MetricCard
              icon={Gauge}
              label="Latency"
              value={isProtected ? `${latencyMs} ms` : '—'}
            />
            <MetricCard
              icon={Activity}
              label="Bandwidth"
              value={isProtected ? `${bandwidthMbps} Mbps` : '—'}
            />
            <MetricCard
              icon={Smartphone}
              label="Devices"
              value={isProtected ? String(connectedDevices) : '—'}
            />
          </View>

          {/* Region picker */}
          <Text
            style={{
              color: colors.muted,
              fontFamily: 'Inter_600SemiBold',
              fontSize: 12,
              marginTop: 20,
              marginBottom: 8,
              marginLeft: 4,
              letterSpacing: 0.4,
            }}
          >
            GATEWAY REGION
          </Text>
          <View className="flex-row gap-2">
            {REGIONS.map((r) => {
              const active = region === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => {
                    haptics.selection();
                    setRegion(r);
                  }}
                  className="flex-1 items-center py-3 active:opacity-80"
                  style={{
                    borderRadius: radii.button,
                    borderWidth: 1.5,
                    borderColor: active ? colors.brand : colors.glassBorder,
                    backgroundColor: active ? 'rgba(45,107,255,0.15)' : colors.card,
                  }}
                >
                  <Globe2 color={active ? colors.brand : colors.muted} size={16} />
                  <Text
                    style={{
                      color: active ? colors.foreground : colors.muted,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 12,
                      marginTop: 6,
                    }}
                  >
                    {secureRelayRegionLabel(r)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Split tunneling */}
          <View
            className="mt-4 flex-row items-center justify-between px-4 py-3.5"
            style={{
              borderRadius: radii.xl,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              backgroundColor: colors.card,
            }}
          >
            <View className="flex-1 flex-row items-center gap-3 pr-3">
              <Split color={colors.brandPurple} size={20} strokeWidth={2} />
              <View className="flex-1">
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                  }}
                >
                  Split tunneling
                </Text>
                <Text style={{ color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 12 }}>
                  Only Relay traffic uses the private gateway
                </Text>
              </View>
            </View>
            <Switch
              isSelected={splitTunneling}
              onSelectedChange={(v) => {
                haptics.selection();
                setSplitTunneling(v);
              }}
            />
          </View>

          {!isBusiness && (
            <Pressable
              onPress={() => {
                haptics.selection();
                router.push('/paywall');
              }}
              className="mt-4 active:opacity-80"
              style={{
                borderRadius: radii.xl,
                borderWidth: 1,
                borderColor: 'rgba(139,92,246,0.35)',
                backgroundColor: 'rgba(139,92,246,0.1)',
                padding: 14,
              }}
            >
              <Text
                style={{ color: colors.brandPurple, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}
              >
                Business plan required
              </Text>
              <Text
                style={{
                  color: colors.muted,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Upgrade to connect Secure Relay Network for your organization.
              </Text>
            </Pressable>
          )}

          <View className="mt-6">
            <NeonButton
              label={connecting ? 'Connecting…' : isProtected ? 'Disconnect' : 'Connect'}
              variant={isProtected ? 'secondary' : 'primary'}
              disabled={connecting}
              onPress={() => {
                void onConnectPress();
              }}
            />
          </View>
        </ScrollView>
      </GradientBackground>

      <Modal visible={upsellVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(7,11,23,0.75)' }}
          onPress={() => setUpsellVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 360,
              borderRadius: radii.sheet,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              backgroundColor: colors.surface2,
              padding: 22,
            }}
          >
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 }}>
              Unlock Secure Relay
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                marginTop: 8,
                lineHeight: 20,
              }}
            >
              Secure Relay Network is included with Relay Business — private gateways, split
              tunneling, and regional encryption.
            </Text>
            <View className="mt-5 gap-2">
              <NeonButton
                label="View Business plans"
                onPress={() => {
                  setUpsellVisible(false);
                  router.push('/paywall');
                }}
              />
              <NeonButton label="Not now" variant="ghost" onPress={() => setUpsellVisible(false)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <View
      className="flex-1 items-center py-3"
      style={{
        borderRadius: radii.xl,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.card,
      }}
    >
      <Icon color={colors.brand} size={16} strokeWidth={2} />
      <Text
        style={{
          color: colors.foreground,
          fontFamily: 'Inter_700Bold',
          fontSize: 15,
          marginTop: 8,
        }}
      >
        {value}
      </Text>
      <Text
        style={{ color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 }}
      >
        {label}
      </Text>
    </View>
  );
}
