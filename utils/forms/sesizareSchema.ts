import { StatusEnumSchema } from '~~/server/database/schema'
import { z } from 'zod'

export const sesizareFormSchema = z.object({
  id: z.string(),
  title: z.string().min(3, 'Trebuie sa aiba cel putin 3 caractere'),
  description: z.string().optional(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  status: StatusEnumSchema.optional(),
  media: z.array(z.instanceof(File)).optional(),
  labels: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
})

export type SesizareFormSchema = z.infer<typeof sesizareFormSchema>
