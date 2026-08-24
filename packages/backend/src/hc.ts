import { hc } from 'hono/client'
export type { InferResponseType, InferRequestType } from 'hono/client'

import type app from '@/index'

/**
 * Typed Hono RPC client for this API (`typeof app` already applied).
 *
 * Prefer this over calling `hc` with `AppType` yourself so route types stay in sync
 * with the Worker app after `build:types`.
 */
export type Client = ReturnType<typeof hc<typeof app>>

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
export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<typeof app>(...args)
