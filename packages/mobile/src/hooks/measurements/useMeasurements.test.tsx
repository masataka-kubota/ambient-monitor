import { queryOptions } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { selectedDeviceIdAtom } from '@/atoms';
import { measurementsQueryOptions } from '@/queries';
import { createTestWrapper } from '@/test/helpers';
import type { MeasurementRange } from '@/types';

import useMeasurements from './useMeasurements';

jest.mock('@/queries', () => ({
  measurementsQueryOptions: jest.fn(),
}));

const mockMeasurementsQueryOptions = jest.mocked(measurementsQueryOptions);

const sampleMeasurements = [
  {
    bucketStart: '2026-08-17T00:00:00.000Z',
    temperature: 22.5,
    humidity: 48,
    pressure: 1013.2,
  },
];

describe('useMeasurements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockQueryOptions = (
    options: Parameters<typeof queryOptions>[0],
  ): ReturnType<typeof measurementsQueryOptions> =>
    queryOptions(options) as ReturnType<typeof measurementsQueryOptions>;

  const renderUseMeasurements = async (deviceId: string, range: MeasurementRange) =>
    renderHook(() => useMeasurements(range), {
      wrapper: createTestWrapper({
        atoms: [[selectedDeviceIdAtom, deviceId]],
      }),
    });

  it('queries with the selected device id and requested range', async () => {
    mockMeasurementsQueryOptions.mockReturnValue(
      mockQueryOptions({
        queryKey: ['measurements', 'device-123', '7d'],
        queryFn: async () => sampleMeasurements,
      }),
    );

    const { result, unmount } = await renderUseMeasurements('device-123', '7d');

    expect(mockMeasurementsQueryOptions).toHaveBeenCalledWith('device-123', '7d');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(sampleMeasurements);
    await unmount();
  });

  it('exposes an error state when the query fails', async () => {
    mockMeasurementsQueryOptions.mockReturnValue(
      mockQueryOptions({
        queryKey: ['measurements', 'device-123', '1d'],
        queryFn: async () => {
          throw new Error('Failed to fetch measurements for period 1d');
        },
      }),
    );

    const { result, unmount } = await renderUseMeasurements('device-123', '1d');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error('Failed to fetch measurements for period 1d'));
    await unmount();
  });

  it('starts in a loading state before the query resolves', async () => {
    let resolveQuery: ((value: typeof sampleMeasurements) => void) | undefined;

    mockMeasurementsQueryOptions.mockReturnValue(
      mockQueryOptions({
        queryKey: ['measurements', 'device-001', '30d'],
        queryFn: () =>
          new Promise((resolve) => {
            resolveQuery = resolve;
          }),
      }),
    );

    const { result, unmount } = await renderUseMeasurements('device-001', '30d');

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    resolveQuery?.(sampleMeasurements);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    await unmount();
  });
});
