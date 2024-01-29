import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { generateId } from 'lucia'

const defaultIdSize = 25

//here we can add common columns to all tables
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
export const InsertUser = createInsertSchema(authUser)
export const SelectUser = createSelectSchema(authUser)
// upsert needs an id and updatedAt
export const UpsertUser = createInsertSchema(authUser).required({
  updatedAt: true,
  id: true,
})
export type InsertUser = z.infer<typeof InsertUser>;
export type UpsertUser = z.infer<typeof UpsertUser>;
export type SelectUser = z.infer<typeof SelectUser>;

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
    expiresAt: integer('expires_at', { mode: 'timestamp'}).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        name: 'user_provider_id_pk',
        columns: [table.userId, table.providerId],
      }),
    }
  }
)

export const InsertOAuthAccount = createInsertSchema(oAuthAccount)
export const SelectOAuthAccount = createSelectSchema(oAuthAccount)
export const UpsertOAuthAccount = createInsertSchema(oAuthAccount).required({
  providerUserId: true,
})

export type InsertOAuthAccount = z.infer<typeof InsertOAuthAccount>;
export type UpsertOAuthAccount = z.infer<typeof UpsertOAuthAccount>;
export type SelectOAuthAccount = z.infer<typeof SelectOAuthAccount>;
