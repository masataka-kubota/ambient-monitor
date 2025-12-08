import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, View } from "react-native";

import MeasurementLineChart from "@/components/measurements/MeasurementLineChart";
import { IconTabs, ThemeText } from "@/components/ui";
import { MEASUREMENT_SETTINGS } from "@/constants";
import { useResolvedTheme } from "@/hooks/common";
import { useMeasurements24h } from "@/hooks/measurements/useMeasurements24h";
import { MeasurementKey, MeasurementTabItem } from "@/types";
import { getChartData } from "@/utils/measurements";

const { width, height } = Dimensions.get("window");

const WIDTH = width - 100;
const HEIGHT = height * 0.4;

const Data24hGraph = () => {
  const { t } = useTranslation();
  const { currentThemeColors } = useResolvedTheme();
  const { data, isLoading } = useMeasurements24h();

  const tabs: MeasurementTabItem[] = [
    {
      key: "temperature",
      label: t("common.measurement.temperature"),
      iconName: "thermometer",
    },
    {
      key: "humidity",
      label: t("common.measurement.humidity"),
      iconName: "drop",
    },
    {
      key: "pressure",
      label: t("common.measurement.pressure"),
      iconName: "gauge",
    },
  ];

  const [selectedKey, setSelectedKey] = useState<MeasurementKey>(tabs[0].key);

  const setting = MEASUREMENT_SETTINGS[selectedKey];

  if (isLoading) return <ThemeText>Loading...</ThemeText>;
  if (!data) return <ThemeText>No data</ThemeText>;

  const chartData = getChartData({
    data,
    key: selectedKey,
    minutes: 30,
    textColor: currentThemeColors.lightColor,
  });

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <IconTabs
        tabs={tabs}
        selectedKey={selectedKey}
        onTabPress={setSelectedKey}
      />
      {/* Chart */}
      <MeasurementLineChart
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

export default memo(Data24hGraph);
