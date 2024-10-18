export default defineNuxtRouteMiddleware(async () => {
  const { $clientPosthog } = useNuxtApp()
  const { user, fetch, loggedIn } = useUser()
  await fetch()
  if (loggedIn && !$clientPosthog?._isIdentified)
    $clientPosthog?.identify(user.value?.id, { email: user.value?.email })
})
