import * as ExpoDevice from 'expo-device';
import { useCallback } from 'react';
import type { Permission } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Result object returned by the BLE permission hook.
 */
export interface UseBlePermissionsResult {
  /**
   * Requests the Android runtime permissions needed for BLE communication.
   *
   * On Android API 23-30, this checks for ACCESS_FINE_LOCATION. On Android API
   * 31 and above, it requests BLUETOOTH_SCAN and BLUETOOTH_CONNECT.
   *
   * @returns True when the platform is not Android, no permission check is
   * required, or all requested permissions are granted.
   */
  requestBlePermissions: () => Promise<boolean>;
}

/**
 * Exposes the Android BLE permission flow used by the app.
 *
 * The hook resolves the required runtime permission list from the current
 * platform and Android API level before requesting them from the system.
 *
 * @returns Helpers for requesting the BLE permissions required by the active platform.
 *
 * @example
 * const { requestBlePermissions } = useBlePermissions();
 * const granted = await requestBlePermissions();
 */
const useBlePermissions = (): UseBlePermissionsResult => {
  const requestBlePermissions = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const permissions: Permission[] = [];
    const androidApiLevel = ExpoDevice.platformApiLevel;

    if (androidApiLevel == null) {
      return true;
    }

    if (androidApiLevel >= 23 && androidApiLevel <= 30) {
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    } else if (androidApiLevel >= 31) {
      permissions.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      );
    }

    if (permissions.length === 0) {
      return true;
    }

    const granted = await PermissionsAndroid.requestMultiple(permissions);
    return Object.values(granted).every((result) => result === PermissionsAndroid.RESULTS.GRANTED);
  }, []);

  return { requestBlePermissions };
};

export default useBlePermissions;
