import type { User } from 'lucia'

export function useUser() {
  const user = useState<User | null>('user', () => null)
  const logout = async () => {
    await $fetch('/api/logout', {
      method: 'POST',
      redirect: 'manual',
    })
  }
  return { user, logout }
}

export function useAuthenticatedUser() {
  const user = useUser()
  return computed(() => {
    const userValue = unref(user)
    if (!userValue) {
      throw createError(
        'useAuthenticatedUser() can only be used in protected pages',
      )
    }
    return userValue
  })
}
