import app from '@/index'

describe('App root', () => {
  it('returns 404 JSON for unknown paths', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json).toEqual({ success: false, message: 'Not Found' })
  })
})
