import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { bleDataAvailabilityAtom, selectedDeviceIdAtom } from '@/atoms';
import useBleMeasurement from '@/hooks/measurements/useBleMeasurement';
import { liveMeasurementQueryOptions } from '@/queries';

const useLiveMeasurement = () => {
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
      source: 'ble' as const,
    };
  }

  return {
    data: cloud.data,
    isLoading: cloud.isLoading,
    source: 'cloud' as const,
  };
};

export default useLiveMeasurement;
