import { Pressable, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useThemeColor } from 'heroui-native';

import { haptics } from '@/lib/haptics';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  badge?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Pill segmented control with an animated selected background. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const [accent, muted, foreground] = useThemeColor(['accent', 'muted', 'foreground']);

  return (
    <View className="border-glass-border bg-surface-2/60 flex-row gap-1 rounded-full border p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              haptics.selection();
              onChange(opt.value);
            }}
            className="flex-1"
          >
            <Animated.View
              layout={LinearTransition.springify().damping(18)}
              style={{ backgroundColor: active ? accent : 'transparent' }}
              className="flex-row items-center justify-center gap-1.5 rounded-full py-2"
            >
              <Text
                style={{
                  color: active ? '#fff' : muted,
                  fontFamily: active ? 'Inter_600SemiBold' : 'Inter_500Medium',
                }}
                className="text-[13px]"
              >
                {opt.label}
              </Text>
              {opt.badge != null && opt.badge > 0 && (
                <View
                  style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : foreground + '22' }}
                  className="min-w-5 items-center rounded-full px-1.5 py-0.5"
                >
                  <Text
                    style={{ color: active ? '#fff' : muted, fontFamily: 'Inter_600SemiBold' }}
                    className="text-[10px]"
                  >
                    {opt.badge}
                  </Text>
                </View>
              )}
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
}
