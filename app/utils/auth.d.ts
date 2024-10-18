// auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    fullName?: string
    profilePictureUrl?: string
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {}
