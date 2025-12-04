import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemeText } from "@/components/ui";
import { useMeasurements } from "@/hooks/measurements";

const DataMeasurementsView = () => {
  const { data: measurements, isLoading } = useMeasurements();

  if (isLoading) {
    return <ThemeText>Loading...</ThemeText>;
  }

  if (!measurements) {
    return <ThemeText>No measurements</ThemeText>;
  }

  return (
    <View>
      {measurements.map((m) => (
        <View key={m.id} style={styles.listContainer}>
          <ThemeText>dateTime: {m.createdAt}</ThemeText>
          <View style={styles.measurementContainer}>
            <ThemeText>temp: {m.temperature}</ThemeText>
            <ThemeText>humidity: {m.humidity}</ThemeText>
            <ThemeText>pressure: {m.pressure}</ThemeText>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginBottom: 10,
  },
  measurementContainer: {
    flexDirection: "row",
    gap: 10,
  },
});

export default memo(DataMeasurementsView);
