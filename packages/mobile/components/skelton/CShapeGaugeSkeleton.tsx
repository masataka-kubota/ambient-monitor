import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import SkeletonItem from "@/components/skelton/SkeletonItem";
import { useResolvedTheme } from "@/hooks/common";
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

  const size = radius * 2 + strokeWidth * 2;
  const center = radius + strokeWidth;
  const path = describeArc(radius, center);

  return (
    <View style={styles.wrapper}>
      {/* Arc */}
      <Svg width={size} height={size}>
        <Path
          d={path}
          stroke={currentThemeColors.secondaryBackground}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>

      {/* Value */}
      <View style={[styles.centered, { top: center - radius * 0.25 }]}>
        <SkeletonItem width={radius * 0.8} height={radius * 0.5} />
      </View>

      {/* Label */}
      <View style={[styles.centered, styles.labelContainer]}>
        <SkeletonItem width={radius * 0.8} height={radius * 0.2} />
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
