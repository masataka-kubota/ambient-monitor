import { Children, isValidElement, memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/common';

interface MenuLinkGroupProps {
  children: React.ReactNode;
}

const MenuLinkGroup = ({ children }: MenuLinkGroupProps) => {
  const { activeThemeColors } = useAppTheme();

  const items = Children.toArray(children).filter((child): child is React.ReactElement =>
    isValidElement(child),
  );

  return (
    <View style={[styles.groupContainer, { borderColor: activeThemeColors.lightColor }]}>
      {items.map((child, index) => {
        const isLast = index === items.length - 1;
        const key = child.key ?? `menu-link-group-${index + 1}`;

        return (
          <View
            key={key}
            style={
              !isLast && {
                borderBottomWidth: 1,
                borderColor: activeThemeColors.lightColor,
              }
            }
          >
            {child}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    marginTop: 30,
    marginBottom: 10,
  },
  mt0: {
    marginTop: 0,
  },
  groupContainer: {
    borderWidth: 1,
    borderRadius: 15,
  },
});

export default memo(MenuLinkGroup);
