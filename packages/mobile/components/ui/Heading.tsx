import { memo } from "react";
import { StyleSheet, TextProps, TextStyle } from "react-native";

import ThemeText from "@/components/ui/ThemeText";

interface HeadingProps extends TextProps {
  mt?: TextStyle["marginTop"];
}

const FONT_SIZE = 20;

const Heading = ({ mt = 5, style, ...props }: HeadingProps) => {
  return (
    <ThemeText style={[styles.heading, { marginTop: mt }, style]} {...props}>
      {props.children}
    </ThemeText>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: FONT_SIZE,
    lineHeight: FONT_SIZE * 1.5,
    fontWeight: "bold",
    marginBottom: FONT_SIZE,
  },
});

export default memo(Heading);
