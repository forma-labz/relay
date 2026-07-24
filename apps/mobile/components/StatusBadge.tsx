import { Text, View } from 'react-native';

import { colors, radii } from '@/constants/theme';
import { cn } from '@/lib/utils';

export type RelayStatus = 'protected' | 'limited' | 'disconnected';

const STATUS_META: Record<RelayStatus, { label: string; color: string; tint: string }> = {
  protected: {
    label: 'Protected',
    color: colors.success,
    tint: 'rgba(22,199,132,0.16)',
  },
  limited: {
    label: 'Limited',
    color: colors.warning,
    tint: 'rgba(245,165,36,0.16)',
  },
  disconnected: {
    label: 'Disconnected',
    color: colors.error,
    tint: 'rgba(240,68,56,0.16)',
  },
};

interface StatusBadgeProps {
  status: RelayStatus;
  className?: string;
  size?: 'sm' | 'md';
}

/** Secure Relay / connection status pill. */
export function StatusBadge({ status, className, size = 'sm' }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const isSm = size === 'sm';

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Status: ${meta.label}`}
      className={cn('flex-row items-center gap-1.5', className)}
      style={{
        backgroundColor: meta.tint,
        borderRadius: radii.full,
        paddingHorizontal: isSm ? 8 : 12,
        paddingVertical: isSm ? 3 : 6,
      }}
    >
      <View
        style={{
          width: isSm ? 6 : 8,
          height: isSm ? 6 : 8,
          borderRadius: 4,
          backgroundColor: meta.color,
        }}
      />
      <Text
        style={{
          color: meta.color,
          fontFamily: 'Inter_600SemiBold',
          fontSize: isSm ? 11 : 13,
        }}
      >
        {meta.label}
      </Text>
    </View>
  );
}
