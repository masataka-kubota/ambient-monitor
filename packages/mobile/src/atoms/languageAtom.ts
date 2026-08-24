import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

import type { LanguageCode } from '@/types';

const storage = createJSONStorage<LanguageCode | null>(() => AsyncStorage);

/**
 * User-selected UI language code, or `null` when unset (device / fallback apply).
 *
 * Storage key: `languageCode`. Default `null`. Loaded from AsyncStorage on init
 * (`getOnInit: true`). Written by language settings / `useI18nInitializer`; read
 * when resolving the active i18n locale.
 */
export const languageAtom = atomWithStorage<LanguageCode | null>('languageCode', null, storage, {
  getOnInit: true, // Does not use default value, instead gets value from storage on init.
});
