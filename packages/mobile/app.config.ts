import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) return "com.example.ambientmonitor.dev";
  if (IS_PREVIEW) return "com.example.ambientmonitor.preview";
  return "com.example.ambientmonitor";
};

const getAppName = () => {
  if (IS_DEV) return "Ambient Monitor (Dev)";
  if (IS_PREVIEW) return "Ambient Monitor (Preview)";
  return "Ambient Monitor";
};

const config = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "ambient-monitor",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icons/icon.png",
  scheme: "dev.ambientmonitor",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    icon: {
      light: "./assets/icons/ios-icon-light.png",
      dark: "./assets/icons/ios-icon-dark.png",
      tinted: "./assets/icons/ios-icon-tinted.png",
    },
  },

  android: {
    adaptiveIcon: {
      backgroundColor: "#f5f5f5",
      foregroundImage: "./assets/icons/adaptive-icon.png",
      monochromeImage: "./assets/icons/adaptive-icon-monochrome.png",
    },
    package: getUniqueIdentifier(),
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: "pan",
  },

  web: {
    output: "static",
    favicon: "./assets/icons/favicon.png",
  },

  plugins: [
    "expo-router",
    "expo-localization",
    [
      "expo-splash-screen",
      {
        image: "./assets/icons/splash-icon-light.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#f5f5f5",
        dark: {
          image: "./assets/icons/splash-icon-dark.png",
          backgroundColor: "#2f2f2f",
        },
      },
    ],
    [
      "react-native-ble-plx",
      {
        modes: ["central"],
        bluetoothAlwaysPermission:
          "Allow $(getAppName()) to connect to bluetooth devices",
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    eas: {
      projectId: "63d51112-694b-4f62-9e80-5cf42bc2dbc4",
    },
  },
});

export default config;
