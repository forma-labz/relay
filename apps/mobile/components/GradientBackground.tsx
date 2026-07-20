import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { colors, gradients } from '@/constants/theme';
import { useSettingsStore } from '@/lib/stores/settingsStore';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  /** Soft neon blobs behind content (hero / AI screens). */
  glow?: boolean;
}

/** Full-bleed deep-space gradient with optional indigo/purple neon blobs. */
export function GradientBackground({ children, glow = true }: GradientBackgroundProps) {
  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  const colorsList: [string, string, string] = isLight
    ? ['#ECE9FF', '#F8F7FC', '#F1F0F8']
    : gradients.hero;

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={colorsList}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {glow && (
        <>
          <View
            style={[
              styles.blob,
              {
                top: -90,
                left: -50,
                backgroundColor: colors.brand,
                opacity: isLight ? 0.2 : 0.35,
              },
            ]}
          />
          <View
            style={[
              styles.blob,
              {
                bottom: -110,
                right: -60,
                backgroundColor: colors.brandPurple,
                opacity: isLight ? 0.16 : 0.3,
              },
            ]}
          />
          <View
            style={[
              styles.blobSmall,
              {
                top: '40%',
                right: -30,
                backgroundColor: colors.sky,
                opacity: isLight ? 0.1 : 0.16,
              },
            ]}
          />
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 200,
  },
  blobSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 120,
  },
});
