import { testClient } from 'hono/testing'

import { describe, it, expect } from 'vitest'

import rootApp from '@/rootApp'

describe('GET /', () => {
  // Create the test client from the app instance
  const client = testClient(rootApp)

  it('should return 200 response', async () => {
    const res = await client.index.$get()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({ message: 'Hello Hono!' })
  })
})
