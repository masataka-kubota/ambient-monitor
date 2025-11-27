import { StyleSheet, View } from "react-native";

import { ThemeText } from "@/components/ui";

const Setting = () => {
  return (
    <View style={styles.container}>
      <ThemeText>Setting screen.</ThemeText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Setting;
