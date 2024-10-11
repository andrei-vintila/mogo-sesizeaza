import process from 'node:process'
import { generateCodeVerifier, generateState } from 'arctic'
import { consola } from 'consola'
import { z } from 'zod'

const googleUrlQueryParams = z.object({
  forcePrompt: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = await getValidatedQuery(event, googleUrlQueryParams.parse)

  if (event.context.user && !query.forcePrompt)
    return sendRedirect(event, '/')

  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const url = await googleAuth(event).createAuthorizationURL(state, codeVerifier, {
    scopes: [
      'openid',
      'email',
      'profile',
      // In case you need to access the user's calendar
      // "https://www.googleapis.com/auth/calendar.events",
      // "https://www.googleapis.com/auth/calendar",
    ],
  })
  // In case you need to get a refresh token
  // url.searchParams.append("access_type", "offline");

  // This will force the user to consent that will in turn get you a refresh token
  // if (query.forcePrompt) {
  //   url.searchParams.append("prompt", "consent");
  // }
  setCookie(event, 'google_state', state, {
    httpOnly: true,
    secure: !process.dev,
    path: '/',
    maxAge: 60 * 10,
  })
  setCookie(event, 'google_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: !process.dev,
    path: '/',
    maxAge: 60 * 10,
  })
  consola.withTag('auth').info('redirecting to google', url.toString())
  return sendRedirect(event, url.toString())
})
