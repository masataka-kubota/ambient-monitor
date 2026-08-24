import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, View } from 'react-native';

import MeasurementChartAxisLabel from '@/components/measurements/MeasurementChartAxisLabel';
import MeasurementLineChart from '@/components/measurements/MeasurementLineChart';
import { toMeasurementLineChartData } from '@/components/measurements/toMeasurementLineChartData';
import { DataGraphSkeleton } from '@/components/skelton';
import { IconTabs, ThemeText } from '@/components/ui';
import { MEASUREMENT_SETTINGS } from '@/constants';
import { useAppTheme } from '@/hooks/common';
import { useMeasurements } from '@/hooks/measurements';
import type { MeasurementKey, MeasurementRange, MeasurementTabItem } from '@/types';

const { width, height } = Dimensions.get('window');

const WIDTH = width - 100;
const HEIGHT = height * 0.4;

export const PERIOD_MINUTES_MAP: Record<MeasurementRange, number> = {
  '1d': 30, // 30 minutes
  '7d': 240, // 4 hour
  '30d': 720, // 12 hour
};

interface DataGraphProps {
  period: MeasurementRange;
}

const DataGraph = ({ period }: DataGraphProps) => {
  const { t } = useTranslation();
  const { activeThemeColors } = useAppTheme();

  const [selectedKey, setSelectedKey] = useState<MeasurementKey>('temperature');

  const { data, isLoading } = useMeasurements(period);

  const tabs: MeasurementTabItem[] = [
    {
      key: 'temperature',
      label: t('common.measurement.temperature'),
      iconName: 'thermometer',
    },
    {
      key: 'humidity',
      label: t('common.measurement.humidity'),
      iconName: 'drop',
    },
    {
      key: 'pressure',
      label: t('common.measurement.pressure'),
      iconName: 'gauge',
    },
  ];

  const setting = MEASUREMENT_SETTINGS[selectedKey];

  if (isLoading) {
    return (
      <DataGraphSkeleton width={WIDTH} height={HEIGHT} tabWidth={width} tabLength={tabs.length} />
    );
  }
  if (!data) {
    return <ThemeText>No data</ThemeText>;
  }

  const textColor = activeThemeColors.lightColor;
  const chartData = toMeasurementLineChartData({ data, key: selectedKey }).map((point) => ({
    value: point.value,
    hideDataPoint: point.hideDataPoint,
    hidePointer: point.hidePointer,
    labelComponent: () => (
      <MeasurementChartAxisLabel bucketStart={point.bucketStart} textColor={textColor} />
    ),
  }));

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <IconTabs tabs={tabs} selectedKey={selectedKey} onTabPress={setSelectedKey} />
      {/* Chart */}
      <MeasurementLineChart
        key={`${selectedKey}-${period}`}
        data={chartData}
        setting={setting}
        width={WIDTH}
        height={HEIGHT}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default memo(DataGraph);
