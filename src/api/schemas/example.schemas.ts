import z from 'zod'

import { uuidv7Schema } from '@/api/schemas/common.schemas'

// TODO: Replace with your domain entity's actual fields

export const exampleUuidv7Schema = uuidv7Schema

export const createExampleBodySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional()
})

export const updateExampleBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional()
})

export const listExamplesQuerySchema = z.object({
  active: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? val === 'true' : undefined))
})

export type CreateExampleBody = z.infer<typeof createExampleBodySchema>
export type UpdateExampleBody = z.infer<typeof updateExampleBodySchema>
export type ListExamplesQuery = z.infer<typeof listExamplesQuerySchema>
