import { generateState } from 'arctic'

export default defineEventHandler(async (event) => {
  if (event.context.user) {
    return sendRedirect(event, '/')
  }
  const state = generateState()
  const url = await githubAuth.createAuthorizationURL(state)
  setCookie(event, 'github_oauth_state', state, {
    httpOnly: true,
    secure: !process.dev,
    path: '/',
    maxAge: 60 * 60,
  })
  return sendRedirect(event, url.toString())
})
