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
