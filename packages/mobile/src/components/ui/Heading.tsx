import Entypo from '@react-native-vector-icons/entypo/static';
import type { EntypoIconName } from '@react-native-vector-icons/entypo/static';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import type { MaterialIconsIconName } from '@react-native-vector-icons/material-icons/static';
import { memo, useCallback } from 'react';
import type { TextProps, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import ThemeText from '@/components/ui/ThemeText';
import { useAppTheme } from '@/hooks/common';

const ICON_LIBS = {
  Entypo,
  MaterialIcons,
} as const;

interface IconNameMap {
  Entypo: EntypoIconName;
  MaterialIcons: MaterialIconsIconName;
}

type IconLib = keyof typeof ICON_LIBS;

export type HeadingIconProp = {
  [K in IconLib]: { iconLib: K; iconName: IconNameMap[K] };
}[IconLib];

interface HeadingProps extends TextProps {
  mt?: ViewStyle['marginTop'];
  fontSize?: number;
  align?: 'flex-start' | 'center' | 'flex-end';
  icon?: HeadingIconProp;
}

const Heading = ({
  mt = 20,
  fontSize = 20,
  icon,
  align = 'flex-start',
  style,
  ...props
}: HeadingProps) => {
  const { activeThemeColors } = useAppTheme();

  const renderIcon = useCallback(() => {
    if (icon == null) {
      return null;
    }

    const Icon = ICON_LIBS[icon.iconLib];
    return (
      <Icon
        name={icon.iconName as never}
        size={fontSize * 1.5}
        color={activeThemeColors.mainColor}
        style={{ marginRight: fontSize * 0.5 }}
      />
    );
  }, [icon, fontSize, activeThemeColors]);

  return (
    <View style={[styles.headingContainer, { marginTop: mt, justifyContent: align }]}>
      {renderIcon()}
      <ThemeText
        style={[styles.heading, { fontSize, lineHeight: fontSize * 1.5 }, style]}
        {...props}
      >
        {props.children}
      </ThemeText>
    </View>
  );
};

const styles = StyleSheet.create({
  headingContainer: {
    flexDirection: 'row',
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default memo(Heading);
