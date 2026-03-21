// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,

  // ignores
  {
    ignores: [
      ,
      'dist/*',
      'node_modules/*',
      'ios/*',
      'android/*',
      '/.expo/*',
      'expo-env.d.ts',
    ],
  },

  // Prettier rules
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
        },
      ],
    },
  },

  // eslint-plugin-import rules
  {
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
          warnOnUnassignedImports: true,
        },
      ],
    },
  },
]);
