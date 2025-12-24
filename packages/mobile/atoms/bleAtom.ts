import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { Peripheral } from "react-native-ble-manager";

import { WifiStatus } from "@/types";

const connectedDeviceId = createJSONStorage<string | null>(() => AsyncStorage);

export const connectedDeviceIdAtom = atomWithStorage<string | null>(
  "connectedDeviceId",
  null,
  connectedDeviceId,
  { getOnInit: true },
);

export const connectedDeviceAtom = atom<Peripheral | null>(null);

export const scannedDevicesAtom = atom<Peripheral[]>([]);

export const wifiStatusAtom = atom<WifiStatus | null>(null);
