import { FlashList } from '@shopify/flash-list';
import {
  ChevronRight,
  FolderClosed,
  History,
  LayoutGrid,
  List as ListIcon,
  Share2,
  Upload,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColor } from 'heroui-native';

import { EmptyState } from '@/components/EmptyState';
import { GradientBackground } from '@/components/GradientBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { fileIcon } from '@/lib/fileIcon';
import { haptics } from '@/lib/haptics';
import { useFilesStore } from '@/lib/stores/filesStore';
import type { StoredFile } from '@/lib/types';
import { relativeTime } from '@/lib/utils';

export default function FilesScreen() {
  const [foreground, muted, accent, surface] = useThemeColor([
    'foreground',
    'muted',
    'accent',
    'surface',
  ]);
  const files = useFilesStore((s) => s.files);
  const view = useFilesStore((s) => s.view);
  const query = useFilesStore((s) => s.query);
  const setView = useFilesStore((s) => s.setView);
  const setQuery = useFilesStore((s) => s.setQuery);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? files.filter((f) => f.name.toLowerCase().includes(q)) : files;
    return [...filtered].sort((a, b) => {
      if (a.kind === 'folder' && b.kind !== 'folder') return -1;
      if (a.kind !== 'folder' && b.kind === 'folder') return 1;
      return new Date(b.modified).getTime() - new Date(a.modified).getTime();
    });
  }, [files, query]);

  const toggleView = () => {
    haptics.selection();
    setView(view === 'grid' ? 'list' : 'grid');
  };

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader
          title="Files"
          large
          subtitle="Secure document storage"
          right={
            <View className="flex-row gap-2">
              <Pressable
                accessibilityLabel="Toggle layout"
                onPress={toggleView}
                className="bg-surface-2/70 h-10 w-10 items-center justify-center rounded-full"
              >
                {view === 'grid' ? (
                  <ListIcon color={foreground} size={19} />
                ) : (
                  <LayoutGrid color={foreground} size={19} />
                )}
              </Pressable>
              <Pressable
                accessibilityLabel="Upload"
                onPress={haptics.medium}
                style={{ backgroundColor: accent }}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <Upload color="#fff" size={18} />
              </Pressable>
            </View>
          }
        />

        <View className="px-5 pb-3">
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search files" />
        </View>

        <FlashList
          key={view}
          data={data}
          numColumns={view === 'grid' ? 2 : 1}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={FolderClosed}
              title="No files"
              message="Uploaded files appear here."
            />
          }
          renderItem={({ item, index }: { item: StoredFile; index: number }) =>
            view === 'grid' ? (
              <GridCard
                item={item}
                index={index}
                foreground={foreground}
                muted={muted}
                surface={surface}
              />
            ) : (
              <ListRow
                item={item}
                index={index}
                foreground={foreground}
                muted={muted}
                accent={accent}
              />
            )
          }
        />
      </GradientBackground>
    </View>
  );
}

function GridCard({
  item,
  index,
  foreground,
  muted,
  surface,
}: {
  item: StoredFile;
  index: number;
  foreground: string;
  muted: string;
  surface: string;
}) {
  const { Icon, color, tint } = fileIcon(item.kind);
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(320)}
      style={{ flex: 1, padding: 4 }}
    >
      <Pressable
        onPress={haptics.selection}
        style={{ backgroundColor: surface }}
        className="border-glass-border rounded-3xl border p-4 active:opacity-70"
      >
        <View className="flex-row items-center justify-between">
          <View
            style={{ backgroundColor: tint }}
            className="h-12 w-12 items-center justify-center rounded-2xl"
          >
            <Icon color={color} size={24} />
          </View>
          {item.shared && <Share2 color={muted} size={14} />}
        </View>
        <Text
          numberOfLines={1}
          style={{ color: foreground, fontFamily: 'Inter_600SemiBold' }}
          className="mt-3 text-[14px]"
        >
          {item.name}
        </Text>
        <Text
          style={{ color: muted, fontFamily: 'Inter_400Regular' }}
          className="mt-0.5 text-[11px]"
        >
          {item.size} · {relativeTime(item.modified)}
        </Text>
        {item.versions > 1 && (
          <View className="mt-2 flex-row items-center gap-1">
            <History color={muted} size={11} />
            <Text style={{ color: muted, fontFamily: 'Inter_400Regular' }} className="text-[10px]">
              {item.versions} versions
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function ListRow({
  item,
  index,
  foreground,
  muted,
  accent,
}: {
  item: StoredFile;
  index: number;
  foreground: string;
  muted: string;
  accent: string;
}) {
  const { Icon, color, tint } = fileIcon(item.kind);
  return (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>
      <Pressable
        onPress={haptics.selection}
        className="border-glass-border bg-surface mb-2 flex-row items-center gap-3 rounded-2xl border px-3 py-3 active:opacity-70"
      >
        <View
          style={{ backgroundColor: tint }}
          className="h-11 w-11 items-center justify-center rounded-xl"
        >
          <Icon color={color} size={20} />
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            style={{ color: foreground, fontFamily: 'Inter_600SemiBold' }}
            className="text-[14px]"
          >
            {item.name}
          </Text>
          <Text style={{ color: muted, fontFamily: 'Inter_400Regular' }} className="text-[12px]">
            {item.owner} · {item.size} · {relativeTime(item.modified)}
          </Text>
        </View>
        {item.shared && <Share2 color={accent} size={15} />}
        <ChevronRight color={muted} size={18} />
      </Pressable>
    </Animated.View>
  );
}
