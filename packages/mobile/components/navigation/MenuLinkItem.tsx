import { MaterialIcons } from "@expo/vector-icons";
import { Link, LinkProps } from "expo-router";
import { memo, useCallback } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import ThemeText from "@/components/ui/ThemeText";
import { useResolvedTheme } from "@/hooks/common";
import { triggerLightHaptics } from "@/utils";

interface MenuLinkProps {
  title: string;
  textStyle?: StyleProp<TextStyle>;
  itemColor?: TextStyle["color"];
  iconName?: keyof typeof MaterialIcons.glyphMap;
  infoText?: string;
}

interface MenuLinkWithHrefProps extends MenuLinkProps {
  href: LinkProps["href"];
  onPress?: never;
  linkStyle?: StyleProp<TextStyle>;
  buttonStyle?: never;
}

interface MenuLinkWithOnPressProps extends MenuLinkProps {
  href?: never;
  onPress: LinkProps["onPress"];
  linkStyle?: never;
  buttonStyle?: StyleProp<ViewStyle>;
}

type CombinedMenuLinkItemProps =
  | MenuLinkWithHrefProps
  | MenuLinkWithOnPressProps;

const MenuLinkItem = ({
  title,
  linkStyle,
  buttonStyle,
  textStyle,
  itemColor,
  iconName = "keyboard-arrow-right",
  infoText,
  href,
  onPress,
}: CombinedMenuLinkItemProps) => {
  const { currentThemeColors } = useResolvedTheme();

  const handlePress = useCallback(
    (event: GestureResponderEvent | React.MouseEvent<HTMLAnchorElement>) => {
      triggerLightHaptics();
      onPress?.(event);
    },
    [onPress],
  );

  const content = (
    <>
      <ThemeText
        style={[
          textStyle,
          { color: itemColor ?? currentThemeColors.mainColor },
        ]}
        truncate
      >
        {title}
      </ThemeText>

      {/* right content */}
      <View style={styles.rightContent}>
        {infoText && (
          <ThemeText style={styles.infoText} truncate>
            {infoText}
          </ThemeText>
        )}
        <MaterialIcons
          name={iconName}
          size={16}
          color={currentThemeColors.mainColor}
        />
      </View>
    </>
  );

  return href ? (
    <Link href={href} asChild style={[styles.button, linkStyle]}>
      <Pressable onPress={handlePress}>{content}</Pressable>
    </Link>
  ) : (
    <Pressable style={[styles.button, buttonStyle]} onPress={handlePress}>
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 5,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  infoText: {
    opacity: 0.5,
    marginRight: 8,
    maxWidth: 80,
  },
});

export default memo(MenuLinkItem);
