import { Entypo } from "@expo/vector-icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, View } from "react-native";

import { LiveMeasurementSkeleton } from "@/components/skelton";
import { CShapeGauge, ThemeText } from "@/components/ui";
import {
  HUMIDITY_GRADIENTS,
  HUMIDITY_THRESHOLDS,
  PRESSURE_GRADIENTS,
  PRESSURE_THRESHOLDS,
  TEMPERATURE_GRADIENTS,
  TEMPERATURE_THRESHOLDS,
} from "@/constants";
import { useResolvedTheme } from "@/hooks/common";
import { useLiveMeasurement } from "@/hooks/measurements";
import { formatToLocalTime } from "@/utils";

const { width } = Dimensions.get("window");
const bigRadius = width * 0.27;
const smallRadius = width * 0.17;

const HistoryMeasurementView = () => {
  const { currentThemeColors } = useResolvedTheme();
  const { data: m, isLoading } = useLiveMeasurement();
  const { t } = useTranslation();

  if (isLoading)
    return (
      <LiveMeasurementSkeleton
        bigRadius={bigRadius}
        smallRadius={smallRadius}
      />
    );
  if (!m) return <ThemeText>No measurement</ThemeText>;

  // format date
  const locatedDate = new Date(formatToLocalTime(m.createdAt));
  const formattedDate = t("common.date.format.mdehm", { date: locatedDate });

  return (
    <View style={styles.wrapper}>
      {/* temperature */}
      <View style={styles.chartContainer}>
        <CShapeGauge
          value={m.temperature}
          unit="°C"
          decimalPlaces={1}
          label={t("common.measurement.temperature")}
          iconName="thermometer"
          radius={bigRadius}
          strokeWidth={bigRadius * 0.2}
          gradientColors={TEMPERATURE_GRADIENTS}
          thresholds={TEMPERATURE_THRESHOLDS}
        />
      </View>

      {/* humidity and pressure */}
      <View style={[styles.chartContainer, styles.row]}>
        {/* humidity */}
        <View style={styles.chartContainer}>
          <CShapeGauge
            value={m.humidity}
            unit="%"
            label={t("common.measurement.humidity")}
            iconName="drop"
            radius={smallRadius}
            strokeWidth={smallRadius * 0.2}
            gradientColors={HUMIDITY_GRADIENTS}
            thresholds={HUMIDITY_THRESHOLDS}
          />
        </View>
        {/* pressure */}
        <View style={styles.chartContainer}>
          <CShapeGauge
            value={m.pressure}
            unit="hPa"
            label={t("common.measurement.pressure")}
            iconName="gauge"
            radius={smallRadius}
            strokeWidth={smallRadius * 0.2}
            gradientColors={PRESSURE_GRADIENTS}
            thresholds={PRESSURE_THRESHOLDS}
          />
        </View>
      </View>

      {/* time */}
      <View style={styles.timeWrapper}>
        <Entypo
          name="clock"
          size={20}
          color={currentThemeColors.mediumColor}
          style={styles.timeIcon}
        />
        <ThemeText
          style={[styles.time, { color: currentThemeColors.mediumColor }]}
        >
          {t("live.lastUpdate", { date: formattedDate })}
        </ThemeText>
      </View>
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
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 5,
  },
  time: {
    fontSize: 16,
  },
});

export default memo(HistoryMeasurementView);
