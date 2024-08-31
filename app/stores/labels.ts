import { defineStore } from 'pinia'
import type { z } from 'zod'
import { generateId } from 'lucia'
import { InsertLabelSchema } from '@@/server/database/schema'

const _LabelSchema = InsertLabelSchema.pick({
  id: true,
  name: true,
}).required({ id: true })
const _AddLabelSchema = InsertLabelSchema.pick({
  id: true,
  name: true,
})
export type Label = z.infer<typeof _LabelSchema>
export type AddLabel = z.infer<typeof _AddLabelSchema>

export const useLabelsStore = defineStore('labels', () => {
  const labelsSet = new Set<Label>()

  const init = async () => {
    const data = await $fetch<Label[]>('/api/label')
    labelsSet.clear()
    data.forEach(label => labelsSet.add(label))
  }

  const add = async (newLabels: AddLabel[]): Promise<Label[]> => {
    const data: Label[] = newLabels.map(l => ({
      ...l,
      id: generateId(25),
    }))

    data.forEach((label) => {
      labelsSet.add(label)
    })

    try {
      await $fetch('/api/label', {
        method: 'POST',
        body: data,
      })
      return data
    }
    catch (error) {
      // Remove the added labels in case of error
      data.forEach((label) => {
        labelsSet.delete(label)
      })
      throw error
    }
  }

  const update = async (label: Label): Promise<void> => {
    const oldLabel = Array.from(labelsSet).find(l => l.id === label.id)
    if (!oldLabel)
      return

    labelsSet.delete(oldLabel)
    labelsSet.add(label)

    try {
      await $fetch(`/api/label/${label.id}`, { method: 'PUT', body: label })
    }
    catch (error) {
      labelsSet.delete(label)
      labelsSet.add(oldLabel)
      throw error
    }
  }

  const remove = async (label: Label): Promise<void> => {
    if (!labelsSet.has(label))
      return

    labelsSet.delete(label)

    try {
      await $fetch(`/api/label/${label.id}`, { method: 'DELETE' })
    }
    catch (error) {
      labelsSet.add(label)
      throw error
    }
  }

  const idToLabels = (labelIds: string[]): Label[] => {
    return Array.from(labelsSet).filter(label => labelIds.includes(label.id))
  }

  const idToLabelNames = (labelIds: string[]): string[] => {
    return idToLabels(labelIds).map(label => label.name)
  }

  const labelsToId = (labelsArray: Label[]): string[] => {
    return labelsArray.map(label => label.id)
  }

  const labels = computed(() => Array.from(labelsSet))

  return {
    labels,
    init,
    add,
    update,
    remove,
    labelsToId,
    idToLabels,
    idToLabelNames,
  }
})
