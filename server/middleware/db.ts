import { useDB } from '../utils/db'

let drizzle: ReturnType<typeof useDB>

export default defineEventHandler(async (event) => {
  const { DB } = event.context.cloudflare.env

  if (!drizzle) {
    drizzle = useDB(DB)
  }

  event.context.db = drizzle
})

declare module 'h3' {
  interface H3EventContext {
    db: ReturnType<typeof useDB>
  }
}