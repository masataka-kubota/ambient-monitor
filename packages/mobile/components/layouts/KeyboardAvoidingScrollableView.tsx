import { memo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  KeyboardState,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface KeyboardAvoidingScrollableViewProps {
  children: React.ReactNode;
}

const KeyboardAvoidingScrollableView = ({
  children,
}: KeyboardAvoidingScrollableViewProps) => {
  const keyboard = useAnimatedKeyboard();
  const insets = useSafeAreaInsets();

  const paddingTop = insets.top + 20;
  const paddingBottom = insets.bottom + 120; // 100 is the height of the TabBar

  const animatedStyle = useAnimatedStyle(() => {
    const isKeyboardOpen = keyboard.state.value === KeyboardState.OPEN;
    return {
      paddingBottom: isKeyboardOpen ? keyboard.height.value : paddingBottom,
    };
  });

  const content = Platform.select({
    ios: (
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, { paddingTop, paddingBottom }]}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    ),
    android: (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[styles.container, animatedStyle, { paddingTop }]}
        >
          {children}
        </Animated.View>
      </ScrollView>
    ),
    // web: (
    //   <ScrollView
    //     style={styles.scrollView}
    //     contentContainerStyle={styles.scrollContent}
    //     keyboardShouldPersistTaps="handled"
    //   >
    //     <View style={[styles.container, { paddingTop, paddingBottom }]}>
    //       {children}
    //     </View>
    //   </ScrollView>
    // ),
  });

  return content;
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: "101%",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default memo(KeyboardAvoidingScrollableView);
