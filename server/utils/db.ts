import { drizzle as drizzleD1, DrizzleD1Database } from 'drizzle-orm/d1'
import { createClient as createLibSQLClient } from '@libsql/client/http'
import { drizzle as drizzleLibSQL, LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
// @ts-ignore
import Database from 'better-sqlite3'
import { join } from 'pathe'
import * as schema from '~/server/database/schema'
export type DbSchema = typeof schema
export * as tables from '~/server/database/schema'

let _db: DrizzleD1Database<DbSchema> | BetterSQLite3Database<DbSchema> | LibSQLDatabase<DbSchema> | null = null

export const useDB = () => {
  if (!_db) {
    console.log('Starting DB')
    console.log(process.env)

    if (process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN) {
      // Turso in production
      _db = drizzleLibSQL(createLibSQLClient({
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_DB_TOKEN
      }), {schema})

    } else if (process.env.DB || process.env.DB_BUILD) {
      // d1 in production
      _db = drizzleD1(process.env.DB || process.env.DB_BUILD, {schema})
    } else if (process.dev) {
      // local sqlite in development
      const sqlite = new Database(join(process.cwd(), './db.sqlite'))
      _db = drizzle(sqlite, {schema, logger: true})
    } else {
      let message: string = ''
      for (const key in process.env) {message += key + ' : ' + process.env[key] + '\n'}
      throw new Error('No database configured for production \n'+ message)
    }
    // @ts-ignore

  }
  return _db
}


