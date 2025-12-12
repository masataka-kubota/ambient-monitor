import { MaterialIcons } from "@expo/vector-icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Device } from "react-native-ble-plx";

import { PrimaryButton, ThemeText } from "@/components/ui";
import { useResolvedTheme } from "@/hooks/common";

interface BleConnectedUIProps {
  connectedDevice: Device;
  onDisconnect: (device: Device) => Promise<void>;
}

const BleConnectedUI = ({
  connectedDevice,
  onDisconnect,
}: BleConnectedUIProps) => {
  const { currentThemeColors } = useResolvedTheme();
  const { t } = useTranslation();

  if (!connectedDevice) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <MaterialIcons
          name="bluetooth-connected"
          size={48}
          color={currentThemeColors.mainColor}
        />

        <ThemeText style={styles.title}>
          {t("ble.connected.title", { deviceName: connectedDevice.name })}
        </ThemeText>

        <ThemeText>{t("ble.connected.description")}</ThemeText>
      </View>

      {/* Disconnect button */}
      <PrimaryButton
        title={t("ble.connected.disconnectButton")}
        onPress={() => onDisconnect(connectedDevice)}
        backgroundColor={currentThemeColors.error}
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
});

export default memo(BleConnectedUI);
