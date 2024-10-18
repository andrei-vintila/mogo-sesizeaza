import { labels, UpsertLabelSchema } from '@@/server/database/schema'
import { eq } from 'drizzle-orm'

const createLabelBodySchema = UpsertLabelSchema.omit({
  id: true,
})
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const labelId = event.context.params?.id
  if (!labelId) {
    throw createError({
      statusCode: 400,
      message: 'Missing label id',
    })
  }
  const label = await readValidatedBody(event, createLabelBodySchema.parse)
  const db = useDrizzle()
  // upsert user label
  try {
    const returnedData = await db
      .update(labels)
      .set(label)
      .where(eq(labels.id, labelId))
      .returning()
    setResponseStatus(event, 202)
    return returnedData.length > 0 ? returnedData : returnedData[0]
  }
  catch (e) {
    throw createError({
      statusCode: 500,
      message: 'Failed to upsert labels',
      cause: e,
    })
  }
})
