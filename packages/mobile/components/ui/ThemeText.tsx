import { memo } from "react";
import { StyleSheet, Text, TextProps } from "react-native";

import { useResolvedTheme } from "@/hooks/common";

interface ThemeTextProps extends TextProps {
  children: React.ReactNode;
}

const ThemeText = ({ children, style, ...props }: ThemeTextProps) => {
  const { currentThemeColors } = useResolvedTheme();

  return (
    <Text
      style={[styles.text, { color: currentThemeColors.mainColor }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 21,
  },
});

export default memo(ThemeText);
