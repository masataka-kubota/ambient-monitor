import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

import type { ThemeMode } from '@/types';

const storage = createJSONStorage<ThemeMode>(() => AsyncStorage);

/**
 * User theme preference: `light`, `dark`, or `system`.
 *
 * Storage key: `themeMode`. Default `'system'`. Loaded from AsyncStorage on init
 * (`getOnInit: true`), so the stored value overrides the default when present.
 * Written by theme settings; read by `useAppTheme`.
 */
export const themeModeAtom = atomWithStorage<ThemeMode>(
  'themeMode',
  'system',
  storage,
  { getOnInit: true }, // Does not use default value, instead gets value from storage on init.
);
