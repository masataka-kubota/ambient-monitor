import { Ionicons } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/hooks/common';

const HeaderBackButton = () => {
  const { canGoBack } = useRouter();
  const { activeThemeColors } = useAppTheme();

  const hasHistory = canGoBack();

  const handlePress = useCallback(() => {
    if (hasHistory) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [hasHistory]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.button,
        {
          backgroundColor: activeThemeColors.mainColor,
          shadowColor: activeThemeColors.shadow,
        },
      ]}
    >
      <Ionicons
        name={hasHistory ? 'arrow-back' : 'close-outline'}
        size={24}
        color={activeThemeColors.mainBackground}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 5,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
});

export default memo(HeaderBackButton);
