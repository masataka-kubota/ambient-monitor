import { useAtomValue } from "jotai";
import { useColorScheme } from "react-native";

import { themeModeAtom } from "@/atoms";
import { APP_THEME_COLORS } from "@/constants";

const useResolvedTheme = () => {
  const system = useColorScheme() ?? "light";
  const mode = useAtomValue(themeModeAtom);

  const finalScheme = mode === "system" ? system : mode;

  const isDarkMode = finalScheme === "dark";

  const currentThemeColors = APP_THEME_COLORS[finalScheme];

  return { finalScheme, isDarkMode, currentThemeColors };
};

export default useResolvedTheme;
