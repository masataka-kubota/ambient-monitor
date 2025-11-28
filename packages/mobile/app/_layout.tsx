import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Providers } from "@/components/layouts";
import { APP_THEME_SCHEME } from "@/constants";
import { useResolvedTheme } from "@/hooks/common";

const RootLayout = () => {
  const { isDarkMode } = useResolvedTheme();

  return (
    <Providers>
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
    </Providers>
  );
};

export default RootLayout;
