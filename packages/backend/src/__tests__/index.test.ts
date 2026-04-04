import app from '@/index'

describe('App root', () => {
  it('returns 404 JSON for unknown paths', async () => {
    const res = await app.request('/__does_not_exist__')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ success: false, message: 'Not Found' })
  })

  it('returns 404 JSON for root when expected', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ success: false, message: 'Not Found' })
  })
})
