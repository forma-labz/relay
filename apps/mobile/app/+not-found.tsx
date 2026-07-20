import { Link, Stack } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { GradientBackground } from '@/components/GradientBackground';
import { RelayButton } from '@/components/RelayButton';

export default function NotFoundScreen() {
  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <GradientBackground>
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-brand/15 mb-5 h-20 w-20 items-center justify-center rounded-3xl">
            <Compass color="#2563FF" size={40} />
          </View>
          <Text style={{ color: '#F8FAFC', fontFamily: 'Inter_700Bold' }} className="text-2xl">
            Page not found
          </Text>
          <Text
            style={{ color: '#94A3B8', fontFamily: 'Inter_400Regular' }}
            className="mt-2 mb-6 text-center text-sm"
          >
            The screen you were looking for doesn&apos;t exist.
          </Text>
          <Link href="/(tabs)/inbox" asChild>
            <RelayButton label="Back to Inbox" />
          </Link>
        </View>
      </GradientBackground>
    </View>
  );
}
