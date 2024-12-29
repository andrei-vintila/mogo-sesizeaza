import z from 'zod'

export default eventHandler(async (event) => {
  // Only authenticated users can delete images
  const { user } = await requireUserSession(event)

  const { pathname } = await getValidatedRouterParams(event, z.object({
    pathname: z.string().min(1),
  }).parse)

  // Ensure the pathname starts with images/
  const fullPath = pathname.startsWith('images/') ? pathname : `images/${pathname}`
  const metadata = await hubBlob().head(fullPath)
  if (metadata.customMetadata.userId !== user.id) {
    throw createError({
      statusCode: 403,
      message: 'You are not authorized to delete this image',
    })
  }
  await hubBlob().delete(fullPath)
  return { success: true }
})
