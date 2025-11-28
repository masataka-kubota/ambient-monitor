import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Global providers wrapper.
 *
 * - Wrap any app-wide providers here (e.g., React Query, SafeArea, GestureHandler, BottomSheet etc.)
 * - Keep RootLayout clean by centralizing all providers in this component.
 *
 * Jotai:
 * - We intentionally do NOT wrap <AppProviders> from Jotai
 *   because we want all atoms to share the global store.
 */
const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
};

export default AppProviders;
