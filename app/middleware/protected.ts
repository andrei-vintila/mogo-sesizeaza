export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUser()
  if (!loggedIn)
    return navigateTo('/login')
})
