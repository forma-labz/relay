import { BlurView } from 'expo-blur';
import { Platform, View, type ViewProps } from 'react-native';

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
export function GlassCard({ children, className, intensity = 24, style, ...rest }: GlassCardProps) {
  const theme = useSettingsStore((s) => s.theme);
  const tint = theme === 'light' ? 'light' : 'dark';

  if (Platform.OS === 'web') {
    return (
      <View
        className={cn('border-glass-border bg-glass overflow-hidden rounded-3xl border', className)}
        style={style}
        {...rest}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      className={cn('border-glass-border overflow-hidden rounded-3xl border', className)}
      style={style}
      {...rest}
    >
      <BlurView intensity={intensity} tint={tint} style={{ flex: 1 }}>
        {children}
      </BlurView>
    </View>
  );
}
