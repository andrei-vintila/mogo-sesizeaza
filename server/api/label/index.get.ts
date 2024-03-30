import { eq } from 'drizzle-orm'
import { labels } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
    })
  }
  const db = event.context.db
  // fetch user settings from db
  try {
    const labelData = await db.query.labels.findMany({
      columns: { id: true, name: true },
    })
    return labelData
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user labels',
    })
  }
})
