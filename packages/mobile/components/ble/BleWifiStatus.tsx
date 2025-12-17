import { MaterialIcons } from "@expo/vector-icons";
import { useAtomValue } from "jotai";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { wifiStatusAtom } from "@/atoms";
import { ThemeText } from "@/components/ui";
import { useResolvedTheme } from "@/hooks/common";
import { WifiStatusCode } from "@/types";

const WIFI_STATUS_UI: Record<
  WifiStatusCode,
  { icon: keyof typeof MaterialIcons.glyphMap }
> = {
  not_configured: { icon: "wifi-off" },
  configured: { icon: "settings" },
  connecting: { icon: "autorenew" },
  connected: { icon: "wifi" },
  failed: { icon: "error-outline" },
};

interface BleWifiStatusProps {
  loading: boolean;
}

const BleWifiStatus = ({ loading }: BleWifiStatusProps) => {
  const wifiStatus = useAtomValue(wifiStatusAtom);
  const { currentThemeColors } = useResolvedTheme();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.statusContainer}>
        <MaterialIcons
          name="hourglass-empty"
          size={48}
          color={currentThemeColors.mainColor}
        />
        <ThemeText>{t("wifi.status.loading")}</ThemeText>
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
        <ThemeText>{t("wifi.status.none")}</ThemeText>
      </View>
    );
  }

  const iconName = WIFI_STATUS_UI[wifiStatus.status].icon;
  const statusKey = `wifi.status.${wifiStatus?.status}` as const;

  return (
    <View style={styles.statusContainer}>
      <MaterialIcons
        name={iconName}
        size={48}
        color={currentThemeColors.mainColor}
      />
      <ThemeText>
        {t(statusKey)}
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
