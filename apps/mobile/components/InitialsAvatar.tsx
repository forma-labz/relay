import { Text, View } from 'react-native';

interface InitialsAvatarProps {
  initials: string;
  color: string;
  size?: number;
  ring?: boolean;
}

/** Circular gradient-friendly avatar showing contact initials. */
export function InitialsAvatar({ initials, color, size = 48, ring = false }: InitialsAvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 2 : 0,
        borderColor: 'rgba(255,255,255,0.25)',
      }}
    >
      <Text
        style={{
          color: '#fff',
          fontFamily: 'Inter_600SemiBold',
          fontSize: size * 0.36,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
