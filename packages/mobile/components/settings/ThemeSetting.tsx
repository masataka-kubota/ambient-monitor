import { useAtom } from "jotai";
import { memo, useCallback } from "react";

import { themeModeAtom } from "@/atoms";
import { RadioGroup } from "@/components/ui";
import { useThemeOptions } from "@/hooks/settings";

const ThemeSetting = () => {
  const [themeMode, setThemeMode] = useAtom(themeModeAtom);
  const themeOptions = useThemeOptions();

  const selectedId =
    themeOptions.find((opt) => opt.value === themeMode)?.id ?? 1;

  const handlePress = useCallback(
    (id: number) => {
      const selected = themeOptions.find((opt) => opt.id === id);
      if (selected) setThemeMode(selected.value);
    },
    [setThemeMode, themeOptions],
  );

  return (
    <RadioGroup
      data={themeOptions}
      selectedId={selectedId}
      onPress={handlePress}
    />
  );
};

export default memo(ThemeSetting);
