import { DEFAULT_ID_SIZE, InsertSesizareSchema, sesizare, sesizareVotes } from '@@/server/database/schema'
import { generateId } from 'lucia'

const requestBodySchema = InsertSesizareSchema.omit({ createdAt: true, updatedAt: true, status: true, reporter: true })
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const db = useDrizzle()
  const sesizareBody = await readValidatedBody(event, requestBodySchema.parse)
  const sesizareRecord = {
    ...sesizareBody,
    reporter: user.id ?? 'o9m0ob314ksjtbgblsnqxgddr',
    id: sesizareBody.id || generateId(DEFAULT_ID_SIZE),
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
