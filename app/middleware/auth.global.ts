export default defineNuxtRouteMiddleware(async () => {
  const { $clientPosthog } = useNuxtApp()
  const { user, loggedIn } = useUser()
  if (loggedIn && !$clientPosthog?._isIdentified)
    $clientPosthog?.identify(user.value?.id, { email: user.value?.email })
})
