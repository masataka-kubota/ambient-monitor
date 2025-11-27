import { StyleSheet, View } from "react-native";

import { ThemeText } from "@/components/ui";

const Index = () => {
  return (
    <View style={styles.container}>
      <ThemeText>Index screen.</ThemeText>
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

export default Index;
