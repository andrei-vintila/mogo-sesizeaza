import { defineStore } from 'pinia'
import { generateId } from 'lucia'
import { FetchError } from 'ofetch'
import type { SesizareCard } from '~/types/sesizare'
import type { InsertSesizare } from '~/server/database/schema'
import { StatusEnumSchema } from '~/server/database/schema'

export const useSesizariStore = defineStore('sesizari', () => {
  const toast = useToast()
  const { idToLabelNames } = useLabelsStore()
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
        labels: idToLabelNames(sesizare.labels),
      }))
    }
  }
  const getSesizariWithinBounds = async (bounds: google.maps.LatLngBounds) => {
    return sesizari.value.filter(s => bounds.contains(new google.maps.LatLng(s.latitude, s.longitude)))
  }
  const addSesizare = async (insertSesizare: InsertSesizare) => {
    if (!user.value || !user.value.fullName) {
      toast.add({
        id: 'add-sesizare-error',
        title: 'Nu s-a putut adăuga sesizarea',
        description: 'Trebuie să fii autentificat pentru a putea adauga o sesizare',
        timeout: 5000,
        color: 'red',
        icon: 'i-heroicons-exclamation-circle',
      })
      return createError('Nu s-a putut adăuga sesizarea')
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
      await $fetch('/api/sesizari', {
        method: 'POST',
        body: newSesizare,
      })
      toast.add({ id: 'add-sesizare-success', title: 'Sesizare a fost adaugat cu succes' })
    }
    catch (error) {
      sesizari.value.pop()
      toast.add({
        id: 'add-sesizare-error',
        title: 'Sesizarea nu s-a putut adăuga.',
        description:
          (error instanceof Error ? error.message : 'Nu s-a putut adăuga sesizarea'),
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
      toast.add({ id: 'update-sesizare-success', title: 'Sesizarea a fost actualizată cu succes' })
    }
    catch (error) {
      sesizari.value[index] = tempPerson
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
      if (error instanceof FetchError && error.response?.status === 401)
        useToast().add({ title: 'Nu ești logat!', description: 'Creează un cont sau loghează-te pentru a putea vota.', color: 'red', actions: [{ label: 'Loghează-te', click: () => useRouter().push('/login') }] })
      else
        useToast().add({ title: 'Eroare', description: 'Nu am putut înregistra votul', color: 'red' })
    }
  }
  const getSesizareIndexById = (sesizareId: string) => {
    // find the index and return both the index and sesizare
    return useArrayFindIndex(sesizari, s => s.id === sesizareId)
  }

  return { sesizari, fetchAll, getSesizariWithinBounds, addSesizare, updateSesizare, getSesizareIndexById, vote }
})
