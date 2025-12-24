import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { connectedDeviceAtom, wifiStatusAtom } from "@/atoms";
import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { MenuLinkGroup, MenuLinkItem } from "@/components/navigation";
import { LangSetting, ThemeSetting } from "@/components/settings";
import { Heading } from "@/components/ui";

const Settings = () => {
  const { t } = useTranslation();
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const wifiStatus = useAtomValue(wifiStatusAtom);

  return (
    <KeyboardAvoidingScrollableView>
      {/* Theme */}
      <Heading mt={20} iconLib="Entypo" iconName="adjust">
        {t("settings.title.theme")}
      </Heading>
      <ThemeSetting />

      {/* Language */}
      <Heading mt={50} iconLib="Entypo" iconName="globe">
        {t("settings.title.lang")}
      </Heading>
      <LangSetting />

      {/* Bluetooth */}
      <Heading mt={50} iconLib="MaterialIcons" iconName="bluetooth">
        {t("settings.title.ble")}
      </Heading>
      <MenuLinkGroup>
        <MenuLinkItem
          title={t("settings.ble.link")}
          href="/ble-settings"
          infoText={
            connectedDevice
              ? t("settings.ble.status.connected")
              : t("settings.ble.status.disconnected")
          }
        />
        {connectedDevice && (
          <MenuLinkItem
            title={t("settings.wifi.link")}
            href="/ble-wifi-settings"
            infoText={
              wifiStatus?.status === "connected"
                ? t("settings.wifi.status.connected")
                : t("settings.wifi.status.disconnected")
            }
          />
        )}
      </MenuLinkGroup>
    </KeyboardAvoidingScrollableView>
  );
};

export default Settings;
