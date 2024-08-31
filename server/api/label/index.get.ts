export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const db = useDrizzle()
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
      cause: error,
    })
  }
})
