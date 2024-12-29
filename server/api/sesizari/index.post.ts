import { DEFAULT_ID_SIZE, InsertSesizareSchema, sesizare, sesizareVotes, StatusEnumSchema } from '@@/server/database/schema'
import { generateId } from '@@/utils/random'

const requestBodySchema = InsertSesizareSchema.omit({ createdAt: true, updatedAt: true, status: true, reporter: true })
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const db = useDrizzle()
  const sesizareBody = await readValidatedBody(event, requestBodySchema.parse)

  // Create a new record with the correct types
  const sesizareRecord = {
    id: sesizareBody.id || generateId(DEFAULT_ID_SIZE),
    reporter: user.id ?? 'o9m0ob314ksjtbgblsnqxgddr',
    title: sesizareBody.title,
    description: sesizareBody.description || null,
    latitude: sesizareBody.latitude || 0,
    longitude: sesizareBody.longitude || 0,
    labels: sesizareBody.labels || [],
    status: StatusEnumSchema.parse('new'),
    media: sesizareBody.media && Array.isArray(sesizareBody.media)
      ? sesizareBody.media.filter((item): item is string => typeof item === 'string')
      : null,
  }

  const dbBatch = db.batch([
    db.insert(sesizare).values(sesizareRecord).returning(),
    db.insert(sesizareVotes).values({ sesizareId: sesizareRecord.id, voterId: user.id }),
  ])

  try {
    return await dbBatch
  }
  catch (error) {
    throw createError({
      message: 'Failed to create sesizare',
      statusCode: 500,
      cause: error,
    })
  }
})
