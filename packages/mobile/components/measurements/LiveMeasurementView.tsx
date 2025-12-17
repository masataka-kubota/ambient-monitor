import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, View } from "react-native";

import IconLabel from "@/components/measurements/IconLabel";
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
  const { data: m, isLoading, source } = useLiveMeasurement();
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

      {/* Note */}
      <View style={styles.noteContainer}>
        {/* time */}
        <IconLabel
          icon={
            <Entypo
              name="clock"
              size={20}
              color={currentThemeColors.mediumColor}
            />
          }
          text={t("live.lastUpdate", { date: formattedDate })}
          color={currentThemeColors.mediumColor}
        />

        {/* source */}
        <IconLabel
          icon={
            source === "ble" ? (
              <MaterialCommunityIcons
                name="bluetooth"
                size={18}
                color={currentThemeColors.mediumColor}
              />
            ) : (
              <Entypo
                name="cloud"
                size={18}
                color={currentThemeColors.mediumColor}
              />
            )
          }
          text={source === "ble" ? "Bluetooth (Live Data)" : "Cloud Data"}
          color={currentThemeColors.mediumColor}
        />
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
  noteContainer: {
    marginVertical: 20,
    gap: 10,
    alignItems: "center",
  },
});

export default memo(HistoryMeasurementView);
