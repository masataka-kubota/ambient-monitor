import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { selectedDeviceIdAtom } from '@/atoms';
import { measurementsQueryOptions } from '@/queries';
import type { MeasurementRange } from '@/types';

const useMeasurements = (range: MeasurementRange) => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);

  return useQuery(measurementsQueryOptions(selectedDeviceId, range));
};

export default useMeasurements;
