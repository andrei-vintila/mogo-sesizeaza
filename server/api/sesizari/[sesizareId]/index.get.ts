import { authUser, DEFAULT_ID_SIZE, sesizare, sesizareVotes } from '@@/server/database/schema'
import { count, eq } from 'drizzle-orm'
import { z } from 'zod'

const idSchema = z.object({ sesizareId: z.string().length(DEFAULT_ID_SIZE) })

export default defineEventHandler(async (event) => {
  const { sesizareId } = await getValidatedRouterParams(event, params => idSchema.parse(params))
  const { user } = await getUserSession(event)
  const db = useDrizzle()
  const result = await db.select({
    id: sesizare.id,
    title: sesizare.title,
    description: sesizare.description,
    labels: sesizare.labels,
    status: sesizare.status,
    createdAt: sesizare.createdAt,
    updatedAt: sesizare.updatedAt,
    reporter: sesizare.reporter,
    longitude: sesizare.longitude,
    latitude: sesizare.latitude,
    reporterName: authUser.fullName ?? '',
    votes: count(sesizareVotes.voterId),
    voted: eq(sesizareVotes.voterId, user?.id || ''),
  })
    .from(sesizare)
    .leftJoin(authUser, eq(sesizare.reporter, authUser.id))
    .leftJoin(sesizareVotes, eq(sesizare.id, sesizareVotes.sesizareId))
    .where(eq(sesizare.id, sesizareId))
  // we anonymize the reporter name by using the initials
  const sesizareResult = result[0]
  if (sesizareResult) {
    sesizareResult.reporterName = getInitials(sesizareResult.reporterName ?? '')
    return sesizareResult
  }
  throw createError({
    statusCode: 404,
    message: 'Sesizare not found',
  })
})
