import { and, eq } from 'drizzle-orm'
import { UpsertSesizareSchema, sesizare } from '@@/server/database/schema'

const requestBodySchema = UpsertSesizareSchema.omit({ createdAt: true, updatedAt: true })
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
      message: 'Missing sesizare id',
    })
  }
  const sesizareBody = await readValidatedBody(
    event,
    requestBodySchema.parse,
  )
  const db = useDrizzle()
  // check if user is the reporter
  const reporter = await db.query.sesizare.findFirst({
    where: and(eq(sesizare.id, sesizareId), eq(sesizare.reporter, event.context.user.id)),
  })
  if (!reporter) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
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
