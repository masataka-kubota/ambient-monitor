import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setupAfterEnv.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
  },
  // Bun stores packages under node_modules/.bun; without this exception
  // jest-expo cannot transform @react-native/* ESM setup files.
  // https://docs.expo.dev/develop/unit-testing/#additional-configuration-for-using-transformignorepatterns
  transformIgnorePatterns: [
    'node_modules/(?!(.bun|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx,js,jsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/expo-env.d.ts',
    '!**/.expo/**',
    '!**/test/**',
  ],
};

export default config;
