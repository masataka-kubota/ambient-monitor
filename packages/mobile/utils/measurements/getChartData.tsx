import { MeasurementListResponse } from "backend";

import { ThemeText } from "@/components/ui";
import { MeasurementKey } from "@/types";
import { formatToLocalTime } from "@/utils/date";

const INTERVAL = 5; // 5 minutes

interface getChartDataProps {
  data: MeasurementListResponse["data"] | undefined;
  key: MeasurementKey;
  minutes: number;
  textColor: string;
}

export const getChartData = ({
  data,
  key,
  minutes = 30,
  textColor,
}: getChartDataProps) => {
  if (!data) return [];

  const step = Math.floor(minutes / INTERVAL);

  const toLabel = (date: string) => (
    <ThemeText style={{ color: textColor }}>
      {formatToLocalTime(date, "HH:mm")}
    </ThemeText>
  );

  const filtered = data
    .filter((_, i) => i % step === 0)
    .map((d) => ({
      value: d[key],
      labelComponent: () => toLabel(d.createdAt),
    }));

  // If the latest data is not included in the filtered data, add it.
  const latest = data[data.length - 1];
  if (!filtered.length || filtered[filtered.length - 1].value !== latest[key]) {
    filtered.push({
      value: latest[key],
      labelComponent: () => toLabel(latest.createdAt),
    });
  }

  return filtered;
};
