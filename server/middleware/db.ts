import { useDrizzle } from '../utils/db'

export default defineEventHandler(async (event) => {
  event.context.db = useDrizzle()
})

declare module 'h3' {
  interface H3EventContext {
    db: ReturnType<typeof useDrizzle>
  }
}
