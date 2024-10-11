import type { H3Event } from 'h3'
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle'
import { Facebook, GitHub, Google } from 'arctic'
import { consola } from 'consola'
import { Lucia } from 'lucia'
import * as tables from '../database/schema'
import { useDrizzle } from './db'

export function useLucia() {
  const adapter = new DrizzleSQLiteAdapter(useDrizzle(), tables.session, tables.authUser)
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: !import.meta.dev,
        sameSite: 'lax',
      },
    },
    getSessionAttributes: (data) => {
      return {
        impersonatorId: data.impersonatorId,
      }
    },
    getUserAttributes: (data) => {
      return {
        githubUsername: data.githubUsername,
        email: data.email,
        profilePictureUrl: data.profilePictureUrl,
        fullName: data.fullName,
        role: data.role,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }
    },
  })
}

export function githubAuth(event: H3Event) {
  return new GitHub(
    useRuntimeConfig(event).githubClientId,
    useRuntimeConfig(event).githubClientSecret,
    { redirectURI: `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/login/github/callback` },
  )
}

export function googleAuth(event: H3Event) {
  consola.info(useRuntimeConfig(event))
  return new Google(
    useRuntimeConfig(event).googleClientId,
    useRuntimeConfig(event).googleClientSecret,
    `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/login/google/callback`,
  )
}

export function facebookAuth(event: H3Event) {
  consola.info(useRuntimeConfig(event))
  return new Facebook(
    useRuntimeConfig(event).facebookClientId,
    useRuntimeConfig(event).facebookClientSecret,
    `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/login/facebook/callback`,
  )
}

declare module 'lucia' {
  interface Register {
    Lucia: ReturnType<typeof useLucia>
    DatabaseUserAttributes: DatabaseUserAttributes
    DatabaseSessionAttributes: DatabaseSessionAttributes
  }
}

interface DatabaseUserAttributes {
  email: string
  githubUsername?: string
  profilePictureUrl?: string
  fullName?: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}
interface DatabaseSessionAttributes {
  impersonatorId?: string
}
