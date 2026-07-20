import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Bot } from 'lucide-react-native';

import { colors, gradients } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

interface AiOrbProps {
  size?: number;
  onPress?: () => void;
  /** Larger hero treatment for the AI Assistant screen. */
  hero?: boolean;
}

/**
 * Glowing AI orb — MCP orchestrator entry point in the UI.
 * Opens the AI assistant / smart composer when pressed.
 */
export function AiOrb({ size = 56, onPress, hero = false }: AiOrbProps) {
  const pulse = useSharedValue(0.55);
  const dim = hero ? size : size;

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.45,
    transform: [{ scale: 0.9 + pulse.value * 0.18 }],
  }));

  const content = (
    <View style={{ width: dim, height: dim, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: dim * 1.45,
            height: dim * 1.45,
            borderRadius: dim,
            backgroundColor: colors.brandPurple,
          },
          glowStyle,
        ]}
      />
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: dim,
          height: dim,
          borderRadius: dim,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.25)',
        }}
      >
        <Bot color="#fff" size={hero ? dim * 0.42 : dim * 0.4} />
      </LinearGradient>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open Relay AI orchestrator"
      onPress={() => {
        haptics.medium();
        onPress();
      }}
      className="active:opacity-90"
    >
      {content}
    </Pressable>
  );
}
