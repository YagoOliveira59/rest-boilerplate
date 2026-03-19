import z from 'zod'

/** Validate a UUIDv7 string parameter */
export const uuidv7Schema = z.string().regex(
  /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i,
  'Invalid UUIDv7 format'
)

/** Common pagination query schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export type PaginationQuery = z.infer<typeof paginationSchema>
