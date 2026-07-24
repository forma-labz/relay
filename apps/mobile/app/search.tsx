import { useRouter } from 'expo-router';
import {
  Bot,
  FileText,
  Mail,
  MessageCircle,
  Search as SearchIcon,
  Sparkles,
  User,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useThemeColor } from 'heroui-native';

import { GradientBackground } from '@/components/GradientBackground';
import { InitialsAvatar } from '@/components/InitialsAvatar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { fileIcon } from '@/lib/fileIcon';
import { contacts, conversations, files, getContact } from '@/lib/mockData';
import { haptics } from '@/lib/haptics';

const RECENT = ['Amara Okafor', 'Q3 forecast', 'enterprise agreement', 'brand guidelines'];

export default function SearchScreen() {
  const router = useRouter();
  const [foreground, muted, accent] = useThemeColor(['foreground', 'muted', 'accent']);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return null;
    return {
      contacts: contacts.filter((c) => `${c.name} ${c.company ?? ''}`.toLowerCase().includes(q)),
      conversations: conversations.filter((c) => {
        const contact = getContact(c.contactId);
        return `${contact?.name ?? ''} ${c.lastPreview}`.toLowerCase().includes(q);
      }),
      files: files.filter((f) => f.name.toLowerCase().includes(q)),
    };
  }, [q]);

  const hasResults =
    results && (results.contacts.length || results.conversations.length || results.files.length);

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader title="Search" onBack={() => router.back()} />
        <View className="px-5 pb-3">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search everything"
            autoFocus
          />
          <Pressable
            onPress={haptics.selection}
            className="border-brand/30 bg-brand/10 mt-2 flex-row items-center gap-2 rounded-2xl border px-3.5 py-2.5 active:opacity-70"
          >
            <Sparkles color={accent} size={16} />
            <Text style={{ color: accent, fontFamily: 'Inter_500Medium' }} className="text-[13px]">
              {q ? `Ask AI: “${query}”` : 'Try AI semantic search'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!q && (
            <Animated.View entering={FadeIn}>
              <Text
                style={{ color: muted, fontFamily: 'Inter_600SemiBold' }}
                className="mb-2 text-xs tracking-wide uppercase"
              >
                Recent
              </Text>
              {RECENT.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => {
                    haptics.selection();
                    setQuery(r);
                  }}
                  className="flex-row items-center gap-3 py-2.5 active:opacity-60"
                >
                  <SearchIcon color={muted} size={16} />
                  <Text
                    style={{ color: foreground, fontFamily: 'Inter_400Regular' }}
                    className="text-[14px]"
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </Animated.View>
          )}

          {q && !hasResults && (
            <Animated.View entering={FadeIn} className="items-center py-16">
              <Bot color={muted} size={32} />
              <Text
                style={{ color: muted, fontFamily: 'Inter_500Medium' }}
                className="mt-3 text-sm"
              >
                No matches. Try AI semantic search above.
              </Text>
            </Animated.View>
          )}

          {results && results.contacts.length > 0 && (
            <Group title="Contacts">
              {results.contacts.map((c, i) => (
                <Animated.View key={c.id} entering={FadeInDown.delay(i * 30)}>
                  <Pressable
                    onPress={() => {
                      haptics.selection();
                      router.push({ pathname: '/contact/[id]', params: { id: c.id } });
                    }}
                    className="flex-row items-center gap-3 py-2.5 active:opacity-70"
                  >
                    <InitialsAvatar initials={c.initials} color={c.avatarColor} size={38} />
                    <View className="flex-1">
                      <Text
                        style={{ color: foreground, fontFamily: 'Inter_600SemiBold' }}
                        className="text-[14px]"
                      >
                        {c.name}
                      </Text>
                      <Text
                        style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                        className="text-[12px]"
                      >
                        {c.company ?? c.email}
                      </Text>
                    </View>
                    <User color={muted} size={16} />
                  </Pressable>
                </Animated.View>
              ))}
            </Group>
          )}

          {results && results.conversations.length > 0 && (
            <Group title="Messages & Email">
              {results.conversations.map((c, i) => {
                const contact = getContact(c.contactId);
                return (
                  <Animated.View key={c.id} entering={FadeInDown.delay(i * 30)}>
                    <Pressable
                      onPress={() => {
                        haptics.selection();
                        router.push({ pathname: '/conversation/[id]', params: { id: c.id } });
                      }}
                      className="flex-row items-center gap-3 py-2.5 active:opacity-70"
                    >
                      <View className="bg-surface-2 h-9 w-9 items-center justify-center rounded-xl">
                        {c.channel === 'email' ? (
                          <Mail color="#6B4EFF" size={16} />
                        ) : (
                          <MessageCircle color="#16C784" size={16} />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ color: foreground, fontFamily: 'Inter_600SemiBold' }}
                          className="text-[14px]"
                        >
                          {contact?.name}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                          className="text-[12px]"
                        >
                          {c.lastPreview}
                        </Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </Group>
          )}

          {results && results.files.length > 0 && (
            <Group title="Files">
              {results.files.map((f, i) => {
                const { Icon, color, tint } = fileIcon(f.kind);
                return (
                  <Animated.View key={f.id} entering={FadeInDown.delay(i * 30)}>
                    <Pressable
                      onPress={haptics.selection}
                      className="flex-row items-center gap-3 py-2.5 active:opacity-70"
                    >
                      <View
                        style={{ backgroundColor: tint }}
                        className="h-9 w-9 items-center justify-center rounded-xl"
                      >
                        <Icon color={color} size={16} />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{ color: foreground, fontFamily: 'Inter_600SemiBold' }}
                          className="text-[14px]"
                        >
                          {f.name}
                        </Text>
                        <Text
                          style={{ color: muted, fontFamily: 'Inter_400Regular' }}
                          className="text-[12px]"
                        >
                          {f.size}
                        </Text>
                      </View>
                      <FileText color={muted} size={16} />
                    </Pressable>
                  </Animated.View>
                );
              })}
            </Group>
          )}
        </ScrollView>
      </GradientBackground>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const [muted] = useThemeColor(['muted']);
  return (
    <View className="mb-4">
      <Text
        style={{ color: muted, fontFamily: 'Inter_600SemiBold' }}
        className="mb-1 text-xs tracking-wide uppercase"
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
