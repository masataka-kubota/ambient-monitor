import { memo } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

import { useResolvedTheme } from "@/hooks/common";
import { useSkeletonAnimation } from "@/hooks/ui";

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
  const { skeltonAnimatedStyle } = useSkeletonAnimation();

  const defaultBackgroundColor =
    backgroundColor ?? currentThemeColors.secondaryBackground;

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: defaultBackgroundColor,
        },
        skeltonAnimatedStyle,
        style,
      ]}
    />
  );
};

export default memo(SkeletonItem);
