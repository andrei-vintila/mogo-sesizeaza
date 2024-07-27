import { verifyRequestOrigin } from 'oslo/request'
import type { User } from 'lucia'
import { useLucia } from '../utils/lucia-auth'

let lucia: ReturnType<typeof useLucia>

export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') {
    const originHeader = getHeader(event, 'Origin') ?? null
    const hostHeader = getHeader(event, 'Host') ?? null
    if (
      !originHeader
      || !hostHeader
      || !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return event.node.res.writeHead(403).end()
    }
  }
  // Initialize auth (Lucia)

  if (!lucia)
    lucia = useLucia()

  event.context.lucia = lucia

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null
  if (!sessionId) {
    event.context.user = null
    event.context.session = null
    return
  }

  const { session, user } = await lucia.validateSession(sessionId)
  if (session && session.fresh) {
    appendResponseHeader(
      event,
      'Set-Cookie',
      lucia.createSessionCookie(session.id).serialize(),
    )
  }
  if (!session) {
    appendResponseHeader(
      event,
      'Set-Cookie',
      lucia.createBlankSessionCookie().serialize(),
    )
  }
  event.context.session = session
  event.context.user = user
})

declare module 'h3' {
  interface H3EventContext {
    user: User | null
    lucia: ReturnType<typeof useLucia>
  }
}
