import { MeasurementListResponse } from "backend";
import { View } from "react-native";

import { ThemeText } from "@/components/ui";
import { MeasurementKey } from "@/types";
import { formatToLocalTime } from "@/utils/date";

interface getChartDataProps {
  data: MeasurementListResponse["data"] | undefined;
  key: MeasurementKey;
  textColor: string;
}

export const getChartData = ({ data, key, textColor }: getChartDataProps) => {
  if (!data) return [];

  const toLabel = (date: string) => {
    const formatted = formatToLocalTime(date, "MM/dd HH:mm");
    const [day, time] = formatted.split(" ");
    return (
      <View style={{ alignItems: "center" }}>
        <ThemeText style={{ color: textColor }}>{day}</ThemeText>
        <ThemeText style={{ color: textColor }}>{time}</ThemeText>
      </View>
    );
  };

  const filtered = data.map((d) => {
    const value = d[key] ?? undefined;
    const isUndefined = value === undefined;

    return {
      value,
      labelComponent: () => toLabel(d.bucketStart),
      hideDataPoint: isUndefined,
      hidePointer: isUndefined,
    };
  });

  return filtered;
};
