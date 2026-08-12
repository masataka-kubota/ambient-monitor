import { StyleSheet, View } from 'react-native';

import { ThemeText } from '@/components/ui';
import { formatToLocalTime } from '@/utils';

interface MeasurementChartAxisLabelProps {
  bucketStart: string;
  textColor: string;
}

/** X-axis label for a measurement line-chart bucket (day + time). */
const MeasurementChartAxisLabel = ({ bucketStart, textColor }: MeasurementChartAxisLabelProps) => {
  const formatted = formatToLocalTime(bucketStart, 'MM/dd HH:mm');
  const parts = formatted.split(' ');
  const day = parts[0] ?? '';
  const time = parts[1] ?? '';

  return (
    <View style={styles.container}>
      <ThemeText style={{ color: textColor }}>{day}</ThemeText>
      <ThemeText style={{ color: textColor }}>{time}</ThemeText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});

export default MeasurementChartAxisLabel;
