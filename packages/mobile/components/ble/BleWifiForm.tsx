import { useForm } from "@tanstack/react-form";
import { useAtomValue } from "jotai";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View } from "react-native";

import { wifiStatusAtom } from "@/atoms";
import { PrimaryButton, PrimaryTextInput } from "@/components/ui";
import { useBleWifiActions } from "@/hooks/ble";
import { useResolvedTheme } from "@/hooks/common";
import { WifiFormValues } from "@/types";

const BleWifiForm = () => {
  const wifiStatus = useAtomValue(wifiStatusAtom);
  const { initializeWifiConfig, updateWifiConfig } = useBleWifiActions();
  const { currentThemeColors } = useResolvedTheme();
  const { t } = useTranslation();

  const defaultWifiFormValues: WifiFormValues = {
    ssid: wifiStatus?.ssid || "",
    password: "",
  };

  const form = useForm({
    defaultValues: defaultWifiFormValues,
    onSubmit: async ({ value }) => {
      const status = await updateWifiConfig(value);

      if (!status || status.status !== "connected") {
        Alert.alert(t("wifi.alert.connect_failed"));
        return;
      }

      form.reset();
    },
  });

  const handleInitialize = useCallback(async () => {
    const status = await initializeWifiConfig();

    if (!status || status.status !== "not_configured") {
      Alert.alert(t("wifi.alert.initialize_failed"));
      return;
    }

    form.reset();
  }, [initializeWifiConfig, form, t]);

  return (
    <View style={styles.form}>
      {/* SSID */}
      <form.Field
        name="ssid"
        validators={{
          onChange: ({ value }) =>
            value.trim().length === 0 ? "SSID is required" : undefined,
        }}
      >
        {(field) => (
          <PrimaryTextInput
            isRequired
            label={t("wifi.form.ssid")}
            placeholder={t("wifi.form.ssid")}
            value={field.state.value}
            onChangeText={field.handleChange}
            errorMessage={field.state.meta.errors[0]}
          />
        )}
      </form.Field>

      {/* Password */}
      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) =>
            value.trim().length === 0 ? "Password is required" : undefined,
        }}
      >
        {(field) => (
          <PrimaryTextInput
            isRequired
            label={t("wifi.form.password")}
            placeholder={
              wifiStatus?.status === "connected"
                ? t("wifi.form.password_placeholder_connected")
                : t("wifi.form.password")
            }
            value={field.state.value}
            secureTextEntry
            onChangeText={field.handleChange}
            errorMessage={field.state.meta.errors[0]}
          />
        )}
      </form.Field>

      {/* Save Button */}
      <form.Subscribe
        selector={(state) => [
          state.canSubmit,
          state.isSubmitting,
          state.isDirty,
        ]}
      >
        {([canSubmit, isSubmitting, isDirty]) => (
          <PrimaryButton
            title={isSubmitting ? t("wifi.form.saving") : t("wifi.form.save")}
            onPress={form.handleSubmit}
            disabled={
              wifiStatus?.status === "connecting" || !canSubmit || !isDirty
            }
          />
        )}
      </form.Subscribe>

      {/* Initialize Button */}
      {wifiStatus?.status === "connected" && (
        <PrimaryButton
          title={t("wifi.form.initialize")}
          onPress={handleInitialize}
          backgroundColor={currentThemeColors.error}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
});

export default memo(BleWifiForm);
