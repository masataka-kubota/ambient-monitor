import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AppProviders } from "@/components/layouts";
import { APP_THEME_SCHEME } from "@/constants";
import { useResolvedTheme } from "@/hooks/common";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { isDarkMode } = useResolvedTheme();

  // Prevent initial theme flicker
  // by keeping the splash screen visible until the first render completes.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProviders>
      <ThemeProvider
        value={
          isDarkMode
            ? APP_THEME_SCHEME.darkTheme
            : APP_THEME_SCHEME.defaultTheme
        }
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
      </ThemeProvider>
    </AppProviders>
  );
};

export default RootLayout;
