import { hc } from 'hono/client'

import type { AppType } from '@/index'

/**
 * Typed Hono RPC client for this API (`AppType` already applied).
 *
 * Prefer {@link hcWithType} over calling `hc` with `AppType` yourself so route types
 * stay in sync with the Worker app after `build:types`.
 */
export type Client = ReturnType<typeof hc<AppType>>

/**
 * Create a typed Hono RPC client for this API.
 *
 * Same arguments as `hc` from `hono/client`, but the return type is pre-bound to
 * {@link Client}. The emitted JS only imports `hono/client` (no Worker/server deps),
 * so mobile Metro can consume this entry safely.
 *
 * @param args - Same parameters as `hc` (base URL, then optional `ClientRequestOptions`)
 * @returns A {@link Client} scoped to this backend's routes
 */
export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<AppType>(...args)
