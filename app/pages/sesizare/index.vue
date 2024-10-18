<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from '#ui/types'
import type { SesizareFormSchema } from '@@/utils/forms/sesizareSchema'
import { sesizareFormSchema } from '@@/utils/forms/sesizareSchema'
import { generateId } from 'lucia'

const { user } = useUser()
const sesizariStore = useSesizariStore()

// check if we have a draft sesizare in local storage and if so, use it instead of empty init
const draftSesizare = useLocalStorage<SesizareFormSchema>('draft-sesizare', {
  id: generateId(25),
  title: '',
  description: '',
  latitude: null,
  longitude: null,
  status: 'new',
  labels: [],
}, { initOnMounted: true, mergeDefaults: true })

const breadcrumbs = computed(() => [
  { label: 'Sesizari', to: '/' },
  { label: draftSesizare.value.title || 'Adauga noua sesizare' },
])
async function onSubmit(event: FormSubmitEvent<SesizareFormSchema>) {
  // save the sesizare
  try {
    const result = await sesizariStore.addSesizare({
      ...event.data,
      reporter: user.value?.id || '',
      labels: event.data.labels || [],
      description: event.data.description || '',
      status: 'new',
      reporterName: user.value?.fullName || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 1,
      voted: true,
      latitude: event.data.latitude || 0,
      longitude: event.data.longitude || 0,
    })
    if (result instanceof Error)
      throw result

    draftSesizare.value = null
    navigateTo('/')
  }
  catch (error) {
    console.error(error)
  }
}
async function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0]?.id || '')
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div class="mt-2 flex flex-col gap-2">
    <UBreadcrumb :items="breadcrumbs" />
    <UCard class="overflow-hidden border border-gray-100 dark:border-gray-800 sm:rounded-lg">
      <template #header>
        <div class="flex justify-between">
          <h3 class="text-base font-semibold leading-7 ">
            Sesizare
          </h3>
        </div>
      </template>

      <UForm :state="draftSesizare" :schema="sesizareFormSchema" class="space-y-4" @submit="onSubmit" @error="onError">
        <UFormField label="Titlu" name="title" required>
          <UInput v-model="draftSesizare.title" />
        </UFormField>
        <UFormField label="Descriere" name="description">
          <UTextarea v-model="draftSesizare.description" :rows="4" autoresize class="w-full" />
        </UFormField>
        <UFormField label="Locație" name="location">
          <LocationPicker
            v-model:lng="draftSesizare.longitude"
            v-model:lat="draftSesizare.latitude"
          />
        </UFormField>
        <UFormField label="Etichete" name="labels">
          <LabelInput v-model:sesizare-labels="draftSesizare.labels" :sesizare-id="draftSesizare.id" />
        </UFormField>
        <UButton type="submit" label="Adaugă sesizarea" :icon="!user?.id ? 'i-heroicons-lock-closed' : ''" />
      </UForm>
    </UCard>
  </div>
</template>
