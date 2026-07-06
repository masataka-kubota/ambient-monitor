import type { ConfigContext, ExpoConfig } from 'expo/config';

import pkg from './package.json';
import { getVariantConfig } from './src/config/appVariant';

const variantConfig = getVariantConfig();

const config = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: variantConfig.appName,
  slug: 'ambient-monitor',
  version: pkg.version,
  orientation: 'portrait',
  icon: './assets/icons/icon.png',
  scheme: 'ambientmonitor',
  userInterfaceStyle: 'automatic',

  ios: {
    supportsTablet: true,
    bundleIdentifier: variantConfig.bundleIdentifier,
    icon: {
      light: './assets/icons/ios-icon-light.png',
      dark: './assets/icons/ios-icon-dark.png',
      tinted: './assets/icons/ios-icon-tinted.png',
    },
  },

  android: {
    adaptiveIcon: {
      backgroundColor: '#f5f5f5',
      foregroundImage: './assets/icons/adaptive-icon.png',
      monochromeImage: './assets/icons/adaptive-icon-monochrome.png',
    },
    package: variantConfig.bundleIdentifier,
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: 'pan',
  },

  web: {
    output: 'static',
    favicon: './assets/icons/favicon.png',
  },

  plugins: [
    'expo-router',
    'expo-localization',
    'expo-font',
    'expo-web-browser',
    [
      'expo-splash-screen',
      {
        image: './assets/icons/splash-icon-light.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#f5f5f5',
        dark: {
          image: './assets/icons/splash-icon-dark.png',
          backgroundColor: '#2f2f2f',
        },
      },
    ],
    [
      'react-native-ble-manager',
      {
        neverForLocation: true,
        isBleRequired: true,
        bluetoothAlwaysPermission: `Allow ${variantConfig.appName} to connect to bluetooth devices`,
      },
    ],
    '@react-native-vector-icons/entypo',
    '@react-native-vector-icons/material-icons',
    '@react-native-vector-icons/ionicons',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: '63d51112-694b-4f62-9e80-5cf42bc2dbc4',
    },
  },
});

export default config;
