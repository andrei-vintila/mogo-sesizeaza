import process from 'node:process'
import { generateState } from 'arctic'
import { githubAuth } from '~/server/utils/lucia-auth'

export default defineEventHandler(async (event) => {
  if (event.context.user)
    return sendRedirect(event, '/')

  const state = generateState()
  const url = await githubAuth(event).createAuthorizationURL(state)
  setCookie(event, 'github_oauth_state', state, {
    httpOnly: true,
    secure: !process.dev,
    path: '/',
    maxAge: 60 * 60,
  })
  return sendRedirect(event, url.toString())
})
