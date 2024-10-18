import { labels } from '@@/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const labelId = event.context.params?.id
  if (!labelId) {
    throw createError({
      statusCode: 400,
      message: 'Missing label id',
    })
  }
  const db = useDrizzle()
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
