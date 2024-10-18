export function useUser() {
  const { user, clear, loggedIn, fetch } = useUserSession()
  const { $clientPosthog } = useNuxtApp()
  const logout = async () => {
    clear()
    $clientPosthog?.reset()
    useToast().add({
      icon: 'i-heroicons-check-badge',
      description: 'Logged out successfully',
      title: 'Success',
    })
  }
  return { user, loggedIn, logout, fetch }
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
