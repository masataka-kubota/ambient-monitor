import { describe, it, expect } from 'vitest'

import app from '@/index'

describe('GET /', () => {
  it('should return 200 response', async () => {
    const res = await app.request('/')

    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data).toEqual({ message: 'Hello Hono!' })
  })
})
