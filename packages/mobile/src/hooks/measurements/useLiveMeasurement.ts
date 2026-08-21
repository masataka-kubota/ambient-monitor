import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { bleDataAvailabilityAtom, selectedDeviceIdAtom } from '@/atoms';
import useBleMeasurement from '@/hooks/measurements/useBleMeasurement';
import { liveMeasurementQueryOptions } from '@/queries';
import type { BleMeasurement } from '@/types';

export type CloudLiveMeasurement = Awaited<
  ReturnType<NonNullable<ReturnType<typeof liveMeasurementQueryOptions>['queryFn']>>
>;

type UseLiveMeasurementResult =
  | {
      /** Latest measurement from the BLE notification stream. */
      data: BleMeasurement | null;
      /** Whether the BLE monitor is still starting up. */
      isLoading: boolean;
      /** Data is served from the connected BLE peripheral. */
      source: 'ble';
    }
  | {
      /** Latest measurement from the cloud API, when available. */
      data: CloudLiveMeasurement | undefined;
      /** Whether the cloud live-measurement query is loading. */
      isLoading: boolean;
      /** Data is served from the cloud fallback query. */
      source: 'cloud';
    };

/**
 * Provides the current live measurement from BLE when usable, otherwise from the cloud.
 *
 * BLE is preferred only while `bleDataAvailabilityAtom` is `usable`.
 * For `unknown` or `unusable`, the cloud query for `selectedDeviceIdAtom` is enabled
 * via `liveMeasurementQueryOptions`.
 *
 * @returns Live measurement payload, loading flag, and which source produced it.
 */
const useLiveMeasurement = (): UseLiveMeasurementResult => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);
  const bleDataAvailability = useAtomValue(bleDataAvailabilityAtom);
  const ble = useBleMeasurement();

  const cloud = useQuery({
    ...liveMeasurementQueryOptions(selectedDeviceId),
    enabled: bleDataAvailability === 'unusable',
  });

  if (bleDataAvailability === 'usable') {
    return {
      data: ble.data,
      isLoading: ble.isLoading,
      source: 'ble',
    };
  }

  return {
    data: cloud.data,
    isLoading: cloud.isLoading,
    source: 'cloud',
  };
};

export default useLiveMeasurement;
