import { eq } from 'drizzle-orm'
import { UpsertSesizareSchema, sesizare } from '~/server/database/schema'
import { requireUserSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
    })
  }
  const sesizareId = event.context.params?.sesizareId
  if (!sesizareId) {
    throw createError({
      statusCode: 400,
      message: 'Missing person id',
    })
  }
  const sesizareBody = await readValidatedBody(
    event,
    UpsertSesizareSchema.parse,
  )
  const db = useDrizzle()

  try {
    const response = await db.update(sesizare).set(sesizareBody).where(eq(sesizare.id, sesizareId))
    setResponseStatus(event, 200)
    return response
  }
  catch (e) {
    throw createError({
      statusCode: 500,
      message: 'Failed to update sesizare',
      cause: e,
    })
  }
})
