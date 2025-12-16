import { useForm } from "@tanstack/react-form";
import { useAtomValue } from "jotai";
import { memo, useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { connectedDeviceAtom } from "@/atoms";
import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { HeaderNavigation } from "@/components/navigation";
import { PrimaryButton, PrimaryTextInput, ThemeText } from "@/components/ui";
import {
  BLE_SERVICE_UUID,
  WIFI_CONFIG_CHAR_UUID,
  WIFI_STATUS_CHAR_UUID,
} from "@/constants/ble";
import { WifiStatus } from "@/types";
import { base64 } from "@/utils";

const BleWifiSettings = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);

  const [wifiStatus, setWifiStatus] = useState<WifiStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWifiStatus = useCallback(async () => {
    if (!connectedDevice) return;
    setLoading(true);
    try {
      const char = await connectedDevice.readCharacteristicForService(
        BLE_SERVICE_UUID,
        WIFI_STATUS_CHAR_UUID,
      );
      if (!char.value) {
        setWifiStatus(null);
        return;
      }
      const decoded = base64.decode(char.value);
      const parsed: WifiStatus = JSON.parse(decoded);
      setWifiStatus(parsed);
    } catch (e) {
      console.error("Failed to read WiFi status", e);
      setWifiStatus(null);
    } finally {
      setLoading(false);
    }
  }, [connectedDevice]);

  useEffect(() => {
    fetchWifiStatus();
  }, [fetchWifiStatus]);

  const updateWifiStatus = useCallback(async () => {
    if (!connectedDevice) return null;

    try {
      const char = await connectedDevice.readCharacteristicForService(
        BLE_SERVICE_UUID,
        WIFI_STATUS_CHAR_UUID,
      );
      const decoded = char.value ? base64.decode(char.value) : "{}";
      const status: WifiStatus = JSON.parse(decoded);

      setWifiStatus(status);

      return status;
    } catch (e) {
      console.error("Failed to fetch Wi-Fi status", e);
      return null;
    }
  }, [connectedDevice]);

  const form = useForm({
    defaultValues: {
      ssid: wifiStatus?.ssid || "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      if (!connectedDevice) return;

      const json = JSON.stringify(value);
      const base64Payload = base64.encode(json);

      try {
        await connectedDevice.writeCharacteristicWithResponseForService(
          BLE_SERVICE_UUID,
          WIFI_CONFIG_CHAR_UUID,
          base64Payload,
        );

        const status = await updateWifiStatus();

        if (status && status.status === "connected") {
          form.reset();
        }

        if (status?.status === "failed") {
          Alert.alert("Failed to connect to Wi-Fi");
        }
      } catch (e) {
        console.error("Failed to write WiFi config", e);
        Alert.alert("Failed to write WiFi config");
      }
    },
  });

  const renderStatus = () => {
    if (loading) {
      return <ThemeText>Loading...</ThemeText>;
    }

    if (!wifiStatus) {
      return <ThemeText>No WiFi status available</ThemeText>;
    }

    switch (wifiStatus.status) {
      case "not_configured":
        return <ThemeText>Wi-Fi is not configured</ThemeText>;

      case "configured":
        return (
          <ThemeText>
            Configured{wifiStatus.ssid ? ` (${wifiStatus.ssid})` : ""}
          </ThemeText>
        );

      case "connecting":
        return <ThemeText>Connecting to Wi-Fi…</ThemeText>;

      case "connected":
        return (
          <ThemeText>
            Connected{wifiStatus.ssid ? ` to ${wifiStatus.ssid}` : ""}
          </ThemeText>
        );

      case "failed":
        return <ThemeText>Failed to connect to Wi-Fi</ThemeText>;

      default:
        return <ThemeText>Unknown status</ThemeText>;
    }
  };

  return (
    <>
      <HeaderNavigation title="Wifi Settings" />
      <KeyboardAvoidingScrollableView hasHeader={true}>
        {renderStatus()}

        {/* Form */}
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
                label="SSID"
                placeholder="SSID"
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
                label="Password"
                placeholder="Password"
                value={field.state.value}
                secureTextEntry
                onChangeText={field.handleChange}
                errorMessage={field.state.meta.errors[0]}
              />
            )}
          </form.Field>

          {/* Save Button */}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <PrimaryButton
                title={isSubmitting ? "Saving..." : "Save Wi-Fi Settings"}
                onPress={form.handleSubmit}
                disabled={
                  loading || wifiStatus?.status === "connecting" || !canSubmit
                }
              />
            )}
          </form.Subscribe>
        </View>
      </KeyboardAvoidingScrollableView>
    </>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
});

export default memo(BleWifiSettings);
