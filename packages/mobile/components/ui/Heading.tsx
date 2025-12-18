import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TextProps, View, ViewStyle } from "react-native";

import ThemeText from "@/components/ui/ThemeText";
import { useResolvedTheme } from "@/hooks/common";

const ICON_LIBS = {
  Entypo,
  MaterialIcons,
};

type IconLib = keyof typeof ICON_LIBS;

type IconName<T extends IconLib> = keyof (typeof ICON_LIBS)[T]["glyphMap"];

interface HeadingProps<T extends IconLib = "Entypo"> extends TextProps {
  mt?: ViewStyle["marginTop"];
  fontSize?: number;
  iconLib?: T;
  iconName?: IconName<T>;
  align?: "flex-start" | "center" | "flex-end";
}

const Heading = <T extends IconLib = "Entypo">({
  mt = 20,
  fontSize = 20,
  iconLib,
  iconName,
  align = "flex-start",
  style,
  ...props
}: HeadingProps<T>) => {
  const { currentThemeColors } = useResolvedTheme();

  const safeIconLib: IconLib = iconLib ?? "Entypo";
  const Icon = ICON_LIBS[safeIconLib];

  return (
    <View
      style={[
        styles.headingContainer,
        { marginTop: mt, justifyContent: align },
      ]}
    >
      {iconName && (
        <Icon
          name={iconName as IconName<IconLib>}
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

export default Heading;
