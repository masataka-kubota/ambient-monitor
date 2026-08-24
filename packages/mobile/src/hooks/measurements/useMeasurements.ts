import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { selectedDeviceIdAtom } from '@/atoms';
import type { MeasurementsData } from '@/queries';
import { measurementsQueryOptions } from '@/queries';
import type { MeasurementRange } from '@/types';

/**
 * Loads historical measurements for the currently selected device.
 *
 * Reads `selectedDeviceIdAtom` and delegates fetching to
 * `measurementsQueryOptions` for the given lookback `range`.
 *
 * @param range - Lookback period (e.g. `1d`, `7d`).
 * @returns TanStack Query result for the device and period.
 */
const useMeasurements = (range: MeasurementRange): UseQueryResult<MeasurementsData> => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);

  return useQuery(measurementsQueryOptions(selectedDeviceId, range));
};

export default useMeasurements;
