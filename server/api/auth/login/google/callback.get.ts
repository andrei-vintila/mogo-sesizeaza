import { OAuth2RequestError } from 'arctic'
import { and, eq } from 'drizzle-orm'
import { generateId } from 'lucia'
import { authUser, oAuthAccount } from '@/server/database/schema'
import { upsertAuthUser, upsertGoogleOAuthAccount } from '~/server/utils/auth'
import type { GoogleUser } from '~/types/gapi'
import { googleAuth } from '~/server/utils/lucia-auth'

export default defineEventHandler(async (event) => {
  const lucia = event.context.lucia
  const db = event.context.db
  const query = getQuery(event)
  const forcePrompt = query.prompt === 'consent'
  if (event.context.user && !forcePrompt)
    return sendRedirect(event, '/')

  const codeVerifier = getCookie(event, 'google_code_verifier')
  const stateCookie = getCookie(event, 'google_state')
  const code = query.code?.toString()
  const state = query.state?.toString()
  // validate state
  if (
    !state
    || !stateCookie
    || stateCookie !== state
    || !codeVerifier
    || !code
  ) {
    return sendError(
      event,
      createError({
        statusCode: 400,
      }),
    )
  }
  try {
    const googleTokens = await googleAuth.validateAuthorizationCode(
      code,
      codeVerifier,
    )

    const googleUser = await $fetch<GoogleUser>(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${googleTokens.accessToken}` } },
    )
    const existingAccount = await db.query.oAuthAccount.findFirst({
      where: and(
        eq(oAuthAccount.providerUserId, googleUser.sub),
        eq(oAuthAccount.providerId, 'google'),
      ),
    })
    const getUser = async () => {
      // now we check if the user has an email in his google account to see if we can find an existing user
      if (!googleUser.email_verified || !googleUser.email)
        throw new Error('Email not verified')

      const existingUserWithEmail = await db.query.authUser.findFirst({
        columns: { id: true },
        where: eq(authUser.email, googleUser.email),
      })
      if (existingAccount) {
        await upsertAuthUser(db, {
          id: existingAccount.userId,
          profilePictureUrl: googleUser.picture,
          fullName: googleUser.name,
          email: googleUser.email,
          githubUsername: null,
          updatedAt: new Date(),
        })
        if (forcePrompt) {
          await upsertGoogleOAuthAccount(db, {
            userId: existingAccount.userId,
            googleUser,
            googleTokens,
          })
        }
        return existingAccount.userId
      }
      if (existingUserWithEmail) {
        await upsertGoogleOAuthAccount(db, {
          userId: existingUserWithEmail.id,
          googleUser,
          googleTokens,
        })
        return existingUserWithEmail.id
      }

      const user = await upsertAuthUser(db, {
        id: generateId(25),
        profilePictureUrl: googleUser.picture,
        fullName: googleUser.name,
        email: googleUser.email,
        githubUsername: null,
        updatedAt: new Date(),
      })
      await upsertGoogleOAuthAccount(db, {
        userId: user.id,
        googleUser,
        googleTokens,
      })
      return user.id
    }

    const userId = await getUser()
    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    appendResponseHeader(event, 'Set-Cookie', sessionCookie.serialize())

    return sendRedirect(event, '/')
  }
  catch (e) {
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return sendError(
        event,
        createError({
          statusCode: 400,
        }),
      )
    }
    return sendError(
      event,
      createError({
        statusCode: 500,
      }),
    )
  }
})
