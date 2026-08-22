import AsyncStorage from '@react-native-async-storage/async-storage';
import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import type { Peripheral } from 'react-native-ble-manager';

import type { WifiStatus } from '@/types';

const connectedDeviceId = createJSONStorage<string | null>(() => AsyncStorage);

/**
 * Persisted BLE peripheral id used for auto-reconnect across app launches.
 *
 * Storage key: `connectedDeviceId`. Default `null`. Loaded from AsyncStorage on
 * init (`getOnInit: true`). Written by BLE connect / disconnect flows; read by
 * `useBleAutoReconnect`.
 */
export const connectedDeviceIdAtom = atomWithStorage<string | null>(
  'connectedDeviceId',
  null,
  connectedDeviceId,
  { getOnInit: true }, // Does not use default value, instead gets value from storage on init.
);

/**
 * Currently connected BLE peripheral for this session, or `null` when disconnected.
 *
 * In-memory only (not persisted). Written by connect / disconnect hooks; read by
 * measurement and Wi‑Fi BLE hooks that need an active peripheral.
 */
export const connectedDeviceAtom = atom<Peripheral | null>(null);

/**
 * BLE peripherals discovered during the latest scan.
 *
 * In-memory only. Written by `useBleScan` / connect flows; cleared or filtered
 * when a device is selected for connection.
 */
export const scannedDevicesAtom = atom<Peripheral[]>([]);

/**
 * Latest Wi‑Fi status reported by the connected BLE device, or `null` if unknown.
 *
 * In-memory only. Written by Wi‑Fi status / action hooks after characteristic reads.
 */
export const wifiStatusAtom = atom<WifiStatus | null>(null);
