import { z } from 'zod'
import { SelectSesizareSchema } from '~/server/database/schema'

export const SesizareCardSchema = SelectSesizareSchema.extend({
  reporterName: z.string(),
  votes: z.number(),
  voted: z.boolean(),
})
export type SesizareCard = z.infer<typeof SesizareCardSchema>
