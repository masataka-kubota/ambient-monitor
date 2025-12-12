import { memo } from "react";
import { StyleSheet, Text, TextProps } from "react-native";

import { useResolvedTheme } from "@/hooks/common";

interface ThemeTextProps extends TextProps {
  children: React.ReactNode;
  truncate?: boolean;
}

const ThemeText = ({
  children,
  truncate = false,
  style,
  ...props
}: ThemeTextProps) => {
  const { currentThemeColors } = useResolvedTheme();

  return (
    <Text
      style={[
        styles.text,
        { color: currentThemeColors.mainColor },
        truncate && { flexShrink: 1 },
        style,
      ]}
      numberOfLines={truncate ? 1 : undefined}
      ellipsizeMode={truncate ? "tail" : undefined}
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
