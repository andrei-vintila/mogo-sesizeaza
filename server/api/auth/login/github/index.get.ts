import { generateState } from 'arctic'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  if (event.context.user)
    return sendRedirect(event, '/')

  const state = generateState()
  const url = await githubAuth(event).createAuthorizationURL(state)
  setCookie(event, 'github_oauth_state', state, {
    httpOnly: true,
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 60,
  })
  return sendRedirect(event, url.toString())
})
