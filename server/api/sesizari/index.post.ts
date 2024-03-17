import type { InsertSesizare } from '~/server/database/schema'
import { InsertSesizareSchema, sesizare } from '~/server/database/schema'

const requestBodySchema = InsertSesizareSchema.omit({ id: true, createdAt: true, updatedAt: true, status: true, reporter: true })
export default defineEventHandler(async (event) => {
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
    reporter: event.context.user?.id ?? 'jt3y4405ny99q2aksmulhtr8b',
  }
  return await db.insert(sesizare).values(sesizareRecord).returning()
})
