import { z } from 'zod'
import { and, asc, between, count, desc, eq, isNotNull, like, or } from 'drizzle-orm'
import { SelectSesizareSchema, StatusEnumSchema, authUser, sesizare, sesizareVotes } from '~/server/database/schema'

const SelectSesizareCardSchema = SelectSesizareSchema.extend({
  reporterName: z.string(),
  votes: z.number(),
  voted: z.number(),
})
type SelectSesizareCard = z.infer<typeof SelectSesizareCardSchema>
const querySchema = z.object({
  search: z.string().optional(),
  limit: z.number().optional().default(25),
  offset: z.number().optional().default(0),
  labels: z.string().optional(),
  status: StatusEnumSchema.optional(),
  reporter: z.string().optional(),
  sw_lat: z.number().optional().default(44.51327340892296),
  sw_lng: z.number().optional().default(26.019562420223934),
  ne_lat: z.number().optional().default(44.54558060303962),
  ne_lng: z.number().optional().default(25.973814663834826),
  sort: z.enum(['desc', 'asc']).optional().default('desc'),
  sortby: z.enum(['createdAt', 'updatedAt']).optional().default('createdAt'),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db

  const query = await getValidatedQuery(event, query => querySchema.parse(query))

  const result = await db.select(
    {
      ...sesizare,
      reporterName: authUser.fullName,
      votes: count(sesizareVotes.voterId),
      voted: count(sesizareVotes.voterId, eq(sesizareVotes.voterId, event.context.user?.id || '')),
    },
  )
    .from(sesizare)
    .leftJoin(sesizareVotes, eq(sesizare.id, sesizareVotes.sesizareId))
    .leftJoin(authUser, eq(sesizare.reporter, authUser.id))
    .where(and(
      or(
        query.status ? eq(sesizare.status, query.status) : isNotNull(sesizare.status),
        like(sesizare.title, `%${query.search}%`),
        like(sesizare.description, `%${query.search}%`),
      ),
      between(sesizare.latitude, query.sw_lat, query.ne_lat),
      between(sesizare.longitude, query.ne_lng, query.sw_lng),
      query.reporter ? eq(sesizare.reporter, query.reporter) : isNotNull(sesizare.reporter),
    ))
    .groupBy(sesizare.id)
    .orderBy(query.sort === 'desc' ? desc(sesizare[query.sortby]) : asc(sesizare[query.sortby]))
    .limit(query.limit)
    .offset(query.offset)

  return result as unknown as SelectSesizareCard[]

  // result.map((r) => {
  //   r.reporterName = getInitials(r.reporterName)
  //   return r
  // })
})
