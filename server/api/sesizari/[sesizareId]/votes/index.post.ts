import { DEFAULT_ID_SIZE, sesizareVotes } from '@@/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const idSchema = z.object({ sesizareId: z.string().length(DEFAULT_ID_SIZE) })
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { sesizareId } = await getValidatedRouterParams(event, params => idSchema.parse(params))
  const db = useDrizzle()
  const vote = await db.query.sesizareVotes.findFirst({
    where: and(eq(sesizareVotes.sesizareId, sesizareId), eq(sesizareVotes.voterId, user.id)),
  })
  if (vote) {
    await db.delete(sesizareVotes).where(and(eq(sesizareVotes.sesizareId, sesizareId), eq(sesizareVotes.voterId, user.id)))
    setResponseStatus(event, 204, 'Vote deleted')
  }
  else {
    await db.insert(sesizareVotes).values({
      sesizareId,
      voterId: user.id,
    })
  }
})
