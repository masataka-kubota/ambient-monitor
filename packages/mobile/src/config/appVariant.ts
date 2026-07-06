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
  if (variant && Object.prototype.hasOwnProperty.call(VARIANT_CONFIGS, variant)) {
    return VARIANT_CONFIGS[variant as AppVariant];
  }
  return VARIANT_CONFIGS.production;
};
