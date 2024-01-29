import { Lucia } from 'lucia'
import { GitHub, Google } from 'arctic'
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle'
// @ts-ignore
const adapter =  new DrizzleSQLiteAdapter(useDB(), tables.session, tables.authUser)
export const lucia = new Lucia(adapter, {
  sessionCookie: {
      attributes: {
        secure: !process.dev,
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

const runtimeConfig = useRuntimeConfig()

export const githubAuth = new GitHub(
  runtimeConfig.githubClientId,
  runtimeConfig.githubClientSecret,
  { redirectURI: `${runtimeConfig.public.baseUrl}/api/auth/login/github/callback` }
)

export const googleAuth = new Google(
  runtimeConfig.googleClientId,
  runtimeConfig.googleClientSecret,
  `${runtimeConfig.public.baseUrl}/api/auth/login/google/callback`
)


declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string;
  githubUsername?: string;
  profilePictureUrl?: string;
  fullName?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
interface DatabaseSessionAttributes {
  impersonatorId?: string;
}