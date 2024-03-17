import { z } from 'zod'
import { and, between, eq, isNotNull, like, or, sql } from 'drizzle-orm'
import { StatusEnumSchema, sesizare } from '~/server/database/schema'

const querySchema = z.object({
  search: z.string().optional(),
  limit: z.number().optional().default(25),
  offset: z.number().optional().default(0),
  labels: z.string().optional(),
  status: StatusEnumSchema.optional(),
  sw_lat: z.number().optional().default(44.51327340892296),
  sw_lng: z.number().optional().default(26.019562420223934),
  ne_lat: z.number().optional().default(44.54558060303962),
  ne_lng: z.number().optional().default(25.973814663834826),
  sort: z.enum(['desc', 'asc']).optional().default('desc'),
  sortby: z.enum(['createdAt', 'updatedAt']).optional().default('createdAt'),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  // artifical long time for response

  const query = await getValidatedQuery(event, query => querySchema.parse(query))
  return await db.query.sesizare.findMany({
    where: and(
      or(
        query.status ? eq(sesizare.status, query.status) : isNotNull(sesizare.status),
        like(sesizare.title, `%${query.search}%`),
        like(sesizare.description, `%${query.search}%`),
      ),
      between(sesizare.latitude, query.sw_lat, query.ne_lat),
      between(sesizare.longitude, query.ne_lng, query.sw_lng),
    ),

    limit: query.limit,
    offset: query.offset,

  })
})
