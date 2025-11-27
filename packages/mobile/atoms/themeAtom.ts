import { atomWithStorage } from "jotai/utils";

import { ThemeMode } from "@/types";

export const themeModeAtom = atomWithStorage<ThemeMode>("themeMode", "system");
