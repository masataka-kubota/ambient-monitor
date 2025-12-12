import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AppProviders } from "@/components/layouts";
import { APP_THEME_SCHEME } from "@/constants";
import { useI18nInitializer, useResolvedTheme } from "@/hooks/common";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { isDarkMode } = useResolvedTheme();
  const { isI18nReady } = useI18nInitializer();

  // Prevent initial theme flicker
  // by keeping the splash screen visible until the first render completes.
  useEffect(() => {
    if (isI18nReady) {
      SplashScreen.hideAsync();
    }
  }, [isI18nReady]);

  if (!isI18nReady) {
    return null;
  }

  return (
    <AppProviders>
      <ThemeProvider
        value={
          isDarkMode
            ? APP_THEME_SCHEME.darkTheme
            : APP_THEME_SCHEME.defaultTheme
        }
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
      </ThemeProvider>
    </AppProviders>
  );
};

export default RootLayout;
