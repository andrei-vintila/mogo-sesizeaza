import { defineStore } from 'pinia'

import { generateId } from 'lucia'
import type { SesizareCard } from '~/types/sesizare'

import type { InsertSesizare } from '~/server/database/schema'
import { StatusEnumSchema } from '~/server/database/schema'

const toast = useToast()

export const useSesizariStore = defineStore('sesizari', () => {
  const sesizari = ref<SesizareCard[]>([])
  const { user } = useUser()
  const fetchAll = async () => {
    const { data } = await useFetch('/api/sesizari', {
      key: 'sesizari',
    })
    if (data.value !== null) {
      sesizari.value = data.value.map(sesizare => ({
        ...sesizare,
        voted: Boolean(sesizare.voted),
        createdAt: new Date(sesizare.createdAt),
        updatedAt: new Date(sesizare.updatedAt),
      }))
    }
  }
  const addSesizare = async (insertSesizare: InsertSesizare) => {
    if (!user.value || !user.value.fullName) {
      toast.add({
        id: 'add-sesizare-error',
        title: 'Could not add sesizare',
        description: 'You must be logged in to add a sesizare',
        timeout: 5000,
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
      return
    }
    const newSesizare = {
      id: generateId(25),
      ...insertSesizare,
      createdAt: new Date(),
      updatedAt: new Date(),
      reporter: user.value.id,
      reporterName: user.value.fullName,
      votes: 0,
      voted: false,
      description: insertSesizare.description || '',
      status: StatusEnumSchema.parse('new'),
    }
    sesizari.value.push(newSesizare)
    try {
      await $fetch('/api/sesizare', {
        method: 'POST',
        body: [newSesizare],
      })
      toast.add({ id: 'add-person-success', title: 'Person added' })
    }
    catch (error) {
      sesizari.value.pop()
      toast.add({
        id: 'add-person-error',
        title: 'Could not add person',
        description:
          error.statusMessage
          || error.message
          || 'No clue why this is happening',
        timeout: 5000,
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
    }
  }
  const updateSesizare = async (updatedSesizare: SesizareCard) => {
    const index = sesizari.value.findIndex(p => p.id === updatedSesizare.id)
    if (index === -1)
      return

    const tempPerson = sesizari.value[index]
    sesizari.value[index] = updatedSesizare

    try {
      await $fetch(`/api/sesizare/${updatedSesizare.id}`, {
        method: 'POST',
        body: [updatedSesizare],
      })
      toast.add({ id: 'update-person-success', title: 'Person updated' })
    }
    catch (error) {
      sesizari.value[index] = tempPerson
      toast.add({
        id: 'update-person-error',
        title: 'Could not update person',
        description:
          error.statusMessage
          || error.message
          || 'No clue why this is happening',
        timeout: 5000,
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
      throw createError(error)
    }
  }
  const vote = async (sesizareId: string) => {
    const index = sesizari.value.findIndex(s => s.id === sesizareId)
    if (index === -1)
      return

    const { voted } = sesizari.value[index]
    try {
      if (voted) {
        sesizari.value[index].votes--
        sesizari.value[index].voted = false
      }
      else {
        sesizari.value[index].votes++
        sesizari.value[index].voted = true
      }
      await $fetch(`/api/sesizari/${sesizareId}/votes`, { method: 'POST' })
    }
    catch (error) {
      if (voted) {
        sesizari.value[index].votes++
        sesizari.value[index].voted = true
      }
      else {
        sesizari.value[index].votes--
        sesizari.value[index].voted = false
      }
      useToast().add({ title: 'Eroare', description: 'Nu am putut înregistra votul', color: 'red' })
    }
  }

  return { sesizari, fetchAll, addSesizare, updateSesizare, vote }
})
