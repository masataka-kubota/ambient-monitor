import type { ConfigContext, ExpoConfig } from 'expo/config';

import pkg from './package.json';

type AppVariant = 'development' | 'preview' | 'production';

interface VariantConfig {
  appName: string;
  bundleIdentifier: string;
}

const VARIANT_CONFIGS: Record<AppVariant, VariantConfig> = {
  development: {
    appName: '(Dev) Ambient Monitor',
    bundleIdentifier: 'dev.ambientmonitor.dev',
  },
  preview: {
    appName: '(Preview) Ambient Monitor',
    bundleIdentifier: 'dev.ambientmonitor.preview',
  },
  production: {
    appName: 'Ambient Monitor',
    bundleIdentifier: 'dev.ambientmonitor',
  },
};

/** Resolve the app configuration for the current environment variant. */
export const getVariantConfig = (): VariantConfig => {
  const variant = process.env.APP_VARIANT;
  const isAppVariant = (v: string): v is AppVariant =>
    Object.prototype.hasOwnProperty.call(VARIANT_CONFIGS, v);
  return variant && isAppVariant(variant) ? VARIANT_CONFIGS[variant] : VARIANT_CONFIGS.production;
};

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
