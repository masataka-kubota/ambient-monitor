import AsyncStorage from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { ThemeMode } from "@/types";

const storage = createJSONStorage<ThemeMode>(() => AsyncStorage);

export const themeModeAtom = atomWithStorage<ThemeMode>(
  "themeMode",
  "system",
  storage,
  { getOnInit: true }, // Does not use default value, instead gets value from storage on init.
);
