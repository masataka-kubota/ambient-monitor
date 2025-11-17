import { z } from '@hono/zod-openapi'

const SuccessFlag = z.literal(true).openapi({ example: true })
const ErrorFlag = z.literal(false).openapi({ example: false })

export const GenericSuccessSchema = z.object({
  success: SuccessFlag,
})

export const GenericDataSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: SuccessFlag,
    data: dataSchema,
  })

export const ValidationErrorSchema = z.object({
  success: ErrorFlag,
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .openapi({
      example: [
        { field: 'temperature', message: 'Required' },
        { field: 'humidity', message: 'Must be a number' },
      ],
    }),
})

export const SingleErrorSchema = z.object({
  success: ErrorFlag,
  error: z
    .object({
      field: z.string(),
      message: z.string(),
    })
    .openapi({ example: { field: 'temperature', message: 'Required' } }),
})
