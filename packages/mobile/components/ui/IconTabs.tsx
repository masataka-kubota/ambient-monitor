import { Entypo } from "@expo/vector-icons";
import { useCallback } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import ThemeText from "@/components/ui/ThemeText";
import { useResolvedTheme } from "@/hooks/common";
import { triggerLightHaptics } from "@/utils";

const _paddingHorizontal = 20;
const _gap = 5;
const _space = (_paddingHorizontal + _gap) * 2;

interface TabItem<T extends string> {
  key: T;
  label: string;
  iconName: keyof typeof Entypo.glyphMap;
}

interface IconTabsProps<T extends string> {
  tabs: TabItem<T>[];
  selectedKey: T;
  onTabPress: (key: T) => void;
}

const IconTabs = <T extends string>({
  tabs,
  selectedKey,
  onTabPress,
}: IconTabsProps<T>) => {
  const { width } = useWindowDimensions();
  const { currentThemeColors } = useResolvedTheme();

  const tabWidth = (width - _space) / tabs.length;

  const handlePress = useCallback(
    (key: T) => {
      triggerLightHaptics();
      onTabPress(key);
    },
    [onTabPress],
  );

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab, i) => {
        const focused = tab.key === selectedKey;
        return (
          <Pressable
            key={tab.label}
            style={[
              styles.tabButton,
              focused && {
                borderBottomWidth: 0.5,
                borderBottomColor: currentThemeColors.mainColor,
              },
              { width: tabWidth },
            ]}
            onPress={() => handlePress(tab.key)}
          >
            <Entypo
              name={tab.iconName}
              size={30}
              color={
                focused
                  ? currentThemeColors.mainColor
                  : currentThemeColors.lightColor
              }
            />
            <ThemeText
              style={[
                { fontSize: 12 },
                !focused && { color: currentThemeColors.lightColor },
              ]}
            >
              {tab.label}
            </ThemeText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    marginBottom: 30,
    gap: _gap,
  },
  tabButton: {
    padding: 6,
    alignItems: "center",
  },
});

export default IconTabs;
