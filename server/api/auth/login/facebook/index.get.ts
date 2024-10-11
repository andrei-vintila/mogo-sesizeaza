import { generateState } from 'arctic'
import { consola } from 'consola'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  if (event.context.user)
    return sendRedirect(event, '/')

  const state = generateState()
  const url = await facebookAuth(event).createAuthorizationURL(state, {
    scopes: [
      'email',
      'public_profile',
    ],
  })
  setCookie(event, 'facebook_state', state, {
    httpOnly: true,
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 10,
  })
  consola.withTag('auth').info('redirecting to facebook', url.toString())
  return sendRedirect(event, url.toString())
})
