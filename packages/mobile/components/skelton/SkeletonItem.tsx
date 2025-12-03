import { memo, useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useResolvedTheme } from "@/hooks/common";

interface SkeletonItemProps {
  width?: ViewStyle["width"];
  height?: ViewStyle["height"];
  borderRadius?: ViewStyle["borderRadius"];
  backgroundColor?: ViewStyle["backgroundColor"];
  style?: StyleProp<ViewStyle>;
}

const SkeletonItem = ({
  width = "100%",
  height = 21,
  borderRadius = 5,
  backgroundColor,
  style,
}: SkeletonItemProps) => {
  const { currentThemeColors } = useResolvedTheme();

  const opacity = useSharedValue(1);

  const defaultBackgroundColor =
    backgroundColor ?? currentThemeColors.secondaryBackground;

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 700 }),
      Infinity,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: defaultBackgroundColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export default memo(SkeletonItem);
