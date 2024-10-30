import { authUser, oAuthAccount } from '#auth-layer/server/database/authSchema'
import { generateId } from '#auth-layer/utils/random'
import { integer, real, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const DEFAULT_ID_SIZE: Readonly<number> = 25

// here we can add common columns to all tables
const defaultCreatedUpdatedColumns = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$onUpdate(() => new Date()),
}

export { authUser, oAuthAccount }

const STATUSES = ['new', 'in_progress', 'resolved', 'archived', 'merged'] as const
export const sesizare = sqliteTable('sesizari', {
  id: text('id').primaryKey().$defaultFn(() => generateId(DEFAULT_ID_SIZE)),
  reporter: text('reporter').notNull().references(() => authUser.id),
  title: text('title').notNull(),
  description: text('description'),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  labels: text('labels', { mode: 'json' }).$type<Array<string>>(),
  status: text('status', { enum: STATUSES }).notNull().default('new'),
  // sesizareDate: integer('sesizare_date', { mode: 'timestamp' }).$defaultFn(() => new Date()), // this is for manually saying for how long this has been a problem
  ...defaultCreatedUpdatedColumns,
})

export const StatusEnumSchema = z.enum(STATUSES)
export const InsertSesizareSchema = createInsertSchema(sesizare).extend({ labels: z.array(z.string()) })
export const SelectSesizareSchema = createSelectSchema(sesizare).extend({ labels: z.array(z.string()) })
export const UpsertSesizareSchema = InsertSesizareSchema.required({
  id: true,
})
export type InsertSesizare = z.infer<typeof InsertSesizareSchema>
export type UpsertSesizare = z.infer<typeof UpsertSesizareSchema>
export type SelectSesizare = z.infer<typeof SelectSesizareSchema>

export const sesizareVotes = sqliteTable('sesizare_votes', {
  sesizareId: text('sesizare_id').notNull().references(() => sesizare.id),
  voterId: text('voter_id').notNull().references(() => authUser.id),
  ...defaultCreatedUpdatedColumns,
}, t => ({
  unq: unique().on(t.sesizareId, t.voterId),
}))

export const InsertSesizareVoteSchema = createInsertSchema(sesizareVotes)
export const SelectSesizareVoteSchema = createSelectSchema(sesizareVotes)
export const UpsertSesizareVoteSchema = createInsertSchema(sesizareVotes).required({
  sesizareId: true,
  voterId: true,
})

export const labels = sqliteTable('labels', {
  id: text('id').primaryKey().$defaultFn(() => generateId(DEFAULT_ID_SIZE)),
  name: text('name').notNull().unique(),
  ...defaultCreatedUpdatedColumns,
})

export const InsertLabelSchema = createInsertSchema(labels)
export const SelectLabelSchema = createSelectSchema(labels)
export const UpsertLabelSchema = createInsertSchema(labels).required({
  id: true,
})
