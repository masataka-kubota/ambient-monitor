import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';

import { ThemeText } from '@/components/ui';
import { useAppTheme } from '@/hooks/common';
import { MeasurementSetting } from '@/types';

interface LineChartDataPoint {
  labelComponent?: React.ReactNode;
  value?: number;
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
  const { activeThemeColors } = useAppTheme();

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
        color={activeThemeColors.tint}
        dataPointsColor={activeThemeColors.tint}
        yAxisTextStyle={{ color: activeThemeColors.lightColor }}
        rulesColor={activeThemeColors.lightColor}
        yAxisColor={activeThemeColors.lightColor}
        xAxisColor={activeThemeColors.lightColor}
        xAxisLabelsHeight={20}
        pointerConfig={{
          pointerColor: activeThemeColors.mainColor,
          showPointerStrip: false,
          pointerLabelWidth: 60,
          pointerLabelHeight: 50,
          autoAdjustPointerLabelPosition: true,
          activatePointersOnLongPress: true,
          activatePointersInstantlyOnTouch: false,
          pointerLabelComponent: (
            dataPoints: LineChartDataPoint[] | undefined,
          ) => {
            if (!dataPoints) return null;
            if (!dataPoints[0].value) return null;
            const value = dataPoints[0].value.toFixed(setting.decimals);
            return (
              <View
                style={[
                  styles.pointerLabelContainer,
                  { backgroundColor: activeThemeColors.mainColor },
                ]}
              >
                <ThemeText
                  style={[
                    styles.pointerLabelText,
                    { color: activeThemeColors.mainBackground },
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
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
  },
  pointerLabelText: {
    fontSize: 12,
  },
});

export default memo(MeasurementLineChart);
