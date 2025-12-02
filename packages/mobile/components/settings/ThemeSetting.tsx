import { useAtom } from "jotai";
import { memo, useCallback } from "react";

import { themeModeAtom } from "@/atoms";
import { RadioGroup } from "@/components/ui";
import { THEME_OPTIONS } from "@/constants";

const ThemeSetting = () => {
  const [themeMode, setThemeMode] = useAtom(themeModeAtom);

  const selectedId =
    THEME_OPTIONS.find((opt) => opt.value === themeMode)?.id ?? 1;

  const handlePress = useCallback(
    (id: number) => {
      const selected = THEME_OPTIONS.find((opt) => opt.id === id);
      if (selected) setThemeMode(selected.value);
    },
    [setThemeMode],
  );

  return (
    <RadioGroup
      data={THEME_OPTIONS}
      selectedId={selectedId}
      onPress={handlePress}
    />
  );
};

export default memo(ThemeSetting);
