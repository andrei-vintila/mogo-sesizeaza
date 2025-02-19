import { InsertLabelSchema, labels } from '@@/server/database/schema'
import { z } from 'zod'
// we create a zod schema that is an object that contains an array of InsertLabelSchema
const createLabelSchema = z.object({
  labels: z.array(InsertLabelSchema).min(1),
})
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const db = useDrizzle()
  const bodyLabels = await readValidatedBody(event, createLabelSchema.parse)
  // add userId to each label
  const dbLabels = bodyLabels.labels.map(label => ({ ...label, userId: user.id }))
  // upsert user label
  try {
    const returnedData = await db
      .insert(labels)
      .values(dbLabels)
      .returning({ id: labels.id, name: labels.name })
    setResponseStatus(event, 202)
    return returnedData.length > 0 ? returnedData : returnedData[0]
  }
  catch (e) {
    throw createError({
      statusCode: 500,
      message: 'Failed to upsert user settings',
      cause: e,
    })
  }
})
