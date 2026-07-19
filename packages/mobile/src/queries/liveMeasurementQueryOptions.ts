import { queryOptions } from '@tanstack/react-query';

import { apiClient } from '@/lib';

/**
 * Query options for the latest cloud measurement for a device.
 *
 * Used as a fallback when BLE live data is unavailable. Refetches every 5 minutes.
 *
 * @param deviceId - Selected device external ID
 * @returns TanStack Query options co-locating `queryKey` and `queryFn`
 */
export const liveMeasurementQueryOptions = (deviceId: string) =>
  queryOptions({
    queryKey: ['liveMeasurement', deviceId],
    queryFn: async () => {
      const res = await apiClient.measurements.latest.$get({
        query: { deviceId },
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error('Failed to fetch latest measurement');
      }

      return data.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });
