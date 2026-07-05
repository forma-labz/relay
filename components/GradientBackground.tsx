import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useSettingsStore } from '@/lib/stores/settingsStore';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  /** Show soft glowing blobs behind content (used on hero screens). */
  glow?: boolean;
}

/**
 * Full-bleed brand gradient background with optional glowing blobs.
 * Reads the active theme so the palette shifts between dark and light.
 */
export function GradientBackground({ children, glow = true }: GradientBackgroundProps) {
  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  const colors: [string, string, string] = isLight
    ? ['#EAF0FF', '#F8FAFC', '#F1F5F9']
    : ['#0B1020', '#0E1530', '#0B1020'];

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {glow && (
        <>
          <View
            style={[
              styles.blob,
              { top: -80, left: -60, backgroundColor: '#2563FF', opacity: isLight ? 0.18 : 0.28 },
            ]}
          />
          <View
            style={[
              styles.blob,
              {
                bottom: -100,
                right: -70,
                backgroundColor: '#6B4EFF',
                opacity: isLight ? 0.16 : 0.24,
              },
            ]}
          />
          <View
            style={[
              styles.blobSmall,
              { top: '38%', right: -40, backgroundColor: '#38BDF8', opacity: isLight ? 0.12 : 0.2 },
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
    width: 280,
    height: 280,
    borderRadius: 200,
  },
  blobSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 120,
  },
});
