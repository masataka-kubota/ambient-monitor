import type { MeasurementListResponse } from 'backend';

import type { MeasurementKey } from '@/types';

interface ToMeasurementLineChartDataParams {
  data: MeasurementListResponse['data'] | undefined;
  key: MeasurementKey;
}

export interface MeasurementLineChartPoint {
  value: number | undefined;
  bucketStart: string;
  hideDataPoint: boolean;
  hidePointer: boolean;
}

/** Map measurement buckets into plain line-chart points (no UI). */
export const toMeasurementLineChartData = ({
  data,
  key,
}: ToMeasurementLineChartDataParams): MeasurementLineChartPoint[] => {
  if (!data) {
    return [];
  }

  return data.map((d) => {
    const value = d[key] ?? undefined;
    const isMissing = value === undefined;

    return {
      value,
      bucketStart: d.bucketStart,
      hideDataPoint: isMissing,
      hidePointer: isMissing,
    };
  });
};
