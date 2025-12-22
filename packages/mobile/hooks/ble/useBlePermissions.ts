import * as ExpoDevice from "expo-device";
import { useCallback } from "react";
import { Permission, PermissionsAndroid, Platform } from "react-native";

const useBlePermissions = () => {
  const requestBlePermissions = useCallback(async () => {
    if (Platform.OS !== "android") return true;

    const permissions: Permission[] = [];

    const version = ExpoDevice.platformApiLevel ?? -1;

    if (version >= 23 && version <= 30) {
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    } else if (Platform.Version >= 31) {
      permissions.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      );
    }

    if (permissions.length === 0) {
      return true;
    }

    const granted = await PermissionsAndroid.requestMultiple(permissions);
    return Object.values(granted).every(
      (result) => result === PermissionsAndroid.RESULTS.GRANTED,
    );
  }, []);

  return { requestBlePermissions };
};

export default useBlePermissions;
