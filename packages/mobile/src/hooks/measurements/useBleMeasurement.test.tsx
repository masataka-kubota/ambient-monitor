import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { Peripheral } from 'react-native-ble-manager';

import { connectedDeviceAtom } from '@/atoms';
import { BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID } from '@/constants/ble';
import { bleManager } from '@/lib';
import { createTestWrapper } from '@/test/helpers';

import useBleMeasurement, { decodeMeasurement } from './useBleMeasurement';

jest.mock('@/lib', () => ({
  bleManager: {
    read: jest.fn(),
    startNotification: jest.fn(),
    onDidUpdateValueForCharacteristic: jest.fn(),
  },
}));

const mockRead = bleManager.read as jest.Mock;
const mockStartNotification = bleManager.startNotification as jest.Mock;
const mockOnDidUpdateValueForCharacteristic =
  bleManager.onDidUpdateValueForCharacteristic as jest.Mock;

const connectedDevice = { id: 'ble-1', name: 'Sensor' } as Peripheral;

const encodeMeasurementBytes = ({
  temperature,
  humidity,
  pressure,
  timestamp,
}: {
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: number;
}): number[] => {
  const view = new DataView(new ArrayBuffer(12));

  view.setInt16(0, Math.round(temperature * 100), true);
  view.setInt16(2, Math.round(humidity * 100), true);
  view.setInt32(4, Math.round(pressure * 100), true);
  view.setUint32(8, timestamp, true);

  return Array.from(new Uint8Array(view.buffer));
};

const sampleMeasurement = {
  temperature: 21.5,
  humidity: 45.67,
  pressure: 1013.25,
  timestamp: 1712345678,
};

const renderUseBleMeasurement = async (device: Peripheral | null) =>
  renderHook(() => useBleMeasurement(), {
    wrapper: createTestWrapper({ atoms: [[connectedDeviceAtom, device]] }),
  });

describe('decodeMeasurement', () => {
  it('decodes a typical BLE sensor payload into measurement values', () => {
    const decoded = decodeMeasurement(encodeMeasurementBytes(sampleMeasurement));

    expect(decoded.temperature).toBeCloseTo(sampleMeasurement.temperature);
    expect(decoded.humidity).toBeCloseTo(sampleMeasurement.humidity);
    expect(decoded.pressure).toBeCloseTo(sampleMeasurement.pressure);
    expect(decoded.timestamp).toBe(sampleMeasurement.timestamp);
  });

  it('decodes negative and boundary values correctly', () => {
    const measurement = {
      temperature: -3.5,
      humidity: 0,
      pressure: 1000,
      timestamp: 0,
    };

    const decoded = decodeMeasurement(encodeMeasurementBytes(measurement));

    expect(decoded.temperature).toBeCloseTo(measurement.temperature);
    expect(decoded.humidity).toBeCloseTo(measurement.humidity);
    expect(decoded.pressure).toBeCloseTo(measurement.pressure);
    expect(decoded.timestamp).toBe(measurement.timestamp);
  });
});

describe('useBleMeasurement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnDidUpdateValueForCharacteristic.mockReturnValue({ remove: jest.fn() });
    mockRead.mockResolvedValue(encodeMeasurementBytes(sampleMeasurement));
    mockStartNotification.mockResolvedValue(undefined);
  });

  it('clears measurement state when no device is connected', async () => {
    const { result, unmount } = await renderUseBleMeasurement(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(mockRead).not.toHaveBeenCalled();
    expect(mockStartNotification).not.toHaveBeenCalled();
    expect(mockOnDidUpdateValueForCharacteristic).not.toHaveBeenCalled();

    await unmount();
  });

  it('reads the initial characteristic and starts notifications when connected', async () => {
    const { result, unmount } = await renderUseBleMeasurement(connectedDevice);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockRead).toHaveBeenCalledWith(
      connectedDevice.id,
      BLE_SERVICE_UUID,
      MEASUREMENT_CHAR_UUID,
    );
    expect(mockStartNotification).toHaveBeenCalledWith(
      connectedDevice.id,
      BLE_SERVICE_UUID,
      MEASUREMENT_CHAR_UUID,
    );
    expect(result.current.data).toEqual({
      temperature: expect.closeTo(sampleMeasurement.temperature),
      humidity: expect.closeTo(sampleMeasurement.humidity),
      pressure: expect.closeTo(sampleMeasurement.pressure),
      createdAt: new Date(sampleMeasurement.timestamp * 1000).toISOString(),
      receivedAt: expect.any(Number),
    });

    await unmount();
  });

  it('clears measurement data when the characteristic payload is too short', async () => {
    // Measurement payloads require 12 bytes; 11 bytes must be rejected.
    const tooShortPayload = Array.from({ length: 11 }, () => 0);
    mockRead.mockResolvedValue(tooShortPayload);

    const { result, unmount } = await renderUseBleMeasurement(connectedDevice);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    await unmount();
  });

  it('updates measurement data from matching characteristic notifications', async () => {
    const { result, unmount } = await renderUseBleMeasurement(connectedDevice);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const nextMeasurement = {
      temperature: 18.25,
      humidity: 55,
      pressure: 1008.5,
      timestamp: 1712349999,
    };
    const listener = mockOnDidUpdateValueForCharacteristic.mock.calls[0][0];

    await act(async () => {
      listener({
        value: encodeMeasurementBytes(nextMeasurement),
        peripheral: connectedDevice.id,
        service: BLE_SERVICE_UUID.toLowerCase(),
        characteristic: MEASUREMENT_CHAR_UUID.toUpperCase(),
      });
    });

    expect(result.current.data).toEqual({
      temperature: expect.closeTo(nextMeasurement.temperature),
      humidity: expect.closeTo(nextMeasurement.humidity),
      pressure: expect.closeTo(nextMeasurement.pressure),
      createdAt: new Date(nextMeasurement.timestamp * 1000).toISOString(),
      receivedAt: expect.any(Number),
    });

    await unmount();
  });

  it('ignores notifications that do not match the connected measurement characteristic', async () => {
    const { result, unmount } = await renderUseBleMeasurement(connectedDevice);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialData = result.current.data;
    const listener = mockOnDidUpdateValueForCharacteristic.mock.calls[0][0];

    await act(async () => {
      listener({
        value: encodeMeasurementBytes({
          temperature: 1,
          humidity: 2,
          pressure: 3,
          timestamp: 4,
        }),
        peripheral: 'other-device',
        service: BLE_SERVICE_UUID,
        characteristic: MEASUREMENT_CHAR_UUID,
      });
    });

    expect(result.current.data).toEqual(initialData);
    await unmount();
  });

  it('unsubscribes from characteristic updates when unmounted', async () => {
    const remove = jest.fn();
    mockOnDidUpdateValueForCharacteristic.mockReturnValue({ remove });

    const { unmount } = await renderUseBleMeasurement(connectedDevice);

    await waitFor(() => {
      expect(mockOnDidUpdateValueForCharacteristic).toHaveBeenCalled();
    });

    await unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('keeps loading false after a monitoring failure', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRead.mockRejectedValue(new Error('read failed'));

    const { result, unmount } = await renderUseBleMeasurement(connectedDevice);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleError).toHaveBeenCalledWith('Monitoring error', expect.any(Error));
    expect(result.current.data).toBeNull();

    consoleError.mockRestore();
    await unmount();
  });
});
