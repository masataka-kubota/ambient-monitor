import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Light haptics feedback
export const triggerLightHaptics = () => {
  if (Platform.OS === "ios") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } else if (Platform.OS === "android") {
    void Haptics.performAndroidHapticsAsync(
      Haptics.AndroidHaptics.Keyboard_Press,
    );
  }
};
