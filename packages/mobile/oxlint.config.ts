import { defineConfig } from 'oxlint';
import native from 'oxlint-config-universe/native';

export default defineConfig({
  extends: [native],
  plugins: ['jest'],
  jsPlugins: ['@tanstack/eslint-plugin-query'],
  rules: {
    'eslint/no-unused-vars': 'error',
    'eslint/curly': 'warn',

    // TypeScript rules
    'typescript/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'typescript/no-explicit-any': 'warn',

    // --- React rules ---
    'react/exhaustive-deps': 'error',
    'react/rules-of-hooks': 'error',
    'react/jsx-key': 'error',
    'react/no-array-index-key': 'warn',
    'react/jsx-curly-brace-presence': 'warn',

    // --- TanStack Query rules ---
    '@tanstack/query/exhaustive-deps': 'error',
    '@tanstack/query/no-rest-destructuring': 'error',
    '@tanstack/query/stable-query-client': 'error',
    '@tanstack/query/no-unstable-deps': 'error',
    '@tanstack/query/infinite-query-property-order': 'error',
    '@tanstack/query/no-void-query-fn': 'error',
    '@tanstack/query/mutation-property-order': 'error',
    '@tanstack/query/prefer-query-options': 'error',

    // --- Jest rules ---
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error',
  },
  ignorePatterns: ['android/**', 'ios/**', '.expo/**', 'coverage/**', 'node_modules/**', 'dist/**'],
});
