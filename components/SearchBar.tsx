import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';
import { useThemeColor } from 'heroui-native';

interface SearchBarProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** Themed rounded search field used across Inbox, Contacts, Files and Search. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  autoFocus,
}: SearchBarProps) {
  const [muted, foreground] = useThemeColor(['muted', 'foreground']);

  return (
    <View className="border-glass-border bg-surface-2/70 flex-row items-center gap-2 rounded-2xl border px-3.5 py-2.5">
      <Search color={muted} size={18} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={muted}
        autoFocus={autoFocus}
        autoCorrect={false}
        style={{
          flex: 1,
          color: foreground,
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          padding: 0,
        }}
      />
      {value.length > 0 && (
        <Pressable hitSlop={8} onPress={() => onChangeText('')} accessibilityLabel="Clear search">
          <X color={muted} size={16} />
        </Pressable>
      )}
    </View>
  );
}
