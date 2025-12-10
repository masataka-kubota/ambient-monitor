import AsyncStorage from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { LanguageCode } from "@/types";

const storage = createJSONStorage<LanguageCode | null>(() => AsyncStorage);

export const languageAtom = atomWithStorage<LanguageCode | null>(
  "language-code",
  null,
  storage,
  { getOnInit: true },
);
