import { OAuth2RequestError } from 'arctic'
import { and, eq } from 'drizzle-orm'
import { generateId } from 'lucia'
import { authUser, oAuthAccount } from '@@/server/database/schema'
import type { FacebookUser } from '@@/types/facebook'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const lucia = event.context.lucia
  const db = useDrizzle()
  const query = getQuery(event)
  if (event.context.user)
    return sendRedirect(event, '/')

  const stateCookie = getCookie(event, 'facebook_state')
  const code = query.code?.toString()
  const state = query.state?.toString()
  // validate state
  if (
    !code || !stateCookie || state !== stateCookie
  ) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        message: 'Invalid request',
      }),
    )
  }
  try {
    const facebookToken = await facebookAuth(event).validateAuthorizationCode(
      code,
    )

    const facebookUser = await $fetch<FacebookUser>(
      'https://graph.facebook.com/me',
      {
        headers: { Authorization: `Bearer ${facebookToken.accessToken}` },
        params: {
          access_token: facebookToken.accessToken,
          fields: 'id,name,email,picture',
        },
      },
    )
    const existingAccount = await db.query.oAuthAccount.findFirst({
      where: and(
        eq(oAuthAccount.providerUserId, facebookUser.id),
        eq(oAuthAccount.providerId, 'facebook'),
      ),
    })
    const getUser = async () => {
      // now we check if the user has an email in his google account to see if we can find an existing user
      if (!facebookUser.email)
        throw new Error('Email not verified or not set')

      const existingUserWithEmail = await db.query.authUser.findFirst({
        columns: { id: true },
        where: eq(authUser.email, facebookUser.email),
      })
      if (existingAccount) {
        await upsertAuthUser(db, {
          id: existingAccount.userId,
          profilePictureUrl: facebookUser.picture.data.url,
          fullName: facebookUser.name,
          email: facebookUser.email,
          githubUsername: null,
          updatedAt: new Date(),
        })
        return existingAccount.userId
      }
      if (existingUserWithEmail) {
        await upsertFacebookOAuthAccount(db, {
          userId: existingUserWithEmail.id,
          facebookUser,
          facebookToken,
        })
        return existingUserWithEmail.id
      }

      const user = await upsertAuthUser(db, {
        id: generateId(25),
        profilePictureUrl: facebookUser.picture.data.url,
        fullName: facebookUser.name,
        email: facebookUser.email,
        githubUsername: null,
        updatedAt: new Date(),
      })
      await upsertFacebookOAuthAccount(db, {
        userId: user.id,
        facebookUser,
        facebookToken,
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
