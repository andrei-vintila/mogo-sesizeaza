import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { DEFAULT_ID_SIZE, sesizareVotes } from '@@/server/database/schema'

const idSchema = z.object({ sesizareId: z.string().length(DEFAULT_ID_SIZE) })
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { sesizareId } = await getValidatedRouterParams(event, params => idSchema.parse(params))
  if (!event.context.user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }
  const db = useDrizzle()
  const vote = await db.query.sesizareVotes.findFirst({
    where: and(eq(sesizareVotes.sesizareId, sesizareId), eq(sesizareVotes.voterId, event.context.user.id)),
  })
  if (vote) {
    await db.delete(sesizareVotes).where(and(eq(sesizareVotes.sesizareId, sesizareId), eq(sesizareVotes.voterId, event.context.user.id)))
    setResponseStatus(event, 204, 'Vote deleted')
  }
  else {
    await db.insert(sesizareVotes).values({
      sesizareId,
      voterId: event.context.user.id,
    })
  }
})
