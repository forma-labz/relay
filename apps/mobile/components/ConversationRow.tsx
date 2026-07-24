import { CheckCheck, Lock, Mail, MessageCircle, Pin, VolumeX } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useThemeColor } from 'heroui-native';

import { InitialsAvatar } from '@/components/InitialsAvatar';
import { colors } from '@/constants/theme';
import type { Contact, Conversation } from '@/lib/types';
import { relativeTime } from '@/lib/utils';

interface ConversationRowProps {
  conversation: Conversation;
  contact: Contact;
  onPress: () => void;
}

export function ConversationRow({ conversation, contact, onPress }: ConversationRowProps) {
  const [foreground, muted, accent] = useThemeColor(['foreground', 'muted', 'accent']);
  const isEmail = conversation.channel === 'email';
  const hasUnread = conversation.unread > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${contact.name}`}
      onPress={onPress}
      className="flex-row items-center gap-3 px-5 py-3 active:opacity-70"
    >
      <View>
        <InitialsAvatar initials={contact.initials} color={contact.avatarColor} size={52} />
        <View
          style={{ backgroundColor: isEmail ? colors.brandPurple : colors.success }}
          className="border-background absolute -right-0.5 -bottom-0.5 h-5 w-5 items-center justify-center rounded-full border-2"
        >
          {isEmail ? <Mail color="#fff" size={10} /> : <MessageCircle color="#fff" size={10} />}
        </View>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text
            numberOfLines={1}
            style={{
              color: foreground,
              fontFamily: hasUnread ? 'Inter_700Bold' : 'Inter_600SemiBold',
            }}
            className="flex-1 text-[15px]"
          >
            {contact.name}
          </Text>
          {conversation.pinned && <Pin color={muted} size={12} fill={muted} />}
          {conversation.muted && <VolumeX color={muted} size={12} />}
          {conversation.encrypted && <Lock color={accent} size={12} />}
          <Text
            style={{ color: hasUnread ? accent : muted, fontFamily: 'Inter_500Medium' }}
            className="text-xs"
          >
            {relativeTime(conversation.lastTimestamp)}
          </Text>
        </View>

        <View className="mt-0.5 flex-row items-center gap-1.5">
          {!hasUnread && conversation.channel === 'chat' && <CheckCheck color={accent} size={14} />}
          <Text
            numberOfLines={1}
            style={{
              color: hasUnread ? foreground : muted,
              fontFamily: hasUnread ? 'Inter_500Medium' : 'Inter_400Regular',
            }}
            className="flex-1 text-[13px]"
          >
            {conversation.lastPreview}
          </Text>
          {hasUnread && (
            <View
              style={{ backgroundColor: accent }}
              className="ml-1 min-w-5 items-center rounded-full px-1.5 py-0.5"
            >
              <Text style={{ color: '#fff', fontFamily: 'Inter_700Bold' }} className="text-[10px]">
                {conversation.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
