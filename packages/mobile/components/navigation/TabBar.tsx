import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { memo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TabBarItem from "@/components/navigation/TabBarItem";
import { useResolvedTheme } from "@/hooks/common";
import { triggerLightHaptics } from "@/utils";

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { currentThemeColors } = useResolvedTheme();
  const { bottom } = useSafeAreaInsets();

  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const buttonWidth = dimension.width / state.routes.length;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimension({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  const tabPositionX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    };
  });

  return (
    <View
      onLayout={onTabbarLayout}
      style={[
        styles.tabbar,
        {
          bottom: bottom + 10,
          backgroundColor: currentThemeColors.navBackground,
          shadowColor: currentThemeColors.shadow,
        },
      ]}
    >
      {/* indicator */}
      <Animated.View
        style={[
          styles.indicator,
          animatedStyle,
          {
            // backgroundColor: currentThemeColors.mainBackground,
            backgroundColor: currentThemeColors.tint,
            height: dimension.height - 15,
            width: buttonWidth - 20,
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : (options.title ?? route.name);

        const isFocused = state.index === index;

        const baseColor = isFocused ? "#fff" : currentThemeColors.mediumColor;

        const onPress = () => {
          tabPositionX.value = withSpring(index * buttonWidth, {
            stiffness: 1500,
            damping: 100,
          });
          triggerLightHaptics();

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const icon =
          options.tabBarIcon &&
          options.tabBarIcon({
            focused: isFocused,
            color: baseColor,
            size: 24,
          });

        return (
          <TabBarItem
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            color={baseColor}
            label={label}
            icon={icon}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "60%",
    maxWidth: 400,
    marginHorizontal: "auto",
    paddingVertical: 10,
    borderRadius: 40,
    borderCurve: "continuous",
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 3,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  indicator: {
    position: "absolute",
    borderRadius: 30,
    marginHorizontal: 10,
  },
});

export default memo(TabBar);
