import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Triggers a light tactile feedback effect appropriate to the current platform.
 *
 * On iOS, it uses a light impact style; on Android, it uses a keyboard-press
 * haptic pattern. No-op on unsupported platforms.
 */
export const triggerLightHaptics = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } else if (Platform.OS === 'android') {
    Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Keyboard_Press);
  }
};
