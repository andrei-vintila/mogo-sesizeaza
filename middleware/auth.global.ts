import type { User } from 'lucia'

export default defineNuxtRouteMiddleware(async () => {
  const { user } = useUser()
  const { data, error } = await useFetch('/api/auth/user')
  if (error.value) throw createError('Failed to fetch data')
  user.value = (data.value?.user ?? null) as User | null
})
