import { QueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib';

import { liveMeasurementQueryOptions } from './liveMeasurementQueryOptions';

jest.mock('@/lib', () => ({
  apiClient: {
    measurements: {
      latest: {
        $get: jest.fn(),
      },
    },
  },
}));

const mockLatestGet = apiClient.measurements.latest.$get as jest.Mock;

const runQueryFn = (options: ReturnType<typeof liveMeasurementQueryOptions>) => {
  const ctx = {
    client: new QueryClient(),
    queryKey: [...options.queryKey] as string[],
    signal: new AbortController().signal,
    meta: undefined,
  } as Parameters<NonNullable<typeof options.queryFn>>[0];

  return options.queryFn!(ctx);
};

describe('liveMeasurementQueryOptions', () => {
  const deviceId = 'device-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes the live measurement query key and refetch interval', () => {
    const options = liveMeasurementQueryOptions(deviceId);

    expect(options.queryKey).toEqual(['liveMeasurement', deviceId]);
    expect(options.refetchInterval).toBe(5 * 60 * 1000);
  });

  it('returns the latest measurement when the API succeeds', async () => {
    const responseData = {
      id: 1,
      deviceId: 10,
      temperature: 22.5,
      humidity: 48,
      pressure: 1013.2,
      createdAt: '2026-08-17T00:00:00.000Z',
    };

    mockLatestGet.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ success: true, data: responseData }),
    });

    const options = liveMeasurementQueryOptions(deviceId);

    await expect(runQueryFn(options)).resolves.toEqual(responseData);
    expect(mockLatestGet).toHaveBeenCalledWith({ query: { deviceId } });
  });

  it('throws when the API reports failure', async () => {
    mockLatestGet.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ success: false, data: null }),
    });

    const options = liveMeasurementQueryOptions(deviceId);

    await expect(runQueryFn(options)).rejects.toThrow('Failed to fetch latest measurement');
  });
});
