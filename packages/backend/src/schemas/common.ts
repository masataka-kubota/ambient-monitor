import { z } from '@hono/zod-openapi'

const SuccessFlag = z.literal(true).openapi({ example: true })
const ErrorFlag = z.literal(false).openapi({ example: false })

// 200, 201 without data
export const SuccessResponseSchema = z.object({
  success: SuccessFlag,
})

// 200, 201 with data
export const SuccessWithDataSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: SuccessFlag,
    data: dataSchema,
  })

// 401 error
export const UnauthorizedErrorSchema = z.object({
  success: ErrorFlag,
  error: z.object({
    message: z.string().openapi({ example: 'Unauthorized error' }),
  }),
})

// 403 error
export const ForbiddenErrorSchema = z.object({
  success: ErrorFlag,
  error: z.object({
    message: z.string().openapi({ example: 'Forbidden error' }),
  }),
})

// 404 error
export const NotFoundErrorSchema = z.object({
  success: ErrorFlag,
  error: z.object({
    resource: z.string().optional().openapi({ example: 'resource' }),
    message: z.string().openapi({ example: 'Not found error' }),
  }),
})

// 422 error
export const ValidationErrorSchema = z.object({
  success: ErrorFlag,
  errors: z.array(
    z.object({
      field: z.string().openapi({ example: 'field' }),
      message: z.string().openapi({ example: 'Validation error' }),
    })
  ),
})

// 500 error
export const InternalServerErrorSchema = z.object({
  success: ErrorFlag,
  error: z.object({
    message: z.string().openapi({ example: 'Internal server error' }),
  }),
})

// Bearer header
export const BearerAuthHeaderSchema = z.object({
  Authorization: z.string().openapi({ example: 'Bearer <EXPO_API_TOKEN>' }),
})
