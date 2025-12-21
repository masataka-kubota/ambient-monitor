import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderBackButton from "@/components/navigation/HeaderBackButton";
import { ThemeText } from "@/components/ui";

interface HeaderNavigationProps {
  title: string;
  showBackButton?: boolean;
}

const HeaderNavigation = ({
  title,
  showBackButton = true,
}: HeaderNavigationProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { marginTop: insets.top }]}>
      {showBackButton && <HeaderBackButton />}

      <ThemeText style={styles.title}>{title}</ThemeText>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    width: "100%",
    height: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default memo(HeaderNavigation);
