import { Entypo } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import { TabBar } from "@/components/navigation";

const TabLayout = () => {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t("navigation.tabBarLabel.live"),
          tabBarIcon: ({ color, size, focused }) => (
            <Entypo
              size={size * 1.2}
              name={focused ? "thermometer" : "flash"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: t("navigation.tabBarLabel.history"),
          tabBarIcon: ({ color, size, focused }) => (
            <Entypo
              size={size * 1.2}
              name={focused ? "database" : "line-graph"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: t("navigation.tabBarLabel.settings"),
          tabBarIcon: ({ color, size, focused }) => (
            <Entypo
              size={size * 1.2}
              name={focused ? "tools" : "cog"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
