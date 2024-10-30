import * as tables from '@@/server/database/schema'
import { consola } from 'consola'

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
      {
        name: 'Zona Stadion',
      },
      {
        name: 'Zona Livadă',
      },
      {
        name: 'Parc',
      },
      {
        name: 'Primărie',
      },
      {
        name: 'Educație',
      },
    ]
    await useDrizzle().insert(tables.labels).values(labels)
    return { result: 'success' }
  },
})
