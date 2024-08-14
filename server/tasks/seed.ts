import { consola } from 'consola'
import * as tables from '~/server/database/schema'

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Run database seed task',
  },
  async run() {
    consola.info('Running DB seed task...')
    const labels = [
      {
        name: 'Drumuri',
      },
      {
        name: 'Canalizare',
      },
      {
        name: 'Electricitate',
      },
      {
        name: 'Câini',
      },
      {
        name: 'Apa potabilă',
      },
    ]
    await useDrizzle().insert(tables.labels).values(labels)
    return { result: 'success' }
  },
})
