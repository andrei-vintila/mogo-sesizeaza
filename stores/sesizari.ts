import { defineStore } from 'pinia'
import { generateId } from 'lucia'
import { FetchError } from 'ofetch'
import type { SesizareCard } from '~/types/sesizare'
import type { InsertSesizare, SelectSesizare, UpsertSesizare } from '~/server/database/schema'
import { StatusEnumSchema } from '~/server/database/schema'

export const useSesizariStore = defineStore('sesizari', () => {
  const toast = useToast()
  const { idToLabels } = useLabelsStore()
  const { user } = useUser()

  const sesizariMap = ref(new Map<string, SesizareCard>())
  const votedSesizariSet = ref(new Set<string>())

  const sesizari = computed(() => Array.from(sesizariMap.value.values()))

  const fetchAll = async () => {
    const data = await $fetch('/api/sesizari')
    if (data !== null) {
      sesizariMap.value = new Map(data.map(sesizare => [
        sesizare.id,
        {
          ...sesizare,
          voted: Boolean(sesizare.voted),
          createdAt: new Date(sesizare.createdAt),
          updatedAt: new Date(sesizare.updatedAt),
          labels: idToLabels(sesizare.labels ?? []),
          reporterName: sesizare.reporterName ?? '',
        },
      ]))
      votedSesizariSet.value = new Set(data.filter(s => s.voted).map(s => s.id))
    }
  }

  const getSesizariWithinBounds = async (bounds: google.maps.LatLngBounds) => {
    return Array.from(sesizariMap.value.values()).filter(s =>
      bounds.contains(new google.maps.LatLng(s.latitude, s.longitude)),
    )
  }

  const fetchById = async (id: string) => {
    const data = await $fetch(`/api/sesizari/${id}`)
    if (data !== null) {
      const sesizare = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        labels: idToLabels(data.labels ?? []),
        reporterName: data.reporterName ?? '',
        voted: Boolean(data.voted),
      }
      sesizariMap.value.set(id, sesizare)
      if (sesizare.voted) {
        votedSesizariSet.value.add(id)
      }
    }
  }

  const addSesizare = async (insertSesizare: SesizareCard) => {
    if (!user.value || !user.value.fullName) {
      toast.add({
        id: 'add-sesizare-error',
        title: 'Nu s-a putut adăuga sesizarea',
        description: 'Trebuie să fii autentificat pentru a putea adauga o sesizare',
        actions: [{ label: 'Loghează-te', click: () => useRouter().push('/login') }],
        timeout: 5000,
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
      return createError('Nu s-a putut adăuga sesizarea')
    }
    const newSesizare: InsertSesizare = {
      ...insertSesizare,
      id: generateId(25),
      createdAt: new Date(),
      updatedAt: new Date(),
      reporter: user.value.id,
      labels: insertSesizare.labels.map(label => label.id),
      description: insertSesizare.description || '',
      status: StatusEnumSchema.parse('new'),
    }
    sesizariMap.value.set(insertSesizare.id, insertSesizare)
    votedSesizariSet.value.add(insertSesizare.id)
    try {
      await $fetch('/api/sesizari', {
        method: 'POST',
        body: newSesizare,
      })
      toast.add({ id: 'add-sesizare-success', title: 'Sesizare a fost adaugat cu succes' })
    }
    catch (error) {
      sesizariMap.value.delete(insertSesizare.id)
      votedSesizariSet.value.delete(insertSesizare.id)
      toast.add({
        id: 'add-sesizare-error',
        title: 'Sesizarea nu s-a putut adăuga.',
        description:
          (error instanceof Error ? error.message : 'Nu s-a putut adăuga sesizarea'),
        timeout: 5000,
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
      return createError(
        (error instanceof Error ? error.message : 'Nu s-a putut adăuga sesizarea'),
      )
    }
  }

  const updateSesizare = async (updatedSesizare: SesizareCard) => {
    if (!updatedSesizare.id)
      return

    const tempSesizare: UpsertSesizare = {
      ...updatedSesizare,
      labels: updatedSesizare.labels?.map(label => label.id) || [],
    }
    sesizariMap.value.set(updatedSesizare.id, updatedSesizare)

    try {
      await $fetch(`/api/sesizari/${updatedSesizare.id}`, {
        method: 'POST',
        body: tempSesizare,
      })
      toast.add({ id: 'update-sesizare-success', title: 'Sesizarea a fost actualizată cu succes' })
    }
    catch (error) {
      sesizariMap.value.set(updatedSesizare.id, updatedSesizare)
      toast.add({
        id: 'update-person-error',
        title: 'Sesizarea nu s-a putut actualizat.',
        description:
          (error instanceof Error ? error.message : 'Nu s-a putut actualizat sesizarea'),
        timeout: 5000,
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
      if (error instanceof Error)
        throw createError(error.message)
      else
        throw createError('O eroare necunoscută s-a întâlnit')
    }
  }

  const vote = async (sesizareId: string) => {
    if (!sesizariMap.value.has(sesizareId))
      return

    const sesizare = sesizariMap.value.get(sesizareId)!
    const voted = votedSesizariSet.value.has(sesizareId)
    try {
      if (voted) {
        sesizare.votes--
        votedSesizariSet.value.delete(sesizareId)
      }
      else {
        sesizare.votes++
        votedSesizariSet.value.add(sesizareId)
      }
      sesizare.voted = !voted
      sesizariMap.value.set(sesizareId, sesizare)
      await $fetch(`/api/sesizari/${sesizareId}/votes`, { method: 'POST' })
    }
    catch (error) {
      if (voted) {
        sesizare.votes++
        votedSesizariSet.value.add(sesizareId)
      }
      else {
        sesizare.votes--
        votedSesizariSet.value.delete(sesizareId)
      }
      sesizare.voted = voted
      sesizariMap.value.set(sesizareId, sesizare)
      if (error instanceof FetchError && error.response?.status === 401)
        useToast().add({ title: 'Nu ești logat!', description: 'Creează un cont sau loghează-te pentru a putea vota.', color: 'red', actions: [{ label: 'Loghează-te', click: () => useRouter().push('/login') }] })
      else
        useToast().add({ title: 'Eroare', description: 'Nu am putut înregistra votul', color: 'red' })
    }
  }

  const getSesizareReactiveById = (sesizareId: string) => {
    return computed(() => sesizariMap.value.get(sesizareId))
  }

  return {
    sesizari,
    fetchAll,
    getSesizariWithinBounds,
    addSesizare,
    updateSesizare,
    vote,
    fetchById,
    getSesizareReactiveById,
  }
})
