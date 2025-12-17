import { MaterialIcons } from "@expo/vector-icons";
import { useAtomValue } from "jotai";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { wifiStatusAtom } from "@/atoms";
import { ThemeText } from "@/components/ui";
import { useResolvedTheme } from "@/hooks/common";

const WIFI_STATUS_UI = {
  not_configured: {
    icon: "wifi-off",
    text: "Wi-Fi is not configured",
  },
  configured: {
    icon: "settings",
    text: "Wi-Fi is configured",
  },
  connecting: {
    icon: "autorenew",
    text: "Connecting to Wi-Fi…",
  },
  connected: {
    icon: "wifi",
    text: "Connected",
  },
  failed: {
    icon: "error-outline",
    text: "Failed to connect to Wi-Fi",
  },
} as const;

interface BleWifiStatusProps {
  loading: boolean;
}

const BleWifiStatus = ({ loading }: BleWifiStatusProps) => {
  const wifiStatus = useAtomValue(wifiStatusAtom);
  const { currentThemeColors } = useResolvedTheme();

  if (loading) {
    return (
      <View style={styles.statusContainer}>
        <MaterialIcons
          name="hourglass-empty"
          size={48}
          color={currentThemeColors.mainColor}
        />
        <ThemeText>Loading…</ThemeText>
      </View>
    );
  }

  if (!wifiStatus) {
    return (
      <View style={styles.statusContainer}>
        <MaterialIcons
          name="help-outline"
          size={48}
          color={currentThemeColors.mainColor}
        />
        <ThemeText>No WiFi status available</ThemeText>
      </View>
    );
  }

  const ui = WIFI_STATUS_UI[wifiStatus.status];

  return (
    <View style={styles.statusContainer}>
      <MaterialIcons
        name={ui.icon}
        size={48}
        color={currentThemeColors.mainColor}
      />
      <ThemeText>
        {ui.text}
        {wifiStatus.ssid ? ` (${wifiStatus.ssid})` : ""}
      </ThemeText>
    </View>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    alignItems: "center",
    gap: 8,
    marginVertical: 20,
  },
});

export default memo(BleWifiStatus);
