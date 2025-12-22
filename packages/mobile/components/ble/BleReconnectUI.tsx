import { MaterialIcons } from "@expo/vector-icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Peripheral } from "react-native-ble-manager";

import { PrimaryButton, ThemeText } from "@/components/ui";
import { useResolvedTheme } from "@/hooks/common";

interface BleReconnectUIProps {
  connectedDevice: Peripheral;
  onReconnect: (deviceId: string) => Promise<void>;
  onDisconnect: (deviceId: string) => Promise<void>;
}

const BleReconnectUI = ({
  connectedDevice,
  onReconnect,
  onDisconnect,
}: BleReconnectUIProps) => {
  const { currentThemeColors } = useResolvedTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <MaterialIcons
          name="sync-problem"
          size={48}
          color={currentThemeColors.mainColor}
        />

        <ThemeText style={styles.title}>
          {t("ble.reconnect.title", { deviceName: connectedDevice.name })}
        </ThemeText>

        <ThemeText style={styles.description}>
          {t("ble.reconnect.description")}
        </ThemeText>
      </View>

      {/* Reconnect button */}
      <PrimaryButton
        title={t("ble.reconnect.reconnectButton")}
        onPress={() => onReconnect(connectedDevice.id)}
      />

      {/* Disconnect button */}
      <PrimaryButton
        title={t("ble.reconnect.disconnectButton")}
        onPress={() => onDisconnect(connectedDevice.id)}
        backgroundColor={currentThemeColors.error}
        style={styles.disconnectButton}
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
  disconnectButton: {
    marginTop: 0,
  },
});

export default memo(BleReconnectUI);
