import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { ThemedText } from "@/app-example/components/themed-text";
import { useResolvedTheme } from "@/hooks/common";

interface PrimaryTextInputProps extends TextInputProps {
  isRequired?: boolean;
  label?: string;
  labelDescription?: string;
  placeholder?: TextInputProps["placeholder"];
  value?: TextInputProps["value"];
  secureTextEntry?: TextInputProps["secureTextEntry"];
  inputMode?: TextInputProps["inputMode"];
  onChangeText?: TextInputProps["onChangeText"];
  errorMessage?: string;
}

const PrimaryTextInput = ({
  isRequired = false,
  label,
  labelDescription,
  placeholder,
  value,
  secureTextEntry = false,
  inputMode = "text",
  onChangeText,
  errorMessage,
}: PrimaryTextInputProps) => {
  const { currentThemeColors } = useResolvedTheme();

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible((prev) => !prev);
  }, []);

  const hasError = !!errorMessage;

  const SecureTextEntryToggle = (
    <>
      {secureTextEntry && (
        <Pressable
          style={styles.visibilityToggle}
          onPress={togglePasswordVisibility}
        >
          <Ionicons
            name={passwordVisible ? "eye-off" : "eye"}
            size={25}
            color={currentThemeColors.lightColor}
          />
        </Pressable>
      )}
    </>
  );

  return (
    <View>
      {/* label */}
      <View style={styles.labelWrapper}>
        <View style={styles.labelContainer}>
          {label && <ThemedText style={styles.label}>{label}</ThemedText>}

          {isRequired && (
            <ThemedText style={[styles.required]}>※ Require</ThemedText>
          )}
        </View>

        {labelDescription && (
          <ThemedText style={styles.description}>{labelDescription}</ThemedText>
        )}
      </View>

      {/* input */}
      <View>
        <TextInput
          placeholder={placeholder}
          value={value ?? ""}
          inputMode={inputMode}
          secureTextEntry={secureTextEntry && !passwordVisible}
          style={[
            styles.input,
            {
              color: currentThemeColors.mainColor,
              backgroundColor: currentThemeColors.secondaryBackground,
            },
            hasError && {
              borderWidth: 0.5,
              borderColor: currentThemeColors.error,
            },
          ]}
          placeholderTextColor={currentThemeColors.lightColor}
          onChangeText={onChangeText}
        />

        {SecureTextEntryToggle}
      </View>
      {hasError && (
        <ThemedText
          style={[styles.errorMessage, { color: currentThemeColors.error }]}
        >
          {errorMessage}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    fontSize: 16,
    width: "100%",
    height: "auto",
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    outlineWidth: 0,
  },
  visibilityToggle: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  errorMessage: {
    marginTop: -20,
    marginBottom: 20,
    marginLeft: 10,
  },
  // label
  labelWrapper: {
    marginLeft: 10,
    marginBottom: 5,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
  },
  required: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 8,
    opacity: 0.7,
  },
  description: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});

export default memo(PrimaryTextInput);
