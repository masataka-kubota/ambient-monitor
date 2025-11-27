import { useEffect } from "react";

import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface TabBarItemProps {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  accessibilityLabel?: string;
  testID?: string;
  color: string;
  label: string;
  icon: React.ReactNode;
}

const TabBarItem = ({
  onPress,
  onLongPress,
  isFocused,
  accessibilityLabel,
  testID,
  color,
  label,
  icon,
}: TabBarItemProps) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      stiffness: 1500,
      damping: 80,
    });
  }, [isFocused, scale]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const top = interpolate(scale.value, [0, 1], [0, 8]);
    return { transform: [{ scale: scaleValue }], top };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);
    return { opacity };
  });

  return (
    <Pressable
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabbarItem}
    >
      <Animated.View style={animatedIconStyle}>{icon}</Animated.View>
      <Animated.Text style={[styles.tabbarText, { color }, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabbarItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabbarText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default TabBarItem;
