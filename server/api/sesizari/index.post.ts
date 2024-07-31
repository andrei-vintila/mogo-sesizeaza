import type { InsertSesizare } from '~/server/database/schema'
import { InsertSesizareSchema, sesizare } from '~/server/database/schema'
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
  const db = event.context.db
  const sesizareBody = await readValidatedBody(event, requestBodySchema.parse)
  const sesizareRecord: InsertSesizare = {
    ...sesizareBody,
    reporter: event.context.user?.id ?? 'o9m0ob314ksjtbgblsnqxgddr',
  }
  return await db.insert(sesizare).values(sesizareRecord).returning()
})
