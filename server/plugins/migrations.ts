import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import type { DbSchema } from '~/server/utils/db'
export default defineNitroPlugin(async () => {

  if (process.dev) {
    migrate(useDB(null) as BetterSQLite3Database<DbSchema>, { migrationsFolder: 'server/database/migrations' })
  }
})