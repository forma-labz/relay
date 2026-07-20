import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/constants/theme';

interface McpBadgeProps {
  label?: string;
  connected?: boolean;
}

/** Small glowing “MCP” chip used on integration / inbox rows. */
export function McpBadge({ label = 'MCP', connected = true }: McpBadgeProps) {
  return (
    <LinearGradient
      colors={connected ? gradients.brand : ['#3F3F46', '#52525B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        shadowColor: connected ? colors.brand : 'transparent',
        shadowOpacity: 0.5,
        shadowRadius: 8,
      }}
    >
      <View className="flex-row items-center gap-1">
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: connected ? '#BBF7D0' : '#A1A1AA',
          }}
        />
        <Text
          style={{
            color: '#fff',
            fontFamily: 'Inter_600SemiBold',
            fontSize: 10,
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Text>
      </View>
    </LinearGradient>
  );
}
