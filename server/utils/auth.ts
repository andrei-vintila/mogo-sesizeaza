import { GitHubTokens, GoogleTokens } from 'arctic'

import { isWithinExpirationDate } from 'oslo'
import { OAuth2RequestError } from 'arctic'
import { and, eq } from 'drizzle-orm'
import { GitHubUser } from '@/types/github'
import { GoogleUser } from '@/types/gapi'
import { UpsertUser, authUser, SelectOAuthAccount, oAuthAccount } from '../database/schema'
import { googleAuth } from './lucia-auth'


const db = useDB()._db

export const upsertGithubOAuthAccount = ({
  userId,
  githubUser,
  githubTokens,
}: {
  userId: string;
  githubUser: GitHubUser;
  githubTokens: GitHubTokens;
}) => {
  return db
    .insert(tables.oAuthAccount)
    .values({
      userId: userId,
      providerId: 'github',
      providerUserId: githubUser.id.toString(),
      accessToken: githubTokens.accessToken,
      refreshToken: 'empty',
      expiresAt: new Date(Date.now() + 60 * 60),
    })
    .onConflictDoUpdate({
      target: [tables.oAuthAccount.userId, tables.oAuthAccount.providerId],
      set: {
        accessToken: githubTokens.accessToken,
      },
    })
}

export const upsertGoogleOAuthAccount = ({
  userId,
  googleUser,
  googleTokens,
}: {
  userId: string;
  googleUser: GoogleUser;
  googleTokens: GoogleTokens;
}) => {
  return db
    .insert(tables.oAuthAccount)
    .values({
      userId: userId,
      providerId: 'google',
      providerUserId: googleUser.sub,
      accessToken: googleTokens.accessToken,
      refreshToken: googleTokens.refreshToken,
      expiresAt: googleTokens.accessTokenExpiresAt,
    })
    .onConflictDoUpdate({
      target: [tables.oAuthAccount.userId, tables.oAuthAccount.providerId],
      set: {
        accessToken: googleTokens.accessToken,
        refreshToken: googleTokens.refreshToken,
        expiresAt: googleTokens.accessTokenExpiresAt,
      },
    })
}

export const upsertAuthUser = async ({
  id,
  email,
  githubUsername,
  profilePictureUrl,
  fullName,
}: UpsertUser) => {
  const [user] = await db
    .insert(tables.authUser)
    .values({ id, email, githubUsername, profilePictureUrl, fullName })
    .onConflictDoUpdate({
      target: authUser.email,
      set: {
        githubUsername: githubUsername || null,
        profilePictureUrl: profilePictureUrl || null,
        fullName: fullName || null,
        updatedAt: new Date(),
      },
    })
    .returning()
  return user
}
export type GoogleToken = {
  accessToken: string;
  accessTokenExpiresAt: Date;
};

type GoogleOAuthTokenByUserId = Pick<SelectOAuthAccount, 'userId'>;
export const getGoogleToken = async ({ userId }: GoogleOAuthTokenByUserId) => {
  const googleTokenData = await db.query.oAuthAccount.findFirst({
    where: and(
      eq(oAuthAccount.userId, userId),
      eq(oAuthAccount.providerId, 'google')
    ),
  })
  if (!googleTokenData) {
    throw createError({
      message: 'Google account not found',
      statusCode: 404,
    })
  }
  // check if access token is expired
  const isExpired = !isWithinExpirationDate(googleTokenData.expiresAt)
  // if expired, refresh access token
  if (isExpired) {
    if (!googleTokenData.refreshToken) {
      throw createError({
        message: 'Google account needs to be reconnected',
        statusCode: 401,
      })
    }
    try {
      const refreshedTokens = await googleAuth.refreshAccessToken(
        googleTokenData.refreshToken
      )
      // update db with new access token
      const [refreshedGoogleTokenData] = await db
        .update(oAuthAccount)
        .set({
          accessToken: refreshedTokens.accessToken,
          expiresAt: refreshedTokens.accessTokenExpiresAt,
        })
        .where(
          and(
            eq(oAuthAccount.userId, userId),
            eq(oAuthAccount.providerId, 'google')
          )
        )
        .returning()

      return {
        accessToken: refreshedGoogleTokenData.accessToken,
        accessTokenExpiresAt: refreshedGoogleTokenData.expiresAt,
      }
    } catch (e) {
      if (e instanceof OAuth2RequestError) {
        // see https://oslo.js.org/reference/oauth2/OAuth2RequestError/
        const { request, message, description } = e
        if (message === 'invalid_grant') {
          await db
            .update(oAuthAccount)
            .set({
              refreshToken: null,
            })
            .where(
              and(
                eq(oAuthAccount.userId, userId),
                eq(oAuthAccount.providerId, 'google')
              )
            )
          throw createError({
            statusCode: 401,
            message: 'Google account needs to be reconnected',
          })
        }
        throw createError({
          statusCode: 400,
          data: request,
          message,
          statusText: description || 'Unknown error',
        })
      }
      // unknown error

      createError({
        statusCode: 500,
      })
    }
  }

  return {
    accessToken: googleTokenData.accessToken,
    accessTokenExpiresAt: googleTokenData.expiresAt,
  }
}
