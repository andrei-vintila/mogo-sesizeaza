import { eq } from 'drizzle-orm'
import { InsertLabelSchema, labels } from '~/server/database/schema'

const createLabelSchema = InsertLabelSchema.array().min(1)
export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
    })
  }
  const db = event.context.db
  const userId = event.context.user.id
  const bodyLabels = await readValidatedBody(event, createLabelSchema.parse)
  // add userId to each label
  const dbLabels = bodyLabels.map(label => ({ ...label, userId }))
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
    })
  }
})
