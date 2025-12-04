import { Entypo } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, TextProps, View, ViewStyle } from "react-native";

import ThemeText from "@/components/ui/ThemeText";
import { useResolvedTheme } from "@/hooks/common";

interface HeadingProps extends TextProps {
  mt?: ViewStyle["marginTop"];
  fontSize?: number;
  iconName?: keyof typeof Entypo.glyphMap;
  align?: "flex-start" | "center" | "flex-end";
}

const Heading = ({
  mt = 20,
  fontSize = 20,
  iconName,
  align = "flex-start",
  style,
  ...props
}: HeadingProps) => {
  const { currentThemeColors } = useResolvedTheme();

  return (
    <View
      style={[
        styles.headingContainer,
        { marginTop: mt, justifyContent: align },
      ]}
    >
      {iconName && (
        <Entypo
          name={iconName}
          size={fontSize * 1.5}
          color={currentThemeColors.mainColor}
          style={{ marginRight: fontSize * 0.5 }}
        />
      )}
      <ThemeText
        style={[
          styles.heading,
          { fontSize, lineHeight: fontSize * 1.5 },
          style,
        ]}
        {...props}
      >
        {props.children}
      </ThemeText>
    </View>
  );
};

const styles = StyleSheet.create({
  headingContainer: {
    flexDirection: "row",
  },
  heading: {
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default memo(Heading);
