import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Bell, Inbox as InboxIcon, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColor } from 'heroui-native';

import { ConversationRow } from '@/components/ConversationRow';
import { EmptyState } from '@/components/EmptyState';
import { GradientBackground } from '@/components/GradientBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { SegmentedControl, type SegmentOption } from '@/components/SegmentedControl';
import { getContact } from '@/lib/mockData';
import { haptics } from '@/lib/haptics';
import { useInboxStore } from '@/lib/stores/inboxStore';
import { useNotificationsStore } from '@/lib/stores/notificationsStore';
import type { InboxFilter } from '@/lib/types';

export default function InboxScreen() {
  const router = useRouter();
  const [accent, foreground] = useThemeColor(['accent', 'foreground']);

  const conversations = useInboxStore((s) => s.conversations);
  const filter = useInboxStore((s) => s.filter);
  const query = useInboxStore((s) => s.query);
  const setFilter = useInboxStore((s) => s.setFilter);
  const setQuery = useInboxStore((s) => s.setQuery);
  const markRead = useInboxStore((s) => s.markRead);
  const refresh = useInboxStore((s) => s.refresh);
  const unreadNotifs = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);

  const [refreshing, setRefreshing] = useState(false);

  const filters: SegmentOption<InboxFilter>[] = useMemo(() => {
    const unread = conversations.filter((c) => c.unread > 0).length;
    return [
      { value: 'all', label: 'All' },
      { value: 'unread', label: 'Unread', badge: unread },
      { value: 'chat', label: 'Chats' },
      { value: 'email', label: 'Email' },
      { value: 'pinned', label: 'Pinned' },
    ];
  }, [conversations]);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations
      .filter((c) => {
        if (filter === 'unread' && c.unread === 0) return false;
        if (filter === 'chat' && c.channel !== 'chat') return false;
        if (filter === 'email' && c.channel !== 'email') return false;
        if (filter === 'pinned' && !c.pinned) return false;
        if (q) {
          const contact = getContact(c.contactId);
          const hay = `${contact?.name ?? ''} ${c.lastPreview}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime();
      });
  }, [conversations, filter, query]);

  const onRefresh = () => {
    setRefreshing(true);
    haptics.light();
    setTimeout(() => {
      refresh();
      setRefreshing(false);
    }, 900);
  };

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader
          title="Inbox"
          large
          right={
            <View className="flex-row gap-2">
              <Pressable
                accessibilityLabel="Search"
                onPress={() => {
                  haptics.selection();
                  router.push('/search');
                }}
                className="bg-surface-2/70 h-10 w-10 items-center justify-center rounded-full"
              >
                <Search color={foreground} size={20} />
              </Pressable>
              <Pressable
                accessibilityLabel="Notifications"
                onPress={() => {
                  haptics.selection();
                  router.push('/notifications');
                }}
                className="bg-surface-2/70 h-10 w-10 items-center justify-center rounded-full"
              >
                <Bell color={foreground} size={19} />
                {unreadNotifs > 0 && (
                  <View
                    style={{ backgroundColor: '#EF4444' }}
                    className="border-background absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full border"
                  />
                )}
              </Pressable>
            </View>
          }
        />

        <View className="px-5 pb-2">
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search conversations" />
          <View className="mt-3">
            <SegmentedControl options={filters} value={filter} onChange={setFilter} />
          </View>
        </View>

        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={InboxIcon}
              title="Nothing here yet"
              message="Conversations that match this filter will appear here."
            />
          }
          renderItem={({ item, index }) => {
            const contact = getContact(item.contactId);
            if (!contact) return null;
            return (
              <Animated.View entering={FadeInDown.delay(index * 40).duration(360)}>
                <ConversationRow
                  conversation={item}
                  contact={contact}
                  onPress={() => {
                    haptics.selection();
                    markRead(item.id);
                    router.push({ pathname: '/conversation/[id]', params: { id: item.id } });
                  }}
                />
              </Animated.View>
            );
          }}
        />
      </GradientBackground>
    </View>
  );
}
