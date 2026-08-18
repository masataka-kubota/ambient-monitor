/** @jest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import { useAtomValue } from 'jotai';
import type { Peripheral } from 'react-native-ble-manager';

import { connectedDeviceAtom, wifiStatusAtom } from '@/atoms/bleAtom';
import { BLE_SERVICE_UUID, WIFI_STATUS_CHAR_UUID } from '@/constants/ble';
import { bleManager } from '@/lib';
import { createTestWrapper } from '@/test/helpers';

import useBleWifiStatus, { parseWifiStatusData } from './useBleWifiStatus';

jest.mock('@/lib', () => ({
  bleManager: {
    read: jest.fn(),
  },
}));

const mockRead = bleManager.read as jest.Mock;

const connectedDevice = { id: 'device-1' } as Peripheral;

const homeWifiPayload = [3, 0x48, 0x6f, 0x6d, 0x65, 0x2d, 0x57, 0x69, 0x46, 0x69];

/** Helper function to use the hook and get the wifiStatus atom value. */
const useBleWifiStatusUnderTest = () => {
  const hook = useBleWifiStatus();
  const wifiStatus = useAtomValue(wifiStatusAtom);

  return { ...hook, wifiStatus };
};

describe('parseWifiStatusData', () => {
  it('maps a BLE payload to the expected Wi-Fi status shape', () => {
    expect(parseWifiStatusData([1, 0x41, 0x42, 0x43])).toEqual({
      status: 'configured',
      ssid: 'ABC',
    });
  });

  it('falls back to not_configured when the status code is unknown', () => {
    expect(parseWifiStatusData([99, 0x48, 0x6f, 0x6d, 0x65])).toEqual({
      status: 'not_configured',
      ssid: 'Home',
    });
  });

  it('returns an empty SSID when the payload contains only the status byte', () => {
    expect(parseWifiStatusData([3])).toEqual({
      status: 'connected',
      ssid: '',
    });
  });
});

describe('useBleWifiStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null and skips the read when no device is connected', async () => {
    const { result } = renderHook(() => useBleWifiStatusUnderTest(), {
      wrapper: createTestWrapper({ atoms: [[connectedDeviceAtom, null]] }),
    });

    let fetchResult: Awaited<ReturnType<typeof result.current.fetchWifiStatus>>;
    await act(async () => {
      fetchResult = await result.current.fetchWifiStatus();
    });

    expect(fetchResult!).toBeNull();
    expect(mockRead).not.toHaveBeenCalled();
    expect(result.current.wifiStatus).toBeNull();
  });

  it('reads the device status and updates the Wi-Fi atom', async () => {
    mockRead.mockResolvedValue(homeWifiPayload);

    const { result } = renderHook(() => useBleWifiStatusUnderTest(), {
      wrapper: createTestWrapper({ atoms: [[connectedDeviceAtom, connectedDevice]] }),
    });

    let fetchResult: Awaited<ReturnType<typeof result.current.fetchWifiStatus>>;
    await act(async () => {
      fetchResult = await result.current.fetchWifiStatus();
    });

    expect(fetchResult!).toEqual({
      status: 'connected',
      ssid: 'Home-WiFi',
    });
    expect(mockRead).toHaveBeenCalledWith('device-1', BLE_SERVICE_UUID, WIFI_STATUS_CHAR_UUID);
    expect(result.current.wifiStatus).toEqual({
      status: 'connected',
      ssid: 'Home-WiFi',
    });
  });

  it('resets the atom and returns null when the BLE read fails', async () => {
    mockRead.mockRejectedValue(new Error('read failed'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useBleWifiStatusUnderTest(), {
      wrapper: createTestWrapper({ atoms: [[connectedDeviceAtom, connectedDevice]] }),
    });

    let fetchResult: Awaited<ReturnType<typeof result.current.fetchWifiStatus>>;
    await act(async () => {
      fetchResult = await result.current.fetchWifiStatus();
    });

    expect(fetchResult!).toBeNull();
    expect(result.current.wifiStatus).toBeNull();
    consoleError.mockRestore();
  });
});
