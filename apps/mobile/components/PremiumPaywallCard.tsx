import { LinearGradient } from 'expo-linear-gradient';
import { Check, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors, gradients, radii } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';

export interface PaywallPlanFeature {
  label: string;
  icon?: LucideIcon;
}

interface PremiumPaywallCardProps {
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: PaywallPlanFeature[];
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

/** Plan selection card for Relay Pro / Business paywall. */
export function PremiumPaywallCard({
  name,
  price,
  period,
  badge,
  features,
  selected,
  onSelect,
  className,
}: PremiumPaywallCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        haptics.selection();
        onSelect();
      }}
      className={cn('flex-1 active:opacity-90', className)}
    >
      <View
        style={{
          borderRadius: radii.xl,
          borderWidth: 1.5,
          borderColor: selected ? colors.brand : colors.glassBorder,
          backgroundColor: selected ? 'rgba(45,107,255,0.12)' : colors.card,
          shadowColor: selected ? colors.brand : 'transparent',
          shadowOpacity: selected ? 0.35 : 0,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          padding: 14,
          minHeight: 200,
        }}
      >
        {badge ? (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'rgba(139,92,246,0.2)',
              borderRadius: radii.full,
              paddingHorizontal: 8,
              paddingVertical: 3,
              marginBottom: 8,
            }}
          >
            <Text
              style={{ color: colors.brandPurple, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}
            >
              {badge}
            </Text>
          </View>
        ) : (
          <View style={{ height: 22, marginBottom: 8 }} />
        )}

        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>
          {name}
        </Text>
        <View className="mt-1 flex-row items-baseline gap-1">
          <Text
            style={{ color: colors.foreground, fontFamily: 'Inter_800ExtraBold', fontSize: 22 }}
          >
            {price}
          </Text>
          <Text style={{ color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 12 }}>
            {period}
          </Text>
        </View>

        <View className="mt-3 gap-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <View key={f.label} className="flex-row items-center gap-2">
                {Icon ? (
                  <Icon color={colors.brand} size={14} strokeWidth={2} />
                ) : (
                  <LinearGradient
                    colors={gradients.brandSoft}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check color="#fff" size={10} strokeWidth={3} />
                  </LinearGradient>
                )}
                <Text
                  style={{
                    color: colors.muted,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 11,
                    flex: 1,
                  }}
                  numberOfLines={2}
                >
                  {f.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
}
