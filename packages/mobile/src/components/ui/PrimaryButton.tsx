import { memo, useCallback } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/hooks/common';
import { triggerLightHaptics } from '@/utils';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isPending?: boolean;
  backgroundColor?: ViewStyle['backgroundColor'];
  style?: StyleProp<ViewStyle>;
}

const PrimaryButton = ({
  title,
  onPress,
  disabled,
  isPending,
  backgroundColor,
  style,
}: PrimaryButtonProps) => {
  const { activeThemeColors } = useAppTheme();

  const handlePress = useCallback(() => {
    triggerLightHaptics();
    onPress();
  }, [onPress]);

  const buttonColor = backgroundColor
    ? backgroundColor
    : activeThemeColors.tint;

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.button,
        (disabled || isPending) && styles.disabledButton,
        {
          backgroundColor: buttonColor,
          shadowColor: activeThemeColors.shadow,
        },
        style,
      ]}
      disabled={disabled || isPending}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: activeThemeColors.onTint,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: 'center',
    minWidth: '70%',
    // shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.3,
  },
});

export default memo(PrimaryButton);
