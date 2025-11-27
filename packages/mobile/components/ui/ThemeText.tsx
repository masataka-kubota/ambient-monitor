import { Text, TextProps } from "react-native";

import { useResolvedTheme } from "@/hooks/common";

interface ThemeTextProps extends TextProps {
  children: React.ReactNode;
}

const ThemeText = ({ children, style, ...props }: ThemeTextProps) => {
  const { currentThemeColors } = useResolvedTheme();

  return (
    <Text style={[{ color: currentThemeColors.mainColor }, style]} {...props}>
      {children}
    </Text>
  );
};

export default ThemeText;
