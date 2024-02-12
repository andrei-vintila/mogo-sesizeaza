import { useDB } from '../utils/db'

let drizzle: ReturnType<typeof useDB>

export default defineEventHandler(async (event) => {
  const DB: D1Database = event.context.cloudflare?.env.DB

  if (!drizzle)
    drizzle = useDB(DB ?? undefined)

  event.context.db = drizzle
})

declare module 'h3' {
  interface H3EventContext {
    db: ReturnType<typeof useDB>
  }
}
