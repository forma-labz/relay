import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Cross-platform haptics; no-ops on web. */
export const haptics = {
  light: () => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  medium: () => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  success: () => {
    if (Platform.OS !== 'web')
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  error: () => {
    if (Platform.OS !== 'web')
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  selection: () => {
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
  },
};
