import { BlurView } from 'expo-blur';
import { Platform, View, type ViewProps } from 'react-native';

import { colors, radii } from '@/constants/theme';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { cn } from '@/lib/utils';

interface GlassCardProps extends ViewProps {
  className?: string;
  intensity?: number;
}

/**
 * Glassmorphism card. Uses expo-blur on native and a translucent
 * fallback on web (where blur behind is unreliable in the preview iframe).
 */
export function GlassCard({ children, className, intensity = 20, style, ...rest }: GlassCardProps) {
  const theme = useSettingsStore((s) => s.theme);
  const tint = theme === 'light' ? 'light' : 'dark';

  if (Platform.OS === 'web') {
    return (
      <View
        className={cn('bg-glass overflow-hidden border', className)}
        style={[
          {
            borderColor: colors.glassBorder,
            borderRadius: radii.xl,
            backgroundColor: colors.glass,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      className={cn('overflow-hidden border', className)}
      style={[
        {
          borderColor: colors.glassBorder,
          borderRadius: radii.xl,
        },
        style,
      ]}
      {...rest}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={{ flex: 1, backgroundColor: colors.glass }}
      >
        {children}
      </BlurView>
    </View>
  );
}
