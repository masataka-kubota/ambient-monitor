import { MaterialIcons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemeText } from "@/components/ui";
import { useResolvedTheme } from "@/hooks/common";

interface IconLabelProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  text: string;
  color?: string;
}

const IconLabel = ({ iconName, text, color }: IconLabelProps) => {
  const { currentThemeColors } = useResolvedTheme();

  const baseColor = color || currentThemeColors.mediumColor;

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <MaterialIcons name={iconName} size={18} color={baseColor} />
      </View>
      <ThemeText style={[styles.text, { color: baseColor }]}>{text}</ThemeText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 14,
  },
});

export default memo(IconLabel);
