declare namespace Cloudflare {
  interface Env {
    DB: D1Database
    // This follows the Cloudflare Vitest integration recipe and the workers-sdk D1 example fixture.
    // See: https://developers.cloudflare.com/workers/testing/vitest-integration/recipes/
    // See: https://github.com/cloudflare/workers-sdk/blob/main/fixtures/vitest-pool-workers-examples/d1/test/apply-migrations.ts
    // oxlint-disable-next-line typescript/consistent-type-imports
    TEST_MIGRATIONS: import('cloudflare:test').D1Migration[]
  }
}
