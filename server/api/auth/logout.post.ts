import { eq } from 'drizzle-orm'
import { session } from '@/server/database/schema'

export default defineEventHandler(async (event) => {
  // check if user is authenticated
  if (!event.context.user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }
  const sessionId = getCookie(event, lucia.sessionCookieName)!
  // make sure to invalidate the current session!
  await lucia.invalidateSession(sessionId)
  // delete session cookie
  await useDB().delete(session).where(eq(session.id, sessionId))
  return sendRedirect(event, '/login')
})
