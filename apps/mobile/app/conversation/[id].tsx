import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, Mic, Paperclip, Phone, Play, Send, Sparkles, Video } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from 'heroui-native';

import { GradientBackground } from '@/components/GradientBackground';
import { InitialsAvatar } from '@/components/InitialsAvatar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { fileIcon } from '@/lib/fileIcon';
import { getContact } from '@/lib/mockData';
import { haptics } from '@/lib/haptics';
import { useInboxStore } from '@/lib/stores/inboxStore';
import type { Message } from '@/lib/types';
import { clockTime, formatDuration } from '@/lib/utils';

export default function ConversationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [foreground, muted, accent] = useThemeColor(['foreground', 'muted', 'accent']);

  const conversation = useInboxStore((s) => s.conversations.find((c) => c.id === id));
  const messagesMap = useInboxStore((s) => s.messages);
  const messages = id ? (messagesMap[id] ?? []) : [];
  const sendMessage = useInboxStore((s) => s.sendMessage);

  const contact = conversation ? getContact(conversation.contactId) : undefined;
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isEmail = conversation?.channel === 'email';

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    return () => clearTimeout(t);
  }, []);

  const send = () => {
    if (!draft.trim() || !id) return;
    haptics.light();
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      conversationId: id,
      kind: isEmail ? 'email' : 'chat',
      fromMe: true,
      authorId: 'me',
      body: draft.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
      encrypted: conversation?.encrypted,
    };
    sendMessage(id, msg);
    setDraft('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    setTyping(true);
    setTimeout(() => setTyping(false), 2600);
  };

  const headerRight = useMemo(
    () => (
      <View className="flex-row gap-2">
        <Pressable
          accessibilityLabel="Voice call"
          onPress={haptics.selection}
          className="bg-surface-2/70 h-10 w-10 items-center justify-center rounded-full"
        >
          <Phone color={foreground} size={18} />
        </Pressable>
        <Pressable
          accessibilityLabel="Video call"
          onPress={haptics.selection}
          className="bg-surface-2/70 h-10 w-10 items-center justify-center rounded-full"
        >
          <Video color={foreground} size={18} />
        </Pressable>
      </View>
    ),
    [foreground],
  );

  if (!conversation || !contact) {
    return (
      <View className="flex-1">
        <GradientBackground glow={false}>
          <ScreenHeader title="Conversation" onBack={() => router.back()} />
          <View className="flex-1 items-center justify-center">
            <Text style={{ color: muted, fontFamily: 'Inter_500Medium' }}>
              Conversation not found
            </Text>
          </View>
        </GradientBackground>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <GradientBackground glow={false}>
        <ScreenHeader
          title={contact.name}
          subtitle={
            isEmail ? contact.email : conversation.encrypted ? 'End-to-end encrypted' : 'Online'
          }
          onBack={() => router.push('/(tabs)/inbox')}
          right={headerRight}
        />

        {conversation.encrypted && (
          <View className="bg-brand/10 mx-5 mb-2 flex-row items-center justify-center gap-1.5 rounded-full py-1.5">
            <Lock color={accent} size={12} />
            <Text style={{ color: accent, fontFamily: 'Inter_500Medium' }} className="text-[11px]">
              Messages are end-to-end encrypted
            </Text>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top + 40}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m, i) => (
              <MessageItem
                key={m.id}
                message={m}
                contactInitials={contact.initials}
                contactColor={contact.avatarColor}
                index={i}
              />
            ))}
            {typing && <TypingIndicator initials={contact.initials} color={contact.avatarColor} />}
          </ScrollView>

          <Composer
            value={draft}
            onChange={setDraft}
            onSend={send}
            isEmail={isEmail}
            paddingBottom={insets.bottom}
            accent={accent}
            muted={muted}
            foreground={foreground}
          />
        </KeyboardAvoidingView>
      </GradientBackground>
    </View>
  );
}

function MessageItem({
  message,
  contactInitials,
  contactColor,
  index,
}: {
  message: Message;
  contactInitials: string;
  contactColor: string;
  index: number;
}) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);
  const mine = message.fromMe;

  if (message.kind === 'event') {
    return (
      <Animated.View entering={FadeIn.delay(index * 30)} className="my-2 items-center">
        <View className="bg-surface-2/70 rounded-full px-3 py-1">
          <Text style={{ color: muted, fontFamily: 'Inter_500Medium' }} className="text-[11px]">
            {message.body} · {clockTime(message.timestamp)}
          </Text>
        </View>
      </Animated.View>
    );
  }

  if (message.kind === 'email') {
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 40).duration(360)}
        className="border-glass-border bg-surface my-1.5 overflow-hidden rounded-3xl border"
      >
        <View className="border-glass-border border-b px-4 py-3">
          <Text style={{ color: foreground, fontFamily: 'Inter_700Bold' }} className="text-[15px]">
            {message.subject}
          </Text>
          <Text style={{ color: muted, fontFamily: 'Inter_400Regular' }} className="mt-0.5 text-xs">
            {mine ? 'You' : 'Them'} · {clockTime(message.timestamp)}
          </Text>
        </View>
        <Text
          style={{ color: foreground, fontFamily: 'Inter_400Regular' }}
          className="px-4 py-3 text-[14px] leading-6"
        >
          {message.body}
        </Text>
        {message.attachments?.map((a) => (
          <AttachmentChip key={a.id} name={a.name} size={a.size} kind={a.kind} />
        ))}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 40).duration(320)}
      className={`my-1 max-w-[82%] flex-row items-end gap-2 ${mine ? 'self-end' : 'self-start'}`}
    >
      {!mine && <InitialsAvatar initials={contactInitials} color={contactColor} size={28} />}
      <View
        className={`rounded-3xl px-3.5 py-2.5 ${mine ? 'bg-brand rounded-br-md' : 'bg-surface rounded-bl-md'}`}
      >
        {message.kind === 'voice' ? (
          <VoiceNote mine={mine} durationSec={message.durationSec ?? 0} />
        ) : message.kind === 'attachment' && message.attachments?.[0] ? (
          <AttachmentChip
            name={message.attachments[0].name}
            size={message.attachments[0].size}
            kind={message.attachments[0].kind}
            inBubble
            mine={mine}
          />
        ) : (
          <Text
            style={{ color: mine ? '#fff' : foreground, fontFamily: 'Inter_400Regular' }}
            className="text-[15px] leading-5"
          >
            {message.body}
          </Text>
        )}
        <Text
          style={{
            color: mine ? 'rgba(255,255,255,0.7)' : muted,
            fontFamily: 'Inter_400Regular',
          }}
          className="mt-1 self-end text-[10px]"
        >
          {clockTime(message.timestamp)}
          {mine && message.status ? ` · ${message.status}` : ''}
        </Text>
      </View>
    </Animated.View>
  );
}

function VoiceNote({ mine, durationSec }: { mine: boolean; durationSec: number }) {
  const bars = [
    ['a', 8],
    ['b', 14],
    ['c', 10],
    ['d', 18],
    ['e', 12],
    ['f', 20],
    ['g', 9],
    ['h', 16],
    ['i', 11],
    ['j', 15],
    ['k', 8],
    ['l', 13],
  ] as const;
  const color = mine ? '#fff' : colors.brandPurple;
  return (
    <View className="flex-row items-center gap-2 py-0.5">
      <Play color={color} size={16} fill={color} />
      <View className="flex-row items-center gap-0.5">
        {bars.map(([id, height]) => (
          <View
            key={id}
            style={{
              width: 2.5,
              height,
              borderRadius: 2,
              backgroundColor: color,
              opacity: 0.85,
            }}
          />
        ))}
      </View>
      <Text style={{ color, fontFamily: 'Inter_500Medium' }} className="text-xs">
        {formatDuration(durationSec)}
      </Text>
    </View>
  );
}

function AttachmentChip({
  name,
  size,
  kind,
  inBubble,
  mine,
}: {
  name: string;
  size: string;
  kind: 'pdf' | 'image' | 'doc' | 'sheet' | 'zip';
  inBubble?: boolean;
  mine?: boolean;
}) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);
  const { Icon, color, tint } = fileIcon(kind);
  const nameColor = inBubble && mine ? '#fff' : foreground;
  const sizeColor = inBubble && mine ? 'rgba(255,255,255,0.7)' : muted;

  return (
    <View
      className={`flex-row items-center gap-2.5 ${inBubble ? 'py-0.5' : 'border-glass-border mx-4 mb-3 rounded-2xl border p-2.5'}`}
    >
      <View
        style={{ backgroundColor: tint }}
        className="h-9 w-9 items-center justify-center rounded-xl"
      >
        <Icon color={color} size={18} />
      </View>
      <View>
        <Text style={{ color: nameColor, fontFamily: 'Inter_600SemiBold' }} className="text-[13px]">
          {name}
        </Text>
        <Text style={{ color: sizeColor, fontFamily: 'Inter_400Regular' }} className="text-[11px]">
          {size}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator({ initials, color }: { initials: string; color: string }) {
  return (
    <Animated.View entering={FadeIn} className="my-1 flex-row items-end gap-2 self-start">
      <InitialsAvatar initials={initials} color={color} size={28} />
      <View className="bg-surface flex-row items-center gap-1 rounded-3xl rounded-bl-md px-4 py-3">
        {[0, 1, 2].map((i) => (
          <TypingDot key={i} index={i} />
        ))}
      </View>
    </Animated.View>
  );
}

function TypingDot({ index }: { index: number }) {
  const v = useSharedValue(0.3);
  useEffect(() => {
    v.value = withDelay(index * 160, withRepeat(withTiming(1, { duration: 500 }), -1, true));
    return () => cancelAnimation(v);
  }, [v, index]);
  const style = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: -v.value * 3 }],
  }));
  return (
    <Animated.View
      style={[style, { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.muted }]}
    />
  );
}

function Composer({
  value,
  onChange,
  onSend,
  isEmail,
  paddingBottom,
  accent,
  muted,
  foreground,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  isEmail: boolean;
  paddingBottom: number;
  accent: string;
  muted: string;
  foreground: string;
}) {
  const canSend = value.trim().length > 0;
  return (
    <View
      style={{ paddingBottom: paddingBottom + 8 }}
      className="border-glass-border bg-surface/80 flex-row items-end gap-2 border-t px-3 pt-2"
    >
      <Pressable
        accessibilityLabel="AI assist"
        onPress={haptics.selection}
        className="bg-brand/15 mb-1.5 h-9 w-9 items-center justify-center rounded-full"
      >
        <Sparkles color={accent} size={18} />
      </Pressable>
      <View className="border-glass-border bg-surface-2/70 max-h-28 flex-1 flex-row items-end gap-2 rounded-3xl border px-3.5 py-2">
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={isEmail ? 'Write an email…' : 'Message'}
          placeholderTextColor={muted}
          multiline
          style={{
            flex: 1,
            color: foreground,
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
            maxHeight: 96,
            padding: 0,
          }}
        />
        <Pressable accessibilityLabel="Attach" onPress={haptics.selection} className="mb-0.5">
          <Paperclip color={muted} size={18} />
        </Pressable>
      </View>
      <Pressable
        accessibilityLabel={canSend ? 'Send' : 'Record voice note'}
        onPress={canSend ? onSend : haptics.medium}
        style={{ backgroundColor: accent }}
        className="mb-1 h-10 w-10 items-center justify-center rounded-full active:opacity-80"
      >
        {canSend ? <Send color="#fff" size={18} /> : <Mic color="#fff" size={18} />}
      </Pressable>
    </View>
  );
}
