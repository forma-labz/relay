import { ChevronLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from 'heroui-native';

import { haptics } from '@/lib/haptics';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  large?: boolean;
}

/** Consistent themed screen header with optional back button and right slot. */
export function ScreenHeader({ title, subtitle, onBack, right, large }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);

  return (
    <View style={{ paddingTop: insets.top + 8 }} className="px-5 pb-3">
      <View className="min-h-11 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2">
          {onBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={() => {
                haptics.selection();
                onBack();
              }}
              className="-ml-2 h-10 w-10 items-center justify-center rounded-full"
            >
              <ChevronLeft color={foreground} size={26} />
            </Pressable>
          )}
          {!large && (
            <View className="flex-1">
              <Text
                numberOfLines={1}
                style={{ color: foreground, fontFamily: 'Inter_700Bold' }}
                className="text-xl"
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  numberOfLines={1}
                  style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                  className="text-xs"
                >
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>
        {right}
      </View>

      {large && (
        <View className="mt-2">
          <Text
            style={{ color: foreground, fontFamily: 'Inter_800ExtraBold' }}
            className="text-3xl"
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={{ color: muted, fontFamily: 'Inter_400Regular' }} className="mt-1 text-sm">
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
