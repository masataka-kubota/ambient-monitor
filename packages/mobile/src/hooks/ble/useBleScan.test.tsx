import { act, renderHook } from '@testing-library/react-native';
import { useAtomValue } from 'jotai';
import type { Peripheral } from 'react-native-ble-manager';

import { scannedDevicesAtom } from '@/atoms';
import { BLE_DEVICE_NAME, BLE_SERVICE_UUID } from '@/constants/ble';
import { bleManager } from '@/lib';
import { createTestWrapper } from '@/test/helpers';

import useBleScan from './useBleScan';

jest.mock('@/lib', () => ({
  bleManager: {
    onDiscoverPeripheral: jest.fn(),
    onStopScan: jest.fn(),
    scan: jest.fn(),
  },
}));

const mockOnDiscoverPeripheral = bleManager.onDiscoverPeripheral as jest.Mock;
const mockOnStopScan = bleManager.onStopScan as jest.Mock;
const mockScan = bleManager.scan as jest.Mock;

const matchingDevice = {
  id: 'device-1',
  name: `${BLE_DEVICE_NAME}-A`,
} as Peripheral;

const renderUseBleScan = (devices: Peripheral[] = []) =>
  renderHook(
    () => {
      const hook = useBleScan();

      return { ...hook, scannedDevices: useAtomValue(scannedDevicesAtom) };
    },
    {
      wrapper: createTestWrapper({ atoms: [[scannedDevicesAtom, devices]] }),
    },
  );

const discoverPeripheral = async (peripheral: Peripheral) => {
  const onDiscover = mockOnDiscoverPeripheral.mock.calls[0][0];

  await act(() => onDiscover(peripheral));
};

describe('useBleScan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnDiscoverPeripheral.mockReturnValue({ remove: jest.fn() });
    mockOnStopScan.mockReturnValue({ remove: jest.fn() });
  });

  it('subscribes to peripheral discovery and scan-stop events on mount', async () => {
    await renderUseBleScan();

    expect(mockOnDiscoverPeripheral).toHaveBeenCalledTimes(1);
    expect(mockOnStopScan).toHaveBeenCalledTimes(1);
  });

  it('appends a discovered peripheral whose name matches the device prefix', async () => {
    const { result } = await renderUseBleScan();

    await discoverPeripheral(matchingDevice);

    expect(result.current.scannedDevices).toEqual([matchingDevice]);
  });

  it('falls back to the advertised local name when the peripheral name is missing', async () => {
    const { result } = await renderUseBleScan();
    const advertisedDevice = {
      id: 'device-2',
      advertising: { localName: `${BLE_DEVICE_NAME}-B` },
    } as Peripheral;

    await discoverPeripheral(advertisedDevice);

    expect(result.current.scannedDevices).toEqual([advertisedDevice]);
  });

  it('ignores peripherals with no name or advertised local name', async () => {
    const { result } = await renderUseBleScan();

    await discoverPeripheral({ id: 'device-3' } as Peripheral);

    expect(result.current.scannedDevices).toEqual([]);
  });

  it('ignores peripherals that do not match the device name prefix', async () => {
    const { result } = await renderUseBleScan();

    await discoverPeripheral({ id: 'other-1', name: 'Phone' } as Peripheral);

    expect(result.current.scannedDevices).toEqual([]);
  });

  it('does not append a peripheral that is already in the scanned list', async () => {
    const { result } = await renderUseBleScan();

    await discoverPeripheral(matchingDevice);
    await discoverPeripheral({ ...matchingDevice, rssi: -40 } as Peripheral);

    expect(result.current.scannedDevices).toEqual([matchingDevice]);
  });

  it('clears the scanned list and starts a service-filtered scan', async () => {
    const { result } = await renderUseBleScan([matchingDevice]);

    await act(() => result.current.scanForPeripherals());

    expect(result.current.scannedDevices).toEqual([]);
    expect(mockScan).toHaveBeenCalledWith({
      serviceUUIDs: [BLE_SERVICE_UUID],
      seconds: 5,
      allowDuplicates: false,
    });
  });

  it('unsubscribes from BLE scan events when unmounted', async () => {
    const removeDiscover = jest.fn();
    const removeStopScan = jest.fn();
    mockOnDiscoverPeripheral.mockReturnValue({ remove: removeDiscover });
    mockOnStopScan.mockReturnValue({ remove: removeStopScan });

    const { unmount } = await renderUseBleScan();

    await unmount();

    expect(removeDiscover).toHaveBeenCalledTimes(1);
    expect(removeStopScan).toHaveBeenCalledTimes(1);
  });
});
