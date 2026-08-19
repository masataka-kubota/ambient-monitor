import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import { useAtomValue } from 'jotai';
import { Platform } from 'react-native';
import type { Peripheral } from 'react-native-ble-manager';

import { connectedDeviceAtom, connectedDeviceIdAtom, scannedDevicesAtom } from '@/atoms';
import { BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID } from '@/constants/ble';
import { bleManager } from '@/lib';
import { createTestWrapper, type HydratedAtom } from '@/test/helpers';

import useBleConnect, {
  getBleErrorMessage,
  getDeviceData,
  isExpectedBleError,
} from './useBleConnect';

jest.mock('@/lib', () => ({
  bleManager: {
    getDiscoveredPeripherals: jest.fn(),
    connect: jest.fn(),
    retrieveServices: jest.fn(),
    requestMTU: jest.fn(),
    stopScan: jest.fn(),
    isPeripheralConnected: jest.fn(),
    stopNotification: jest.fn(),
    disconnect: jest.fn(),
  },
}));

const mockGetDiscoveredPeripherals = bleManager.getDiscoveredPeripherals as jest.Mock;
const mockConnect = bleManager.connect as jest.Mock;
const mockRetrieveServices = bleManager.retrieveServices as jest.Mock;
const mockRequestMTU = bleManager.requestMTU as jest.Mock;
const mockStopScan = bleManager.stopScan as jest.Mock;
const mockIsPeripheralConnected = bleManager.isPeripheralConnected as jest.Mock;
const mockStopNotification = bleManager.stopNotification as jest.Mock;
const mockDisconnect = bleManager.disconnect as jest.Mock;

const deviceA = { id: 'device-1', name: 'Device A' } as Peripheral;
const deviceB = { id: 'device-2', name: 'Device B' } as Peripheral;

const renderUseBleConnect = (connectedId: string | null, atoms: HydratedAtom[] = []) =>
  renderHook(
    () => {
      const hook = useBleConnect();

      return {
        ...hook,
        connectedId: useAtomValue(connectedDeviceIdAtom),
        connectedDevice: useAtomValue(connectedDeviceAtom),
        scannedDevices: useAtomValue(scannedDevicesAtom),
      };
    },
    {
      wrapper: createTestWrapper({
        atoms: [[connectedDeviceIdAtom, connectedId], ...atoms],
      }),
    },
  );

describe('getDeviceData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the matching discovered peripheral for the provided device id', async () => {
    mockGetDiscoveredPeripherals.mockResolvedValue([deviceA, deviceB]);

    await expect(getDeviceData('device-2')).resolves.toEqual(deviceB);
    expect(mockGetDiscoveredPeripherals).toHaveBeenCalledTimes(1);
  });

  it('returns null without querying peripherals when the device id is empty', async () => {
    await expect(getDeviceData('')).resolves.toBeNull();
    expect(mockGetDiscoveredPeripherals).not.toHaveBeenCalled();
  });

  it('returns null when the device id is not in the discovered list', async () => {
    mockGetDiscoveredPeripherals.mockResolvedValue([deviceA]);

    await expect(getDeviceData('device-9')).resolves.toBeNull();
    expect(mockGetDiscoveredPeripherals).toHaveBeenCalledTimes(1);
  });
});

describe('getBleErrorMessage', () => {
  it('returns the message from an Error instance', () => {
    expect(getBleErrorMessage(new Error('Device disconnected'))).toBe('Device disconnected');
  });

  it('returns a string message property from a plain object', () => {
    expect(getBleErrorMessage({ message: 'Connection timeout' })).toBe('Connection timeout');
  });

  it('falls back to a nested error string when message is not a string', () => {
    expect(getBleErrorMessage({ message: 403, error: 'Permission denied' })).toBe(
      'Permission denied',
    );
  });

  it('returns a nested error string when the object has no message', () => {
    expect(getBleErrorMessage({ error: 'Device disconnected' })).toBe('Device disconnected');
  });

  it('stringifies values that are not error-like objects', () => {
    expect(getBleErrorMessage(null)).toBe('null');
    expect(getBleErrorMessage(42)).toBe('42');
    expect(getBleErrorMessage('scan failed')).toBe('scan failed');
    expect(getBleErrorMessage({ code: 1 })).toBe('[object Object]');
    expect(getBleErrorMessage({ error: { code: 1 } })).toBe('[object Object]');
  });
});

describe('isExpectedBleError', () => {
  it('returns true when the normalized message includes disconnect', () => {
    expect(isExpectedBleError(new Error('Device disconnected'))).toBe(true);
    expect(isExpectedBleError({ error: 'DISCONNECT' })).toBe(true);
  });

  it('returns false when the normalized message is unrelated to disconnect', () => {
    expect(isExpectedBleError(new Error('Permission denied'))).toBe(false);
    expect(isExpectedBleError({ message: 'Connection timeout' })).toBe(false);
  });
});

describe('useBleConnect', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('connects to a device, stores it as active, and removes it from the scanned list', async () => {
    mockGetDiscoveredPeripherals.mockResolvedValue([deviceA, deviceB]);

    const { result } = await renderUseBleConnect(null, [[scannedDevicesAtom, [deviceA, deviceB]]]);

    await act(async () => {
      await result.current.connectToDevice('device-1');
    });

    expect(mockStopScan).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith('device-1');
    expect(mockRetrieveServices).toHaveBeenCalledWith('device-1');
    expect(mockGetDiscoveredPeripherals).toHaveBeenCalledTimes(1);
    expect(result.current.connectedId).toBe('device-1');
    expect(result.current.connectedDevice).toEqual(deviceA);
    expect(result.current.scannedDevices).toEqual([deviceB]);
    expect(result.current.isConnecting).toBe(false);
  });

  it('connects automatically only when the peripheral is not already connected', async () => {
    mockIsPeripheralConnected.mockResolvedValue(false);
    mockGetDiscoveredPeripherals.mockResolvedValue([deviceA]);

    const { result } = await renderUseBleConnect(null);

    await act(async () => {
      await result.current.autoConnectToDevice('device-1');
    });

    expect(mockIsPeripheralConnected).toHaveBeenCalledWith('device-1');
    expect(mockConnect).toHaveBeenCalledWith('device-1');
    expect(mockRetrieveServices).toHaveBeenCalledWith('device-1');
    expect(result.current.connectedDevice).toEqual(deviceA);
  });

  it('requests a larger MTU on Android during connect', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');

    mockGetDiscoveredPeripherals.mockResolvedValue([deviceA]);

    const { result } = await renderUseBleConnect(null);

    await act(async () => {
      await result.current.connectToDevice('device-1');
    });

    expect(mockRequestMTU).toHaveBeenCalledWith('device-1', 100);
    expect(result.current.connectedDevice).toEqual(deviceA);
  });

  it('skips the reconnect flow when a disconnect error is reported as expected', async () => {
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
    mockIsPeripheralConnected.mockRejectedValue(new Error('Device disconnected'));

    const { result } = await renderUseBleConnect(null);

    await act(async () => {
      await result.current.autoConnectToDevice('device-1');
    });

    expect(mockConnect).not.toHaveBeenCalled();
    expect(consoleInfo).toHaveBeenCalledWith(
      '[BLE] expected reconnect failure is dev:',
      'Device disconnected',
    );
    consoleInfo.mockRestore();
  });

  it('does nothing when the device is already connected', async () => {
    mockIsPeripheralConnected.mockResolvedValue(true);

    const { result } = await renderUseBleConnect(null);

    await act(async () => {
      await result.current.autoConnectToDevice('device-1');
    });

    expect(mockConnect).not.toHaveBeenCalled();
    expect(result.current.connectedDevice).toBeNull();
  });

  it('logs unexpected reconnect errors and keeps the app state intact', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockIsPeripheralConnected.mockRejectedValue(new Error('Permission denied'));

    const { result } = await renderUseBleConnect(null);

    await act(async () => {
      await result.current.autoConnectToDevice('device-1');
    });

    expect(consoleError).toHaveBeenCalledWith('[BLE] auto reconnect failed:', expect.any(Error));
    expect(result.current.connectedDevice).toBeNull();
    consoleError.mockRestore();
  });

  it('resets the connection state when the initial connect attempt fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockStopScan.mockRejectedValue(new Error('scan failed'));

    const { result } = await renderUseBleConnect(null);

    await act(async () => {
      await result.current.connectToDevice('device-1');
    });

    expect(result.current.isConnecting).toBe(false);
    expect(consoleError).toHaveBeenCalledWith('Connection failed:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('cleans up the BLE connection state when disconnecting', async () => {
    const { result } = await renderUseBleConnect('device-1', [[connectedDeviceAtom, deviceA]]);

    await act(async () => {
      await result.current.disconnectDevice('device-1');
    });

    expect(mockStopNotification).toHaveBeenCalledWith(
      'device-1',
      BLE_SERVICE_UUID,
      MEASUREMENT_CHAR_UUID,
    );
    expect(mockDisconnect).toHaveBeenCalledWith('device-1');
    expect(result.current.connectedId).toBeNull();
    expect(result.current.connectedDevice).toBeNull();
  });

  it('logs the error and keeps the connection state when disconnect fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockDisconnect.mockRejectedValue(new Error('disconnect failed'));

    const { result } = await renderUseBleConnect('device-1', [[connectedDeviceAtom, deviceA]]);

    await act(async () => {
      await result.current.disconnectDevice('device-1');
    });

    expect(consoleError).toHaveBeenCalledWith('Failed to disconnect: device-1', expect.any(Error));
    expect(result.current.connectedId).toBe('device-1');
    expect(result.current.connectedDevice).toEqual(deviceA);
    consoleError.mockRestore();
  });

  it('forgets the previously connected device without disconnecting it again', async () => {
    const { result } = await renderUseBleConnect('device-1');

    await act(() => {
      result.current.forgetDevice();
    });

    expect(result.current.connectedId).toBeNull();
    expect(mockDisconnect).not.toHaveBeenCalled();
  });
});
