import { queryOptions } from '@tanstack/react-query';

import { apiClient } from '@/lib';
import type { MeasurementRange } from '@/types';

/**
 * Query options for historical measurements over a selected period.
 *
 * Fetches aggregated measurement data for `deviceId` and refetches every 5 minutes.
 *
 * @param deviceId - Selected device external ID
 * @param range - Lookback period (e.g. `1d`, `7d`)
 * @returns TanStack Query options co-locating `queryKey` and `queryFn`
 */
export const measurementsQueryOptions = (deviceId: string, range: MeasurementRange) =>
  queryOptions({
    queryKey: ['measurements24h', deviceId, range],
    queryFn: async () => {
      const res = await apiClient.measurements.$get({
        query: { deviceId, period: range },
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error('Failed to fetch last 24h measurements');
      }

      return data.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });
