import { Children, memo } from "react";
import { StyleSheet, View } from "react-native";

import { useResolvedTheme } from "@/hooks/common";

interface MenuLinkGroupProps {
  children: React.ReactNode;
}

const MenuLinkGroup = ({ children }: MenuLinkGroupProps) => {
  const { currentThemeColors } = useResolvedTheme();

  const items = Children.toArray(children);

  return (
    <View
      style={[
        styles.groupContainer,
        { borderColor: currentThemeColors.lightColor },
      ]}
    >
      {items.map((child, index) => {
        const isLast = index === items.length - 1;
        return (
          <View
            key={index}
            style={
              !isLast && {
                borderBottomWidth: 1,
                borderColor: currentThemeColors.lightColor,
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
