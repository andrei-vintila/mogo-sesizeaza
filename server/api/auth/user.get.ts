export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return {
    user: event.context.user ?? null,
  }
})
