import { count, eq } from 'drizzle-orm'
import { z } from 'zod'
import { DEFAULT_ID_SIZE, authUser, sesizare, sesizareVotes } from '~/server/database/schema'

const idSchema = z.object({ sesizareId: z.string().length(DEFAULT_ID_SIZE) })
export default defineEventHandler(async (event) => {
  const { sesizareId } = await getValidatedRouterParams(event, params => idSchema.parse(params))

  const db = event.context.db

  return (await db.select({
    id: sesizare.id,
    title: sesizare.title,
    description: sesizare.description,
    latitude: sesizare.latitude,
    longitude: sesizare.longitude,
    status: sesizare.status,
    reporter: sesizare.reporter,
    reporterName: authUser.fullName,
    createdAt: sesizare.createdAt,
    updatedAt: sesizare.updatedAt,
    votes: count(sesizareVotes.voterId),
    voted: count(sesizareVotes.voterId, eq(sesizareVotes.voterId, event.context.user.id)),
  })
    .from(sesizare)
    .leftJoin(authUser, eq(sesizare.reporter, authUser.id))
    .leftJoin(sesizareVotes, eq(sesizare.id, sesizareVotes.sesizareId))
    .where(eq(sesizare.id, sesizareId)))[0]
})
