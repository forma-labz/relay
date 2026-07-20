import {
  Bot,
  Contact as ContactIcon,
  FolderClosed,
  Inbox as InboxIcon,
  PenSquare,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { Platform, Pressable, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native';

import { haptics } from '@/lib/haptics';
import { useSettingsStore } from '@/lib/stores/settingsStore';

export default function TabLayout() {
  const router = useRouter();
  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';
  const [background, border, accent, muted, surface] = useThemeColor([
    'background',
    'border',
    'accent',
    'muted',
    'surface',
  ]);

  return (
    <>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <Tabs
        screenListeners={{ tabPress: () => haptics.selection() }}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: background },
          tabBarStyle: {
            backgroundColor: surface,
            borderTopColor: border,
            borderTopWidth: 0.5,
            elevation: 0,
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingTop: 6,
            shadowColor: '#000',
            shadowOpacity: isLight ? 0.06 : 0,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -2 },
          },
          tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
        }}
      >
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color, size }) => <InboxIcon color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            title: 'Contacts',
            tabBarIcon: ({ color, size }) => <ContactIcon color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="compose"
          options={{
            title: '',
            tabBarButton: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Compose"
                onPress={() => {
                  haptics.medium();
                  router.push('/(tabs)/compose');
                }}
                className="flex-1 items-center justify-center"
              >
                <View
                  style={{
                    backgroundColor: accent,
                    shadowColor: accent,
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                  className="-mt-6 h-14 w-14 items-center justify-center rounded-full"
                >
                  <PenSquare color="#fff" size={24} />
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="files"
          options={{
            title: 'Files',
            tabBarIcon: ({ color, size }) => <FolderClosed color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="ai"
          options={{
            title: 'AI',
            tabBarIcon: ({ color, size }) => <Bot color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size ?? 24} />,
          }}
        />
      </Tabs>
    </>
  );
}
