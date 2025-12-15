import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { Device } from "react-native-ble-plx";

const connectedDeviceId = createJSONStorage<string | null>(() => AsyncStorage);

export const connectedDeviceIdAtom = atomWithStorage<string | null>(
  "connectedDeviceId",
  null,
  connectedDeviceId,
  { getOnInit: true },
);

export const connectedDeviceAtom = atom<Device | null>(null);

export const scannedDevicesAtom = atom<Device[]>([]);

export const isBleConnectedAtom = atom<boolean | null>(null);
