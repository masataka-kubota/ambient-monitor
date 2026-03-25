import { MaterialIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Peripheral } from 'react-native-ble-manager';

import { PrimaryButton, ThemeText } from '@/components/ui';
import { useAppTheme } from '@/hooks/common';

interface BleConnectedUIProps {
  connectedDevice: Peripheral;
  onDisconnect: (deviceId: string) => Promise<void>;
}

const BleConnectedUI = ({
  connectedDevice,
  onDisconnect,
}: BleConnectedUIProps) => {
  const { activeThemeColors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <MaterialIcons
          name="bluetooth-connected"
          size={48}
          color={activeThemeColors.mainColor}
        />

        <ThemeText style={styles.title}>
          {t('ble.connected.title', { deviceName: connectedDevice.name })}
        </ThemeText>

        <ThemeText>{t('ble.connected.description')}</ThemeText>
      </View>

      {/* Disconnect button */}
      <PrimaryButton
        title={t('ble.connected.disconnectButton')}
        onPress={() => onDisconnect(connectedDevice.id)}
        backgroundColor={activeThemeColors.error}
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
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default memo(BleConnectedUI);
