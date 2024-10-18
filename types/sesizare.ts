import { SelectSesizareSchema } from '@@/server/database/schema'
import { z } from 'zod'

export const SesizareCardSchema = SelectSesizareSchema.extend({
  reporterName: z.string(),
  votes: z.number(),
  voted: z.boolean(),
  labels: z.array(z.object({ id: z.string(), name: z.string() })),
})
export type SesizareCard = z.infer<typeof SesizareCardSchema>
