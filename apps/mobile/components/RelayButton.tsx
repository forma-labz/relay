import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, radii } from '@/constants/theme';
import { cn } from '@/lib/utils';

interface RelayButtonProps {
  label?: string;
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  iconOnly?: boolean;
  className?: string;
  accessibilityLabel?: string;
  onPress?: () => void;
}

/**
 * Expo Go-safe branded button. Avoids HeroUI Native Button animations that can
 * crash StoreClient runtimes while keeping the Relay look-and-feel.
 */
export function RelayButton({
  label,
  children,
  variant = 'primary',
  iconOnly = false,
  className,
  accessibilityLabel,
  onPress,
}: RelayButtonProps) {
  const background =
    variant === 'primary'
      ? 'bg-brand'
      : variant === 'secondary'
        ? 'border-glass-border bg-surface-2 border'
        : 'bg-transparent';
  const labelColor = variant === 'primary' ? colors.foreground : colors.muted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      className={cn(
        'min-h-12 flex-row items-center justify-center gap-2 px-5 active:opacity-75',
        background,
        iconOnly && 'h-12 w-12 px-0',
        className,
      )}
      style={{ borderRadius: radii.button }}
    >
      <View className="flex-row items-center justify-center gap-2">
        {children}
        {label ? (
          <Text
            style={{ color: labelColor, fontFamily: 'Inter_600SemiBold' }}
            className="text-[15px]"
          >
            {label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
