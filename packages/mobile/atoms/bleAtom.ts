import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { Device } from "react-native-ble-plx";

const connectedDevice = createJSONStorage<Device | null>(() => AsyncStorage);

export const connectedDeviceAtom = atomWithStorage<Device | null>(
  "connectedDevice",
  null,
  connectedDevice,
  { getOnInit: true },
);

export const scannedDevicesAtom = atom<Device[]>([]);

export const isBleConnectedAtom = atom<boolean | null>(null);
