import { Hono } from 'hono'

const rootApp = new Hono().get('/', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

export default rootApp
