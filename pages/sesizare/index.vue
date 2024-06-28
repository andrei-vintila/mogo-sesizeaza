<script lang="ts" setup>
import { generateId } from 'lucia'
import { z } from 'zod'
import type { FormErrorEvent, FormSubmitEvent } from '#ui/types'

const { user } = useUser()
const sesizariStore = useSesizariStore()

const schema = z.object({
  id: z.string(),
  title: z.string().min(3, 'Trebuie sa aiba cel putin 3 caractere'),
  description: z.string().optional(),

  lat: z.number().nullable(),
  lng: z.number().nullable(),
  labels: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
})

type Schema = z.infer<typeof schema>
// check if we have a draft sesizare in local storage and if so, use it instead of empty init
const draftSesizare = useLocalStorage<Schema>('draft-sesizare', {
  id: generateId(25),
  title: '',
  description: '',
  lat: null,
  lng: null,
  labels: [],
}, { initOnMounted: true, mergeDefaults: true })

const breadcrumbs = computed(() => [
  { label: 'Sesizari', to: '/' },
  { label: draftSesizare.value.title || 'Adauga noua sesizare' },
])
async function onSubmit(event: FormSubmitEvent<Schema>) {
  // save the sesizare
  const labels = event.data.labels?.map(label => label.id) || []
  try {
    const result = await sesizariStore.addSesizare({
      ...event.data,
      latitude: event.data.lat || 0,
      longitude: event.data.lng || 0,
      reporter: user.value?.id || '',
      labels,
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
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div class="mt-2 flex flex-col gap-2">
    <UBreadcrumb :links="breadcrumbs" />
    <UCard class="overflow-hidden border border-gray-100 dark:border-gray-800 sm:rounded-lg">
      <template #header>
        <div class="flex justify-between">
          <h3 class="text-base font-semibold leading-7 ">
            Sesizare
          </h3>
        </div>
      </template>

      <UForm :state="draftSesizare" :schema="schema" class="space-y-4" @submit="onSubmit" @error="onError">
        <UFormGroup label="Titlu" name="title" required>
          <UInput v-model="draftSesizare.title" />
        </UFormGroup>
        <UFormGroup label="Descriere" name="description">
          <UTextarea v-model="draftSesizare.description" />
        </UFormGroup>
        <UFormGroup label="Locație" name="location">
          <LocationPicker v-model:lng="draftSesizare.lng" v-model:lat="draftSesizare.lat" />
        </UFormGroup>
        <UFormGroup label="Etichete" name="labels">
          <LabelInput v-model:sesizare-labels="draftSesizare.labels" :sesizare-id="draftSesizare.id" />
        </UFormGroup>
        <UButton type="submit" label="Adaugă sesizarea" :icon="!user?.id ? 'i-heroicons-lock-closed' : ''" />
      </UForm>
    </UCard>
  </div>
</template>
