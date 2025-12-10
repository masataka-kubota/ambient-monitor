import { memo } from "react";
import { StyleSheet, View } from "react-native";

import CShapeGaugeSkeleton from "@/components/skelton/CShapeGaugeSkeleton";
import SkeletonItem from "@/components/skelton/SkeletonItem";

interface LiveMeasurementSkeletonProps {
  bigRadius: number;
  smallRadius: number;
}

const LiveMeasurementSkeleton = ({
  bigRadius,
  smallRadius,
}: LiveMeasurementSkeletonProps) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.chartContainer}>
        <CShapeGaugeSkeleton radius={bigRadius} strokeWidth={bigRadius * 0.2} />
      </View>

      <View style={[styles.chartContainer, styles.row]}>
        <CShapeGaugeSkeleton
          radius={smallRadius}
          strokeWidth={smallRadius * 0.2}
        />
        <CShapeGaugeSkeleton
          radius={smallRadius}
          strokeWidth={smallRadius * 0.2}
        />
      </View>

      <SkeletonItem
        width={bigRadius}
        height={16}
        borderRadius={8}
        style={styles.timeWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chartContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  timeWrapper: {
    marginVertical: 20,
  },
});

export default memo(LiveMeasurementSkeleton);
