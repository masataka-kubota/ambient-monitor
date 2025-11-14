import { Hono } from 'hono'

import rootApp from '@/rootApp'

const app = new Hono().route('/', rootApp)

export default app
