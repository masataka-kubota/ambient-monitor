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
        width={bigRadius * 1.5}
        height={16}
        borderRadius={8}
        style={styles.timeWrapper}
      />

      <SkeletonItem
        width={bigRadius}
        height={16}
        borderRadius={8}
        style={styles.sourceWrapper}
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
    marginTop: 20,
  },
  sourceWrapper: {
    marginTop: 10,
  },
});

export default memo(LiveMeasurementSkeleton);
