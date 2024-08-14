import { generateId } from 'lucia'
import type { InsertSesizare } from '~/server/database/schema'
import { DEFAULT_ID_SIZE, InsertSesizareSchema, sesizare, sesizareVotes } from '~/server/database/schema'
import { requireUserSession } from '~/server/utils/auth'

const requestBodySchema = InsertSesizareSchema.omit({ id: true, createdAt: true, updatedAt: true, status: true, reporter: true })
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  if (!event.context.user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }
  const db = useDrizzle()
  const sesizareBody = await readValidatedBody(event, requestBodySchema.parse)
  const sesizareRecord: InsertSesizare = {
    ...sesizareBody,
    reporter: event.context.user?.id ?? 'o9m0ob314ksjtbgblsnqxgddr',
    id: generateId(DEFAULT_ID_SIZE),
  }
  const dbTransaction = db.transaction(async (tx) => {
    tx.insert(sesizare).values(sesizareRecord).returning()
    tx.insert(sesizareVotes).values({ sesizareId: sesizareRecord.id, voterId: event.context.user?.id })
  })

  try {
    return await dbTransaction
  }
  catch (error) {
    throw createError({
      message: 'Failed to create sesizare',
      statusCode: 500,
      cause: error,
    })
  }
})
