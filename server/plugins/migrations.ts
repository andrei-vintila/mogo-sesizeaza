import { consola } from 'consola'
import { migrate } from 'drizzle-orm/d1/migrator'

export default defineNitroPlugin(async () => {
  if (!import.meta.dev)
    return

  onHubReady(async () => {
    consola.withTag('db').info('running migrations')
    await migrate(useDrizzle(), { migrationsFolder: 'server/database/migrations' })
      .then(() => {
        consola.withTag('db').success('Database migrations done')
      })
      .catch((err) => {
        consola.withTag('db').error('Database migrations failed', err)
      })
  })
})
