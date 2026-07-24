import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { View } from 'react-native';

import { colors } from '@/constants/theme';

interface RelayLogoProps {
  size?: number;
  /** Rounded navy tile behind the mark. */
  withTile?: boolean;
}

/**
 * Relay brand mark: white “R” with chat-bubble ellipsis and envelope accent
 * on a deep navy squircle (matches product icon).
 */
export function RelayLogo({ size = 96, withTile = true }: RelayLogoProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        shadowColor: colors.brand,
        shadowOpacity: withTile ? 0.4 : 0,
        shadowRadius: size * 0.28,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="relayTile" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#101728" />
            <Stop offset="1" stopColor="#070B17" />
          </LinearGradient>
          <LinearGradient id="relayEllipsis" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#38BDF8" />
            <Stop offset="1" stopColor="#8B5CF6" />
          </LinearGradient>
          <LinearGradient id="relayEnvelope" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2D6BFF" />
            <Stop offset="1" stopColor="#1A4FCC" />
          </LinearGradient>
        </Defs>

        {withTile && <Rect x="0" y="0" width="100" height="100" rx="28" fill="url(#relayTile)" />}

        {/* Soft inner glow ring */}
        {withTile && (
          <Rect
            x="2"
            y="2"
            width="96"
            height="96"
            rx="26"
            fill="none"
            stroke="rgba(45,107,255,0.35)"
            strokeWidth="1.5"
          />
        )}

        {/* White R body */}
        <Path
          d="M28 22 h30 a20 20 0 0 1 0 40 h-12 l18 24 h-15 l-15 -24 v24 h-14 V22 Z M42 34 v14 h14 a7 7 0 0 0 0 -14 Z"
          fill="#FFFFFF"
        />

        {/* Negative-space speech bubble with cyan→purple dots */}
        <Path
          d="M44 36 h18 a8 8 0 0 1 0 16 h-10 l-4 5 v-5 h-4 a8 8 0 0 1 0 -16 Z"
          fill={withTile ? '#101728' : '#070B17'}
        />
        <Circle cx="50" cy="44" r="2.2" fill="url(#relayEllipsis)" />
        <Circle cx="56" cy="44" r="2.2" fill="url(#relayEllipsis)" />
        <Circle cx="62" cy="44" r="2.2" fill="url(#relayEllipsis)" />

        {/* Envelope / forward triangle accent */}
        <Path d="M28 78 L28 58 L48 78 Z" fill="url(#relayEnvelope)" />
      </Svg>
    </View>
  );
}
