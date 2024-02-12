import process from 'node:process'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { createClient as createLibSQLClient } from '@libsql/client/http'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle as drizzleLibSQL } from 'drizzle-orm/libsql'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { join } from 'pathe'
import * as schema from '~/server/database/schema'

export type DbSchema = typeof schema
export * as tables from '~/server/database/schema'

let _db: DrizzleD1Database<DbSchema> | BetterSQLite3Database<DbSchema> | LibSQLDatabase<DbSchema> | null = null

export function useDB(D1?: D1Database) {
  if (!_db) {
    if (process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN) {
      // Turso in production
      _db = drizzleLibSQL(createLibSQLClient({
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_DB_TOKEN,
      }), { schema })
    }
    else if (D1) {
      // d1 in production
      _db = drizzleD1(D1, { schema })
    }
    else if (process.dev) {
      // local sqlite in development
      const sqlite = new Database(join(process.cwd(), './db.sqlite'))
      _db = drizzle(sqlite, { schema, logger: true })
    }
    else {
      throw new Error('No database configured for production')
    }
  }
  return _db
}
