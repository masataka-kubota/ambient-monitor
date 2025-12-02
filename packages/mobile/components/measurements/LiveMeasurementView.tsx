import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemeText } from "@/components/ui";
import { useLiveMeasurement } from "@/hooks/measurements";

const LiveMeasurementView = () => {
  const { data: measurement, isLoading } = useLiveMeasurement();

  if (isLoading) return <ThemeText>Loading...</ThemeText>;

  if (!measurement) return <ThemeText>No measurement</ThemeText>;

  return (
    <View>
      <ThemeText>time: {measurement.createdAt}</ThemeText>
      <ThemeText>temperature: {measurement.temperature}</ThemeText>
      <ThemeText>humidity: {measurement.humidity}</ThemeText>
      <ThemeText>pressure: {measurement.pressure}</ThemeText>
    </View>
  );
};

const styles = StyleSheet.create({});

export default memo(LiveMeasurementView);
