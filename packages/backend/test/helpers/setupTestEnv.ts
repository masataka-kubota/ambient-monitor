import { env } from 'cloudflare:test'
import { TEST_ENV } from 'test/constants'

export const setupTestEnv = () => {
  env.EXPO_API_TOKEN = TEST_ENV.EXPO_API_TOKEN
}
