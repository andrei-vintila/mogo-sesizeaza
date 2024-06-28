import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../database/schema'

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}
