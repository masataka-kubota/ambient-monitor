import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { isBleConnectedAtom } from "@/atoms";
import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { MenuLinkGroup, MenuLinkItem } from "@/components/navigation";
import { LangSetting, ThemeSetting } from "@/components/settings";
import { Heading } from "@/components/ui";

const Settings = () => {
  const { t } = useTranslation();
  const isBleConnected = useAtomValue(isBleConnectedAtom);

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
            isBleConnected
              ? t("settings.ble.status.connected")
              : t("settings.ble.status.disconnected")
          }
        />
        {isBleConnected && (
          <MenuLinkItem title="Wifi Settings" href="/ble-wifi-settings" />
        )}
      </MenuLinkGroup>
    </KeyboardAvoidingScrollableView>
  );
};

export default Settings;
