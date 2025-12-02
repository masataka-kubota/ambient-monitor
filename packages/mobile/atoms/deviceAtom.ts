import { atom } from "jotai";

import { DEFAULT_DEVICE_ID } from "@/constants";

export const selectedDeviceIdAtom = atom<string>(DEFAULT_DEVICE_ID);
