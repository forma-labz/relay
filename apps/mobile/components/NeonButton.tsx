import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, type PressableProps, View } from 'react-native';

import { colors, gradients } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

interface NeonButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function NeonButton({
  label,
  variant = 'primary',
  onPress,
  disabled,
  ...rest
}: NeonButtonProps) {
  if (variant === 'ghost') {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={(e) => {
          haptics.selection();
          onPress?.(e);
        }}
        className="items-center rounded-2xl px-5 py-3.5 active:opacity-70"
        {...rest}
      >
        <Text style={{ color: colors.muted, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
          {label}
        </Text>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={(e) => {
          haptics.light();
          onPress?.(e);
        }}
        className="active:opacity-80"
        {...rest}
      >
        <View
          style={{
            borderColor: colors.glassBorder,
            backgroundColor: colors.surface,
          }}
          className="items-center rounded-2xl border px-5 py-3.5"
        >
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
            {label}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={(e) => {
        haptics.medium();
        onPress?.(e);
      }}
      className="active:opacity-90"
      style={{ opacity: disabled ? 0.5 : 1 }}
      {...rest}
    >
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 18,
          paddingVertical: 15,
          paddingHorizontal: 20,
          alignItems: 'center',
          shadowColor: colors.brand,
          shadowOpacity: 0.55,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 }}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}
