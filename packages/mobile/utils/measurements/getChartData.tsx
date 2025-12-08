import { MeasurementListResponse } from "backend";

import { ThemeText } from "@/components/ui";
import { MeasurementKey } from "@/types";
import { formatToLocalTime } from "@/utils/date";

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

  const step = Math.floor(minutes / 5); // 5 minutes

  const toLabel = (date: string) => (
    <ThemeText style={{ color: textColor }}>
      {formatToLocalTime(date, "HH:mm")}
    </ThemeText>
  );

  return data
    .filter((_, i) => i % step === 0)
    .map((d) => ({
      value: d[key],
      labelComponent: () => toLabel(d.createdAt),
    }));
};
