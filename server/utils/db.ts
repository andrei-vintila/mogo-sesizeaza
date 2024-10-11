import * as schema from '@@/server/database/schema'

import { drizzle } from 'drizzle-orm/d1'

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema, logger: true })
}

declare module 'h3' {
  interface H3EventContext {
    db: ReturnType<typeof useDrizzle>
  }
}
