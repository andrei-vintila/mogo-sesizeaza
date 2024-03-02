import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { DEFAULT_ID_SIZE, authUser, sesizare } from '~/server/database/schema'

const idSchema = z.object({ id: z.string().length(DEFAULT_ID_SIZE) })

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, params => idSchema.parse(params))
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
  }).from(sesizare).leftJoin(authUser, eq(sesizare.reporter, authUser.id)).where(eq(sesizare.id, id)))[0]
})
