import { requireUserSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return {
    user: event.context.user ?? null,
  }
})
