import { act, renderHook } from '@testing-library/react-native';
import * as ExpoDevice from 'expo-device';
import type { Permission } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';

import useBlePermissions from './useBlePermissions';

jest.mock('expo-device', () => ({
  platformApiLevel: -1,
}));

const mockExpoDevice = ExpoDevice as { platformApiLevel?: number };

type PermissionResults = Awaited<ReturnType<typeof PermissionsAndroid.requestMultiple>>;

const permissionResults = (results: Partial<Record<Permission, string>>) =>
  results as PermissionResults;

const setAndroidApiLevel = (apiLevel: number | undefined) => {
  jest.replaceProperty(Platform, 'OS', 'android');
  jest.spyOn(Platform, 'Version', 'get').mockReturnValue(apiLevel ?? 31);
  mockExpoDevice.platformApiLevel = apiLevel;
};

const requestBlePermissions = async () => {
  const { result } = await renderHook(() => useBlePermissions());

  return act(() => result.current.requestBlePermissions());
};

describe('useBlePermissions', () => {
  beforeEach(() => {
    mockExpoDevice.platformApiLevel = -1;
    jest.spyOn(PermissionsAndroid, 'requestMultiple');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true immediately on non-Android platforms', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');

    await expect(requestBlePermissions()).resolves.toBe(true);
    expect(PermissionsAndroid.requestMultiple).not.toHaveBeenCalled();
  });

  it('requests ACCESS_FINE_LOCATION for Android API 23 to 30', async () => {
    setAndroidApiLevel(25);
    jest.mocked(PermissionsAndroid.requestMultiple).mockResolvedValue(
      permissionResults({
        [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]: PermissionsAndroid.RESULTS.GRANTED,
      }),
    );

    await expect(requestBlePermissions()).resolves.toBe(true);
    expect(PermissionsAndroid.requestMultiple).toHaveBeenCalledWith([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
  });

  it('requests Bluetooth permissions for Android API 31 and above', async () => {
    setAndroidApiLevel(31);
    jest.mocked(PermissionsAndroid.requestMultiple).mockResolvedValue(
      permissionResults({
        [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]: PermissionsAndroid.RESULTS.GRANTED,
        [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: PermissionsAndroid.RESULTS.GRANTED,
      }),
    );

    await expect(requestBlePermissions()).resolves.toBe(true);
    expect(PermissionsAndroid.requestMultiple).toHaveBeenCalledWith([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
  });

  it('returns true when Android API level is unavailable', async () => {
    setAndroidApiLevel(undefined);

    await expect(requestBlePermissions()).resolves.toBe(true);
    expect(PermissionsAndroid.requestMultiple).not.toHaveBeenCalled();
  });

  it('returns true when Android does not require BLE permissions', async () => {
    setAndroidApiLevel(22);

    await expect(requestBlePermissions()).resolves.toBe(true);
    expect(PermissionsAndroid.requestMultiple).not.toHaveBeenCalled();
  });

  it('returns false when any requested permission is denied', async () => {
    setAndroidApiLevel(31);
    jest.mocked(PermissionsAndroid.requestMultiple).mockResolvedValue(
      permissionResults({
        [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]: PermissionsAndroid.RESULTS.GRANTED,
        [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: PermissionsAndroid.RESULTS.DENIED,
      }),
    );

    await expect(requestBlePermissions()).resolves.toBe(false);
  });
});
