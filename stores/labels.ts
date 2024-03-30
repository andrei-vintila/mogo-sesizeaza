import { defineStore } from 'pinia'
import type { z } from 'zod'
import { generateId } from 'lucia'
import { InsertLabelSchema } from '~/server/database/schema'

const LabelSchema = InsertLabelSchema.pick({
  id: true,
  name: true,
}).required({ id: true })
const AddLabelSchema = InsertLabelSchema.pick({
  id: true,
  name: true,
})
export type Label = z.infer<typeof LabelSchema>
export type AddLabel = z.infer<typeof AddLabelSchema>
export const useLabelsStore = defineStore('labels', () => {
  const labels = ref<Label[]>([])
  const init = async () => {
    const { data } = await useFetch('/api/label', {
      key: 'labels',
    })
    syncRef(labels, data, {
      direction: 'rtl',
      transform: {
        rtl: (right) => {
          return right as Label[]
        },
      },
    })
  }
  const add = async (newLabels: AddLabel[]) => {
    const data: Label[] = newLabels.map((l) => {
      l.id = generateId(25)
      const newLabel = l as Label
      labels.value.push(newLabel)
      return newLabel
    })
    try {
      await $fetch('/api/label', {
        method: 'POST',
        body: data,
      })
      return data
    }
    catch (error) {
      // remove the number of labels added
      newLabels.map(() =>
        labels.value.pop(),
      )
    }
  }

  const update = async (label: Label) => {
    const index = labels.value.findIndex(l => l.id === label.id)
    if (index === -1)
      return

    labels.value[index] = label
    try {
      await useFetch(`/api/label/${label.id}`, { method: 'PUT', body: label })
    }
    catch (error) {
      labels.value[index] = label
    }
  }
  const remove = async (label: Label) => {
    const index = labels.value.findIndex(l => l.id === label.id)
    if (index === -1)
      return

    labels.value.splice(index, 1)
    try {
      await useFetch(`/api/label/${label.id}`, { method: 'DELETE' })
    }
    catch (error) {
      labels.value.splice(index, 0, label)
    }
  }
  const idToLabels = (labelIds: Array<string>): Label[] => {
    return labels.value.filter(label => labelIds.includes(label.id))
  }
  // schema of Label with mandatory id
  const labelsToId = (labels: Label[]): Array<string> => {
    return labels.map(label => label.id)
  }
  return { labels, init, add, update, remove, labelsToId, idToLabels }
})
