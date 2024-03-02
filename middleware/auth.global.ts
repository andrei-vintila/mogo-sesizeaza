import type { User } from 'lucia'

export default defineNuxtRouteMiddleware(async () => {
  const { user } = useUser()
  const { user: authUser } = await $fetch('/api/auth/user')
  if (!user)
    throw createError('Failed to fetch data')
  user.value = (authUser ?? null) as User | null
})
