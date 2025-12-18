import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import SkeletonItem from "@/components/skelton/SkeletonItem";
import { useResolvedTheme } from "@/hooks/common";

const PADDING_HORIZONTAL = 20;
const GAP = 5;
const SPACE = (PADDING_HORIZONTAL + GAP) * 2;
const DUMMY_DATA = [{ value: 21 }, { value: 22 }, { value: 21 }, { value: 22 }];

interface DataGraphSkeletonProps {
  width: number;
  height: number;
  tabWidth: number;
  tabLength: number;
}

const DataGraphSkeleton = ({
  width,
  height,
  tabWidth,
  tabLength,
}: DataGraphSkeletonProps) => {
  const { currentThemeColors } = useResolvedTheme();

  return (
    <View>
      <View style={styles.container}>
        {/* Tabs Skeleton */}
        <View style={styles.tabsSkeletonContainer}>
          {Array.from({ length: tabLength }).map((_, index) => (
            <SkeletonItem
              key={index}
              width={tabWidth / tabLength - SPACE}
              height={65}
              borderRadius={10}
            />
          ))}
        </View>

        {/* Dummy Chart */}
        <LineChart
          data={DUMMY_DATA}
          width={width}
          height={height}
          roundToDigits={0} // No decimals on y axis
          spacing={60}
          initialSpacing={30}
          endSpacing={15}
          adjustToWidth
          isAnimated={false}
          nestedScrollEnabled
          scrollToEnd
          overScrollMode="auto"
          animateOnDataChange
          scrollAnimation
          showScrollIndicator
          noOfSections={6}
          showVerticalLines={false}
          thickness={3}
          color={currentThemeColors.lightColor}
          dataPointsColor={currentThemeColors.lightColor}
          yAxisTextStyle={{ color: currentThemeColors.lightColor }}
          rulesColor={currentThemeColors.lightColor}
          yAxisColor={currentThemeColors.lightColor}
          xAxisColor={currentThemeColors.lightColor}
          xAxisLabelsHeight={20}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsSkeletonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
    paddingVertical: 8,
    gap: GAP,
  },
});

export default memo(DataGraphSkeleton);
