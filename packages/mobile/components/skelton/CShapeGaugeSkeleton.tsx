import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import SkeletonItem from "@/components/skelton/SkeletonItem";
import { useResolvedTheme } from "@/hooks/common";
import { useSkeletonAnimation } from "@/hooks/ui";
import { describeArc } from "@/utils";

interface CShapeGaugeSkeletonProps {
  radius: number;
  strokeWidth: number;
}

const CShapeGaugeSkeleton = ({
  radius,
  strokeWidth,
}: CShapeGaugeSkeletonProps) => {
  const { currentThemeColors } = useResolvedTheme();
  const { skeltonAnimatedStyle } = useSkeletonAnimation();

  const size = radius * 2 + strokeWidth * 2;
  const center = radius + strokeWidth;
  const path = describeArc(radius, center);

  return (
    <View style={styles.wrapper}>
      {/* Arc */}
      <Animated.View style={skeltonAnimatedStyle}>
        <Svg width={size} height={size}>
          <Path
            d={path}
            stroke={currentThemeColors.secondaryBackground}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* Value */}
      <View style={[styles.centered, { top: center - radius * 0.25 }]}>
        <SkeletonItem width={radius * 0.8} height={radius * 0.5} />
      </View>

      {/* Label */}
      <View style={[styles.centered, styles.labelContainer]}>
        <SkeletonItem width={radius * 0.8} height={radius * 0.25} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    margin: 5,
  },
  centered: {
    position: "absolute",
    alignItems: "center",
  },
  labelContainer: {
    bottom: 0,
  },
});

export default memo(CShapeGaugeSkeleton);
