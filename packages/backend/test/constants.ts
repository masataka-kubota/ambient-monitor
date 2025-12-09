export const TEST_DEVICE = {
  externalId: 'test-device-001',
  secret: 'testsecret',
  isActive: true,
}

export const TEST_ENV = {
  EXPO_API_TOKEN: 'expo-api-token-for-test',
}

export const SEED_MEASUREMENTS = [
  // 2 hours ago
  { temperature: 24.9, humidity: 28.9, pressure: 1024.3, minutesAgo: 120 },
  { temperature: 24.8, humidity: 29.0, pressure: 1024.2, minutesAgo: 60 },
  { temperature: 24.7, humidity: 29.1, pressure: 1024.2, minutesAgo: 30 },
  { temperature: 24.6, humidity: 29.2, pressure: 1024.1, minutesAgo: 10 },

  // 1 day ago
  { temperature: 23.1, humidity: 40.0, pressure: 1023.0, minutesAgo: 24 * 60 },

  // 3 days ago
  { temperature: 22.5, humidity: 41.0, pressure: 1022.0, minutesAgo: 3 * 24 * 60 },

  // 7 days ago
  { temperature: 21.0, humidity: 42.0, pressure: 1021.0, minutesAgo: 7 * 24 * 60 },

  // 14 days ago
  { temperature: 20.0, humidity: 43.0, pressure: 1020.0, minutesAgo: 14 * 24 * 60 },

  // 30 days ago
  { temperature: 19.0, humidity: 44.0, pressure: 1019.0, minutesAgo: 30 * 24 * 60 },
]
