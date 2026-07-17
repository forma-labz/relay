import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
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
            <Stop offset="0" stopColor="#172B67" />
            <Stop offset="1" stopColor="#07132F" />
          </LinearGradient>
          <LinearGradient id="relayMark" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#E8EDFA" />
          </LinearGradient>
          <LinearGradient id="relayBlue" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#38BDF8" />
            <Stop offset="1" stopColor="#255BFF" />
          </LinearGradient>
        </Defs>

        {withTile && <Rect x="2" y="2" width="96" height="96" rx="25" fill="url(#relayTile)" />}

        {/* Folded blue envelope accent beneath the R. */}
        <Path d="M28 59 L51 79 H31 Q27 79 27 75 V62 Q27 60 28 59 Z" fill="url(#relayBlue)" />
        <Path d="M28 59 L39 69 L28 79 Q27 77 27 74 V62 Q27 60 28 59 Z" fill="#269CF4" />
        <Path d="M39 69 L51 79 H29 Z" fill="#1554D8" opacity={0.9} />

        {/* Bold white R matching the supplied Relay app icon. */}
        <Path
          d="M28 21 H57 C73 21 82 31 82 45 C82 57 75 64 65 67 L79 81 H62 L49 67 H43 V81 H28 Z M43 35 V54 H56 C64 54 68 51 68 45 C68 38 63 35 56 35 Z"
          fill="url(#relayMark)"
        />

        {/* The R bowl doubles as a navy chat bubble. */}
        <Rect x="42" y="36" width="27" height="18" rx="9" fill="#0B173A" />
        <Path d="M45 50 L39 58 Q38 60 41 59 L51 54 Z" fill="#0B173A" />
        <Circle cx="49" cy="45" r="2" fill="#27A9F8" />
        <Circle cx="56" cy="45" r="2" fill="#3486FF" />
        <Circle cx="63" cy="45" r="2" fill="#5B5CFF" />
      </Svg>
    </View>
  );
}
