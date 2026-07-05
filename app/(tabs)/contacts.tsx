import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Star, UserPlus, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColor } from 'heroui-native';

import { EmptyState } from '@/components/EmptyState';
import { GradientBackground } from '@/components/GradientBackground';
import { InitialsAvatar } from '@/components/InitialsAvatar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { haptics } from '@/lib/haptics';
import { useContactsStore } from '@/lib/stores/contactsStore';
import type { Contact } from '@/lib/types';

type Segment = 'all' | 'favorites';

export default function ContactsScreen() {
  const router = useRouter();
  const [foreground, muted, accent, warning] = useThemeColor([
    'foreground',
    'muted',
    'accent',
    'warning',
  ]);
  const contacts = useContactsStore((s) => s.contacts);
  const query = useContactsStore((s) => s.query);
  const setQuery = useContactsStore((s) => s.setQuery);
  const toggleFavorite = useContactsStore((s) => s.toggleFavorite);
  const [segment, setSegment] = useState<Segment>('all');

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => (segment === 'favorites' ? c.favorite : true))
      .filter((c) =>
        q ? `${c.name} ${c.company ?? ''} ${c.email}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, query, segment]);

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader
          title="Contacts"
          large
          subtitle={`${contacts.length} people`}
          right={
            <Pressable
              accessibilityLabel="Add contact"
              onPress={haptics.medium}
              style={{ backgroundColor: accent }}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <UserPlus color="#fff" size={19} />
            </Pressable>
          }
        />

        <View className="px-5 pb-2">
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search contacts" />
          <View className="mt-3">
            <SegmentedControl
              options={[
                { value: 'all', label: 'All' },
                { value: 'favorites', label: 'Favorites' },
              ]}
              value={segment}
              onChange={setSegment}
            />
          </View>
        </View>

        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={Users}
              title="No contacts"
              message="Contacts you add will show up here."
            />
          }
          renderItem={({ item, index }: { item: Contact; index: number }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(340)}>
              <Pressable
                onPress={() => {
                  haptics.selection();
                  router.push({ pathname: '/contact/[id]', params: { id: item.id } });
                }}
                className="border-glass-border bg-surface mb-2 flex-row items-center gap-3 rounded-3xl border p-3 active:opacity-70"
              >
                <InitialsAvatar initials={item.initials} color={item.avatarColor} size={48} />
                <View className="flex-1">
                  <Text
                    style={{ color: foreground, fontFamily: 'Inter_600SemiBold' }}
                    className="text-[15px]"
                  >
                    {item.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                    className="text-[13px]"
                  >
                    {item.role ? `${item.role} · ${item.company ?? ''}` : item.email}
                  </Text>
                  {item.tags.length > 0 && (
                    <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                      {item.tags.map((t) => (
                        <View key={t} className="bg-brand/12 rounded-full px-2 py-0.5">
                          <Text
                            style={{ color: accent, fontFamily: 'Inter_500Medium' }}
                            className="text-[10px]"
                          >
                            {t}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Pressable
                  hitSlop={10}
                  accessibilityLabel={item.favorite ? 'Unfavorite' : 'Favorite'}
                  onPress={() => {
                    haptics.selection();
                    toggleFavorite(item.id);
                  }}
                  className="h-9 w-9 items-center justify-center"
                >
                  <Star
                    color={item.favorite ? warning : muted}
                    fill={item.favorite ? warning : 'transparent'}
                    size={20}
                  />
                </Pressable>
              </Pressable>
            </Animated.View>
          )}
        />
      </GradientBackground>
    </View>
  );
}
