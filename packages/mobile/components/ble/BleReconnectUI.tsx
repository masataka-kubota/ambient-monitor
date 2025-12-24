import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { PrimaryButton, ThemeText } from "@/components/ui";
import { useResolvedTheme } from "@/hooks/common";

interface BleReconnectUIProps {
  forgetDevice: () => void;
}

const BleReconnectUI = ({ forgetDevice }: BleReconnectUIProps) => {
  const { currentThemeColors } = useResolvedTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <MaterialIcons
          name="sync-problem"
          size={48}
          color={currentThemeColors.mainColor}
        />

        <ThemeText style={styles.title}>{t("ble.reconnect.title")}</ThemeText>

        <ThemeText style={styles.description}>
          {t("ble.reconnect.description")}
        </ThemeText>
      </View>

      {/* Back button */}
      <PrimaryButton
        title={t("ble.reconnect.backButton")}
        onPress={() => router.back()}
      />

      {/* Forget button */}
      <PrimaryButton
        title={t("ble.reconnect.forgetButton")}
        onPress={forgetDevice}
        backgroundColor={currentThemeColors.error}
        style={styles.forgetButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    gap: 20,
  },
  headerContainer: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    textAlign: "center",
  },
  forgetButton: {
    marginTop: 0,
  },
});

export default memo(BleReconnectUI);
