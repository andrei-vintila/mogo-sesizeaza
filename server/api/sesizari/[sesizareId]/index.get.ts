import { count, eq } from 'drizzle-orm'
import { z } from 'zod'
import { DEFAULT_ID_SIZE, authUser, sesizare, sesizareVotes } from '~/server/database/schema'

const idSchema = z.object({ sesizareId: z.string().length(DEFAULT_ID_SIZE) })
function getInitials(fullName: string) {
  // Split the name into an array of words
  const names = fullName.split(' ')

  // Check if the name has at least two parts (first and last name)
  if (names.length >= 2) {
    // Get the first character of the first name and the first character of the last name
    return `${names[0].charAt(0)}.${names[1].charAt(0)}.`
  }
  else if (names.length === 1) {
    // Handle case where there is only one word in the name
    return `${names[0].charAt(0)}.`
  }
  else {
    // Handle case where the input is empty or not a valid name
    return 'Anonymous'
  }
}

export default defineEventHandler(async (event) => {
  const { sesizareId } = await getValidatedRouterParams(event, params => idSchema.parse(params))

  const db = event.context.db
  const result = await db.select({
    id: sesizare.id,
    title: sesizare.title,
    description: sesizare.description,
    latitude: sesizare.latitude,
    longitude: sesizare.longitude,
    status: sesizare.status,
    reporter: sesizare.reporter,
    reporterName: authUser.fullName,
    createdAt: sesizare.createdAt,
    updatedAt: sesizare.updatedAt,
    votes: count(sesizareVotes.voterId),
    voted: count(sesizareVotes.voterId, eq(sesizareVotes.voterId, event.context.user.id)),
  })
    .from(sesizare)
    .leftJoin(authUser, eq(sesizare.reporter, authUser.id))
    .leftJoin(sesizareVotes, eq(sesizare.id, sesizareVotes.sesizareId))
    .where(eq(sesizare.id, sesizareId))
  // we anonymize the reporter name by using the initials
  result[0].reporterName = getInitials(result[0].reporterName)
  return result[0]
})
