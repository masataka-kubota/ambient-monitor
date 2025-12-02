import { memo } from "react";
import { View } from "react-native";

import { ThemeText } from "@/components/ui";
import { useMeasurements } from "@/hooks/measurements";

const MeasurementView = () => {
  const { data: measurements, isLoading } = useMeasurements();

  if (isLoading) {
    return <ThemeText>Loading...</ThemeText>;
  }

  if (!measurements) {
    return <ThemeText>No measurements</ThemeText>;
  }

  return (
    <View>
      <ThemeText>
        {measurements.map((m) => (
          <View key={m.id}>
            <ThemeText>temperature: {m.temperature}</ThemeText>
            <ThemeText>humidity: {m.humidity}</ThemeText>
            <ThemeText>pressure: {m.pressure}</ThemeText>
          </View>
        ))}
      </ThemeText>
    </View>
  );
};

export default memo(MeasurementView);
