import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { View } from 'react-native';

import { colors } from '@/constants/theme';

interface RelayLogoProps {
  size?: number;
  /** Rounded gradient tile behind the mark. */
  withTile?: boolean;
}

/**
 * Relay brand mark: stylized “R” speech bubble (matches product mockups).
 */
export function RelayLogo({ size = 96, withTile = true }: RelayLogoProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        shadowColor: colors.brandPurple,
        shadowOpacity: withTile ? 0.55 : 0,
        shadowRadius: size * 0.35,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="relayTile" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#6366F1" />
            <Stop offset="1" stopColor="#A855F7" />
          </LinearGradient>
          <LinearGradient id="relayMark" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#E9D5FF" />
          </LinearGradient>
        </Defs>

        {withTile && <Rect x="0" y="0" width="100" height="100" rx="28" fill="url(#relayTile)" />}

        {/* Speech-bubble R */}
        <Path
          d="M30 24 h28 a18 18 0 0 1 0 36 h-10 l16 22 h-14 l-14 -22 v22 h-12 V24 Z M42 34 v16 h14 a8 8 0 0 0 0 -16 Z"
          fill={withTile ? 'url(#relayMark)' : '#FFFFFF'}
        />
        <Path
          d="M38 78 l-10 14 l18 -8 Z"
          fill={withTile ? 'url(#relayMark)' : '#FFFFFF'}
          opacity={0.95}
        />
      </Svg>
    </View>
  );
}
