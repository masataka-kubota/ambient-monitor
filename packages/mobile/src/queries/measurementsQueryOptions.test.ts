import { apiClient } from '@/lib';

import { measurementsQueryOptions } from './measurementsQueryOptions';

jest.mock('@/lib', () => ({
  apiClient: {
    measurements: {
      $get: jest.fn(),
    },
  },
}));

const mockGet = apiClient.measurements.$get as jest.Mock;

const runQueryFn = (options: ReturnType<typeof measurementsQueryOptions>) => {
  // Implementation ignores QueryFunctionContext; avoid fabricating QueryClient/meta.
  return (options.queryFn as () => Promise<unknown>)();
};

describe('measurementsQueryOptions', () => {
  const deviceId = 'device-123';
  const range = '7d' as const;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes the measurements query key and refetch interval', () => {
    const options = measurementsQueryOptions(deviceId, range);

    expect(options.queryKey).toEqual(['measurements', deviceId, range]);
    expect(options.refetchInterval).toBe(5 * 60 * 1000);
  });

  it('returns measurements when the API succeeds', async () => {
    const responseData = [
      {
        bucketStart: '2026-08-17T00:00:00.000Z',
        temperature: 22.5,
        humidity: 48,
        pressure: 1013.2,
      },
    ];

    mockGet.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ success: true, data: responseData }),
    });

    const options = measurementsQueryOptions(deviceId, range);

    await expect(runQueryFn(options)).resolves.toEqual(responseData);
    expect(mockGet).toHaveBeenCalledWith({ query: { deviceId, period: range } });
  });

  it('throws when the API reports failure', async () => {
    mockGet.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ success: false, data: null }),
    });

    const options = measurementsQueryOptions(deviceId, '1d');

    await expect(runQueryFn(options)).rejects.toThrow(
      'Failed to fetch measurements for period 1d',
    );
  });
});
