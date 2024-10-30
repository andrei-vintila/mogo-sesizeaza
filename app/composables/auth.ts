export function useUser() {
  const { user, clear, loggedIn, fetch } = useUserSession()
  const { $clientPosthog } = useNuxtApp()
  const logout = async () => {
    clear()
    // @ts-expect-error something broken in the posthog module
    $clientPosthog?.reset()
    useToast().add({
      icon: 'i-heroicons-check-badge',
      description: 'Logged out successfully',
      title: 'Success',
    })
  }
  return { user, loggedIn, logout, fetch }
}
