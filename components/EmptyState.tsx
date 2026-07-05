import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useThemeColor } from 'heroui-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

/** Centered empty-state placeholder with an icon halo. */
export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  const [muted, accent] = useThemeColor(['muted', 'accent']);

  return (
    <View className="flex-1 items-center justify-center px-10 py-16">
      <View
        style={{ backgroundColor: accent + '1A' }}
        className="mb-4 h-16 w-16 items-center justify-center rounded-full"
      >
        <Icon color={accent} size={28} />
      </View>
      <Text
        style={{ color: muted, fontFamily: 'Inter_600SemiBold' }}
        className="mb-1 text-center text-base"
      >
        {title}
      </Text>
      <Text
        style={{ color: muted, fontFamily: 'Inter_400Regular' }}
        className="text-center text-sm opacity-80"
      >
        {message}
      </Text>
    </View>
  );
}
