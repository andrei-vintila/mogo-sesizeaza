import { OAuth2RequestError } from 'arctic'

import { authUser, oAuthAccount } from '@/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { generateId } from 'lucia'
import { upsertAuthUser, upsertGithubOAuthAccount } from '~/server/utils/auth'
import { GitHubUser } from '~/types/github'
const db = useDB()._db
export default defineEventHandler(async (event) => {
  if (event.context.user) {
    return sendRedirect(event, '/')
  }
  const storedState = getCookie(event, 'github_oauth_state')
  const query = getQuery(event)
  const state = query.state?.toString()
  const code = query.code?.toString()
  // validate state
  if (!storedState || !state || storedState !== state || !code) {
    return sendError(
      event,
      createError({
        statusCode: 400,
      })
    )
  }
  try {
    const githubTokens = await githubAuth.validateAuthorizationCode(code)
    const githubUser = await $fetch<GitHubUser>('https://api.github.com/user', {
      headers: {
        Authorization: `token ${githubTokens.accessToken}`,
      },
    })
    const existingAccount = await db.query.oAuthAccount.findFirst({
      where: and(
        eq(oAuthAccount.providerUserId, githubUser.id.toString()),
        eq(oAuthAccount.providerId, 'github')
      ),
    })
    const getUser = async () => {
      const githubEmails: [
        {
          email: string;
          verified: boolean;
          primary: boolean;
          visibility: string;
        }
      ] = await $fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${githubTokens.accessToken}`,
        },
      })
      const githubPrimaryEmail = githubEmails.find(
        (email) => email.primary
      )?.email
      if (!githubPrimaryEmail) {
        throw new Error('User email not found')
      }
      const existingUserWithEmail = await db.query.authUser.findFirst({
        columns: { id: true },
        where: eq(authUser.email, githubPrimaryEmail),
      })

      if (existingUserWithEmail) {
        await upsertGithubOAuthAccount({
          userId: existingUserWithEmail.id,
          githubUser,
          githubTokens,
        })
        await db
          .update(authUser)
          .set({ githubUsername: githubUser.login })
          .where(eq(authUser.id, existingUserWithEmail.id))
        return existingUserWithEmail.id
      }
      if (existingAccount) {
        return existingAccount.userId
      }
      const user = await upsertAuthUser({
        id: generateId(25),
        email: githubPrimaryEmail,
        githubUsername: githubUser.login,
        fullName: githubUser.name,
        profilePictureUrl: githubUser.avatar_url,
        updatedAt: new Date(),
      })
      await upsertGithubOAuthAccount({ userId, githubUser, githubTokens })
      return user.id
    }

    const userId = await getUser()
    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    appendResponseHeader(event, 'Set-Cookie', sessionCookie.serialize())

    return sendRedirect(event, '/')
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return sendError(
        event,
        createError({
          statusCode: 400,
        })
      )
    }
    return sendError(
      event,
      createError({
        statusCode: 500,
      })
    )
  }
})
