import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { View } from 'react-native';

interface RelayLogoProps {
  size?: number;
  /** Rounded gradient tile behind the mark. */
  withTile?: boolean;
}

/**
 * Relay brand mark: a letter "R" whose bowl doubles as a chat bubble
 * (note the tail) sitting on an envelope baseline.
 */
export function RelayLogo({ size = 96, withTile = true }: RelayLogoProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="relayTile" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#2563FF" />
            <Stop offset="1" stopColor="#6B4EFF" />
          </LinearGradient>
          <LinearGradient id="relayMark" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#DCE6FF" />
          </LinearGradient>
        </Defs>

        {withTile && <Rect x="0" y="0" width="100" height="100" rx="26" fill="url(#relayTile)" />}

        {/* Envelope flap accent */}
        <Path
          d="M22 30 L50 48 L78 30"
          stroke="#38BDF8"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.9}
        />

        {/* The R — bowl reads as a chat bubble with a tail */}
        <Path
          d="M34 26 h20 a15 15 0 0 1 0 30 h-8 l14 20 h-11 l-13 -20 v20 h-9 V26 h-1 Z M43 35 v12 h11 a6 6 0 0 0 0 -12 Z"
          fill="url(#relayMark)"
        />
        {/* chat bubble tail */}
        <Path d="M40 74 l-6 10 l12 -6 Z" fill="url(#relayMark)" opacity={0.9} />
      </Svg>
    </View>
  );
}
