import { Hono } from 'hono'
import { ZodError } from 'zod'

import measurementsApp from '@/routes/measurements'
import rootApp from '@/routes/root'

const app = new Hono()

  .notFound((c) => {
    return c.json({ success: false, message: 'Not Found' }, 404)
  })

  .onError((err, c) => {
    if (err instanceof ZodError) {
      const errors = err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return c.json({ success: false, errors }, 400)
    }

    // class UnauthorizedError extends Error {}
    // class ForbiddenError extends Error {}
    // if (err instanceof UnauthorizedError) {
    //   return c.json({ success: false, message: 'Unauthorized' }, 401)
    // }

    // if (err instanceof ForbiddenError) {
    //   return c.json({ success: false, message: 'Forbidden' }, 403)
    // }

    return c.json({ success: false, message: 'Internal Server Error' }, 500)
  })

  // Routes
  .route('/', rootApp)
  .route('/measurements', measurementsApp)

export default app
