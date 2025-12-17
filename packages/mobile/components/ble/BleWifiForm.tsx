import { useForm } from "@tanstack/react-form";
import { useAtomValue } from "jotai";
import { memo, useCallback } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { wifiStatusAtom } from "@/atoms";
import { PrimaryButton, PrimaryTextInput } from "@/components/ui";
import { useBleWifiActions } from "@/hooks/ble";
import { WifiFormValues } from "@/types";

interface BleWifiFormProps {
  loading: boolean;
}

const BleWifiForm = ({ loading }: BleWifiFormProps) => {
  const wifiStatus = useAtomValue(wifiStatusAtom);
  const { initializeWifiConfig, updateWifiConfig } = useBleWifiActions();

  const defaultWifiFormValues: WifiFormValues = {
    ssid: wifiStatus?.ssid || "",
    password: "",
  };

  const form = useForm({
    defaultValues: defaultWifiFormValues,
    onSubmit: async ({ value }) => {
      const status = await updateWifiConfig(value);

      if (!status || status.status !== "connected") {
        Alert.alert("Failed to connect to Wi-Fi");
        return;
      }

      form.reset();
    },
  });

  const handleInitialize = useCallback(async () => {
    const status = await initializeWifiConfig();

    if (!status || status.status !== "not_configured") {
      Alert.alert("Failed to initialize Wi-Fi");
      return;
    }

    form.reset();
  }, [initializeWifiConfig, form]);

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
            placeholder={
              wifiStatus?.status === "connected" ? "Already set" : "Password"
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
            title={isSubmitting ? "Saving..." : "Save Wi-Fi Settings"}
            onPress={form.handleSubmit}
            disabled={
              loading ||
              wifiStatus?.status === "connecting" ||
              !canSubmit ||
              !isDirty
            }
          />
        )}
      </form.Subscribe>

      {/* Initialize Button */}
      {wifiStatus?.status === "connected" && (
        <PrimaryButton
          title="Initialize Wi-Fi"
          onPress={handleInitialize}
          disabled={loading}
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
