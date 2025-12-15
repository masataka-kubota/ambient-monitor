import { MaterialIcons } from "@expo/vector-icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Device } from "react-native-ble-plx";

import { PrimaryButton, ThemeText } from "@/components/ui";
import { useResolvedTheme } from "@/hooks/common";

interface BleNotConnectedUIProps {
  scannedDevices: Device[];
  onScan: () => void;
  onConnect: (deviceId: string) => void;
}

const BleNotConnectedUI = ({
  scannedDevices,
  onScan,
  onConnect,
}: BleNotConnectedUIProps) => {
  const { currentThemeColors } = useResolvedTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <MaterialIcons
          name={
            scannedDevices.length > 0
              ? "bluetooth-searching"
              : "bluetooth-disabled"
          }
          size={48}
          color={currentThemeColors.mainColor}
        />
        <ThemeText style={styles.title}>
          {t("ble.notConnected.title")}
        </ThemeText>
        <ThemeText>{t("ble.notConnected.description")}</ThemeText>
      </View>

      {/* Scan button */}
      <PrimaryButton
        title={t("ble.notConnected.scanButton")}
        onPress={onScan}
      />

      {/* Device list */}
      <FlatList
        data={scannedDevices}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="devices-other"
              size={40}
              color={currentThemeColors.mainColor}
            />
            <ThemeText style={styles.emptyText}>
              {t("ble.notConnected.emptyList")}
            </ThemeText>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onConnect(item.id)}
            style={[
              styles.itemContainer,
              {
                backgroundColor: currentThemeColors.secondaryBackground,
              },
            ]}
          >
            <View style={styles.itemLeftContainer}>
              <ThemeText style={styles.itemName}>
                {item.name || t("ble.notConnected.unknownDevice")}
              </ThemeText>
              <ThemeText style={styles.itemId} truncate>
                {item.id}
              </ThemeText>
            </View>

            <MaterialIcons
              name="chevron-right"
              size={24}
              color={currentThemeColors.mainColor}
            />
          </Pressable>
        )}
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
  emptyContainer: {
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
  },
  itemContainer: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeftContainer: {
    width: "90%",
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  itemId: {
    fontSize: 12,
  },
});

export default memo(BleNotConnectedUI);
