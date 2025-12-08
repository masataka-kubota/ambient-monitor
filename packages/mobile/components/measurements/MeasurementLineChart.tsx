import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";

import { ThemeText } from "@/components/ui";
import { useResolvedTheme } from "@/hooks/common";
import { MeasurementSetting } from "@/types";

interface LineChartDataPoint {
  labelComponent?: React.ReactNode;
  value: number;
}

interface MeasurementLineChartProps {
  data?: lineDataItem[] | undefined;
  setting: MeasurementSetting;
  width: number;
  height: number;
}

const MeasurementLineChart = ({
  data,
  setting,
  width,
  height,
}: MeasurementLineChartProps) => {
  const { currentThemeColors } = useResolvedTheme();

  return (
    <View style={styles.chartContainer}>
      <LineChart
        data={data}
        width={width}
        height={height}
        maxValue={setting.max - setting.min}
        yAxisOffset={setting.min}
        roundToDigits={0} // No decimals on y axis
        spacing={60}
        initialSpacing={30}
        endSpacing={15}
        adjustToWidth
        isAnimated
        nestedScrollEnabled
        scrollToEnd
        overScrollMode="auto"
        animateOnDataChange
        scrollAnimation
        showScrollIndicator
        noOfSections={6}
        showVerticalLines={false}
        thickness={3}
        color={currentThemeColors.tint}
        dataPointsColor={currentThemeColors.tint}
        yAxisTextStyle={{ color: currentThemeColors.lightColor }}
        rulesColor={currentThemeColors.lightColor}
        yAxisColor={currentThemeColors.lightColor}
        xAxisColor={currentThemeColors.lightColor}
        xAxisLabelsHeight={20}
        pointerConfig={{
          pointerColor: currentThemeColors.mainColor,
          showPointerStrip: false,
          pointerLabelWidth: 60,
          pointerLabelHeight: 50,
          autoAdjustPointerLabelPosition: true,
          activatePointersOnLongPress: true,
          activatePointersInstantlyOnTouch: false,
          // activatePointersDelay: 500,
          pointerLabelComponent: (
            dataPoints: LineChartDataPoint[] | undefined,
          ) => {
            if (!dataPoints) return null;
            const value = dataPoints[0].value.toFixed(setting.decimals);
            return (
              <View
                style={[
                  styles.pointerLabelContainer,
                  { backgroundColor: currentThemeColors.mainColor },
                ]}
              >
                <ThemeText
                  style={[
                    styles.pointerLabelText,
                    { color: currentThemeColors.mainBackground },
                  ]}
                >
                  {`${value}${setting.unit}`}
                </ThemeText>
              </View>
            );
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    flex: 1,
  },
  pointerLabelContainer: {
    alignItems: "center",
    padding: 5,
    borderRadius: 5,
  },
  pointerLabelText: {
    fontSize: 12,
  },
});

export default memo(MeasurementLineChart);
