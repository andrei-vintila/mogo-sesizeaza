import { eq } from 'drizzle-orm'
import { labels } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
    })
  }

  const labelId = event.context.params?.id
  if (!labelId) {
    throw createError({
      statusCode: 400,
      message: 'Missing label id',
    })
  }
  const db = event.context.db
  // upsert user label
  try {
    await db.delete(labels).where(eq(labels.id, labelId))
  }
  catch (e) {
    throw createError({
      statusCode: 500,
      message: 'Failed to delete label',
      cause: e,
    })
  }
})
