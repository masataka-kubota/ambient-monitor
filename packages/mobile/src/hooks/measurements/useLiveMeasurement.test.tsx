import { queryOptions } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { Peripheral } from 'react-native-ble-manager';

import { bleMeasurementAtom, connectedDeviceAtom, selectedDeviceIdAtom } from '@/atoms';
import { BLE_MEASUREMENT_STALE_THRESHOLD_MS } from '@/constants';
import useBleMeasurement from '@/hooks/measurements/useBleMeasurement';
import type { CloudLiveMeasurement } from '@/queries';
import { liveMeasurementQueryOptions } from '@/queries';
import { createTestWrapper, type HydrateAtomPair } from '@/test/helpers';
import type { BleMeasurement } from '@/types';

import useLiveMeasurement from './useLiveMeasurement';

jest.mock('@/hooks/measurements/useBleMeasurement', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/queries', () => ({
  liveMeasurementQueryOptions: jest.fn(),
}));

const mockUseBleMeasurement = jest.mocked(useBleMeasurement);
const mockLiveMeasurementQueryOptions = jest.mocked(liveMeasurementQueryOptions);

const connectedDevice = { id: 'ble-1', name: 'Sensor' } as Peripheral;

const bleMeasurement: BleMeasurement = {
  temperature: 21.5,
  humidity: 45,
  pressure: 1012,
  createdAt: '2026-08-17T00:00:00.000Z',
  receivedAt: Date.now(),
};

const cloudMeasurement: CloudLiveMeasurement = {
  id: 1,
  deviceId: 10,
  temperature: 22.5,
  humidity: 48,
  pressure: 1013.2,
  createdAt: '2026-08-17T01:00:00.000Z',
};

const mockQueryOptions = (
  options: Parameters<typeof queryOptions>[0],
): ReturnType<typeof liveMeasurementQueryOptions> =>
  queryOptions(options) as ReturnType<typeof liveMeasurementQueryOptions>;

const renderUseLiveMeasurement = async (atoms: HydrateAtomPair[]) =>
  renderHook(() => useLiveMeasurement(), {
    wrapper: createTestWrapper({ atoms }),
  });

describe('useLiveMeasurement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBleMeasurement.mockReturnValue({
      data: bleMeasurement,
      isLoading: false,
    });
  });

  it('returns BLE data when BLE measurements are usable', async () => {
    const queryFn = jest.fn().mockResolvedValue(cloudMeasurement);
    mockLiveMeasurementQueryOptions.mockReturnValue(
      mockQueryOptions({
        queryKey: ['liveMeasurement', 'device-123'],
        queryFn,
      }),
    );

    const { result, unmount } = await renderUseLiveMeasurement([
      [selectedDeviceIdAtom, 'device-123'],
      [connectedDeviceAtom, connectedDevice],
      [bleMeasurementAtom, bleMeasurement],
    ]);

    expect(result.current).toEqual({
      data: bleMeasurement,
      isLoading: false,
      source: 'ble',
    });
    expect(mockLiveMeasurementQueryOptions).toHaveBeenCalledWith('device-123');
    expect(queryFn).not.toHaveBeenCalled();

    await unmount();
  });

  it('falls back to cloud data when BLE is unusable', async () => {
    const queryFn = jest.fn().mockResolvedValue(cloudMeasurement);
    mockLiveMeasurementQueryOptions.mockReturnValue(
      mockQueryOptions({
        queryKey: ['liveMeasurement', 'device-123'],
        queryFn,
      }),
    );

    const { result, unmount } = await renderUseLiveMeasurement([
      [selectedDeviceIdAtom, 'device-123'],
      [connectedDeviceAtom, null],
      [bleMeasurementAtom, null],
    ]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      data: cloudMeasurement,
      isLoading: false,
      source: 'cloud',
    });
    expect(queryFn).toHaveBeenCalled();

    await unmount();
  });

  it('uses the cloud source while BLE availability is still unknown', async () => {
    const queryFn = jest.fn().mockResolvedValue(cloudMeasurement);
    mockUseBleMeasurement.mockReturnValue({
      data: null,
      isLoading: true,
    });
    mockLiveMeasurementQueryOptions.mockReturnValue(
      mockQueryOptions({
        queryKey: ['liveMeasurement', 'device-123'],
        queryFn,
      }),
    );

    const { result, unmount } = await renderUseLiveMeasurement([
      [selectedDeviceIdAtom, 'device-123'],
      [connectedDeviceAtom, connectedDevice],
      [bleMeasurementAtom, null],
    ]);

    // Cloud is only enabled for `unusable`; `unknown` still reports the cloud source
    // but does not fetch until availability flips.
    expect(result.current.source).toBe('cloud');
    expect(queryFn).not.toHaveBeenCalled();

    await unmount();
  });

  it('falls back to cloud when connected BLE data has gone stale', async () => {
    const queryFn = jest.fn().mockResolvedValue(cloudMeasurement);
    mockLiveMeasurementQueryOptions.mockReturnValue(
      mockQueryOptions({
        queryKey: ['liveMeasurement', 'device-123'],
        queryFn,
      }),
    );

    const { result, unmount } = await renderUseLiveMeasurement([
      [selectedDeviceIdAtom, 'device-123'],
      [connectedDeviceAtom, connectedDevice],
      [
        bleMeasurementAtom,
        {
          ...bleMeasurement,
          receivedAt: Date.now() - (BLE_MEASUREMENT_STALE_THRESHOLD_MS + 1),
        },
      ],
    ]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.source).toBe('cloud');
    expect(result.current.data).toEqual(cloudMeasurement);
    expect(queryFn).toHaveBeenCalled();

    await unmount();
  });

  it('exposes cloud loading state before the fallback query resolves', async () => {
    let resolveQuery: ((value: typeof cloudMeasurement) => void) | undefined;
    mockLiveMeasurementQueryOptions.mockReturnValue(
      mockQueryOptions({
        queryKey: ['liveMeasurement', 'device-123'],
        queryFn: () =>
          new Promise((resolve) => {
            resolveQuery = resolve;
          }),
      }),
    );

    const { result, unmount } = await renderUseLiveMeasurement([
      [selectedDeviceIdAtom, 'device-123'],
      [connectedDeviceAtom, null],
      [bleMeasurementAtom, null],
    ]);

    expect(result.current).toEqual({
      data: undefined,
      isLoading: true,
      source: 'cloud',
    });

    resolveQuery?.(cloudMeasurement);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(cloudMeasurement);
    await unmount();
  });
});
