export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const lucia = event.context.lucia
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
  deleteCookie(event, lucia.sessionCookieName)

  return sendRedirect(event, '/login')
})
