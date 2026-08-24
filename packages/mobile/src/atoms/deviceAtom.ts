import { atom } from 'jotai';

import { DEFAULT_DEVICE_ID } from '@/constants';

/**
 * Cloud / API device id used for historical and live measurement queries.
 *
 * In-memory only. Defaults to `DEFAULT_DEVICE_ID` until dynamic selection is wired.
 * Read by `useMeasurements` and `useLiveMeasurement`.
 */
export const selectedDeviceIdAtom = atom<string>(DEFAULT_DEVICE_ID);
