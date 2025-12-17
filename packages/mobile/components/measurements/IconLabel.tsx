import { memo, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { ThemeText } from "@/components/ui";

interface IconLabelProps {
  icon: ReactNode;
  text: string;
  color?: string;
}

const IconLabel = ({ icon, text, color }: IconLabelProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>{icon}</View>
      <ThemeText style={[styles.text, color && { color }]}>{text}</ThemeText>
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
