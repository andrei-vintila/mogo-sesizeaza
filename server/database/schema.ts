import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { generateId } from 'lucia'

const defaultIdSize = 25

// here we can add common columns to all tables
const defaultCreatedUpdatedColumns = {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}

export const authUser = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId(defaultIdSize)),
  email: text('email', { length: 256 }).unique().notNull(),
  githubUsername: text('github_username', { length: 256 }),
  profilePictureUrl: text('profile_picture'),
  fullName: text('full_name'),
  role: text('role', { enum: ['user', 'admin'] }).default('user'),
  ...defaultCreatedUpdatedColumns,
  // other user attributes  role: varchar("role", { length: 32 }).notNull().default("user"),
})
export const InsertUserSchema = createInsertSchema(authUser)
export const SelectUserSchema = createSelectSchema(authUser)
// upsert needs an id and updatedAt
export const UpsertUserSchema = createInsertSchema(authUser).required({
  updatedAt: true,
  id: true,
})
export type InsertUser = z.infer<typeof InsertUserSchema>
export type UpsertUser = z.infer<typeof UpsertUserSchema>
export type SelectUser = z.infer<typeof SelectUserSchema>

export const session = sqliteTable('user_session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => authUser.id),
  expiresAt: integer('expires_at').notNull(),
  impersonatorId: text('impersonator_id').references(() => authUser.id),
})

export const oAuthAccount = sqliteTable(
  'oauth_accounts',
  {
    providerId: text('provider_id').notNull(),
    providerUserId: text('provider_user_id'),
    userId: text('user_id')
      .notNull()
      .references(() => authUser.id),
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: 'user_provider_id_pk',
        columns: [table.userId, table.providerId],
      }),
    }
  },
)

export const InsertOAuthAccountSchema = createInsertSchema(oAuthAccount)
export const SelectOAuthAccountSchema = createSelectSchema(oAuthAccount)
export const UpsertOAuthAccountSchema = createInsertSchema(oAuthAccount).required({
  providerUserId: true,
})

export type InsertOAuthAccount = z.infer<typeof InsertOAuthAccountSchema>
export type UpsertOAuthAccount = z.infer<typeof UpsertOAuthAccountSchema>
export type SelectOAuthAccount = z.infer<typeof SelectOAuthAccountSchema>

export const sesizare = sqliteTable('sesizari', {
  id: text('id').primaryKey().$defaultFn(() => generateId(defaultIdSize)),
  reporter: text('reporter').notNull().references(() => authUser.id),
  title: text('title').notNull(),
  description: text('description'),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  labels: text('labels', { mode: 'json' }).$type<Array<string>>(),
  status: text('status', { enum: ['new', 'in_progress', 'resolved', 'archived', 'merged'] }).default('new'),
  ...defaultCreatedUpdatedColumns,
})

export const InsertSesizareSchema = createInsertSchema(sesizare)
export const SelectSesizareSchema = createSelectSchema(sesizare)
export const UpsertSesizareSchema = createInsertSchema(sesizare).required({
  updatedAt: true,
  id: true,
})
export type InsertSesizare = z.infer<typeof InsertSesizareSchema>
export type UpsertSesizare = z.infer<typeof UpsertSesizareSchema>
export type SelectSesizare = z.infer<typeof SelectSesizareSchema>
