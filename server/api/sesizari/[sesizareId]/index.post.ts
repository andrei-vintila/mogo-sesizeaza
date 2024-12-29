import { sesizare, UpsertSesizareSchema } from '@@/server/database/schema'
import { and, eq } from 'drizzle-orm'

const requestBodySchema = UpsertSesizareSchema.omit({ createdAt: true, updatedAt: true })
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

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

  // Ensure media is an array of strings or null
  const media = sesizareBody.media && Array.isArray(sesizareBody.media)
    ? sesizareBody.media.filter((item): item is string => typeof item === 'string')
    : null

  const db = useDrizzle()
  // check if user is the reporter
  const currentSesizare = await db.query.sesizare.findFirst({
    where: and(eq(sesizare.id, sesizareId), eq(sesizare.reporter, user.id)),
  })
  if (!currentSesizare) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Delete removed media files
  if (currentSesizare.media && media) {
    const deletedMedia = currentSesizare.media.filter(url => !media.includes(url))
    for (const url of deletedMedia) {
      try {
        await hubBlob().delete(url)
      }
      catch (error) {
        console.error(`Failed to delete media file ${url}:`, error)
      }
    }
  }

  const updateData = {
    ...sesizareBody,
    media,
  }

  try {
    const response = await db.update(sesizare)
      .set(updateData)
      .where(eq(sesizare.id, sesizareId))
    setResponseStatus(event, 200)
    return response
  }
  catch (e) {
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : 'Failed to update sesizare',
    })
  }
})
