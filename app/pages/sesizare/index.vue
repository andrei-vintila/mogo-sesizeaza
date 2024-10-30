<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from '#ui/types'
import type { SesizareFormSchema } from '@@/utils/forms/sesizareSchema'
import type { UseBase64Return } from '@vueuse/core'
import { sesizareFormSchema } from '@@/utils/forms/sesizareSchema'
import { generateId } from '@@/utils/random'
import { useBase64 } from '@vueuse/core'

const { user } = useUser()
const sesizariStore = useSesizariStore()

const media = ref<File[]>([])

export interface SerializedMedia { base64: UseBase64Return, mimeType: string, name: string }
const serializedMedia = ref<SerializedMedia[]>([])

// Update draftSesizare to include serialized media
const draftSesizare = useLocalStorage<SesizareFormSchema & { serializedMedia: SerializedMedia[] }>('draft-sesizare', {
  id: generateId(25),
  title: '',
  description: '',
  latitude: null,
  longitude: null,
  media: [],
  serializedMedia: [],
  status: 'new',
  labels: [],
}, { initOnMounted: true, mergeDefaults: true })

// Initialize media from local storage on component mount
onMounted(async () => {
  if (draftSesizare.value.serializedMedia.length > 0) {
    media.value = await Promise.all(draftSesizare.value.serializedMedia.map(async (serializedFile) => {
      const base64Data = await serializedFile.base64.promise
      const blob = await fetch(`data:${serializedFile.mimeType};base64,${base64Data}`).then(res => res.blob())
      return new File([blob], serializedFile.name, { type: serializedFile.mimeType })
    }))
  }
})

// Watch for changes in media and update serializedMedia and draftSesizare
watch(media, async (newMedia) => {
  serializedMedia.value = await Promise.all(newMedia.map(async (file) => {
    const base64 = useBase64(file)
    return {
      base64,
      mimeType: file.type,
      name: file.name,
    }
  }))
  draftSesizare.value.serializedMedia = serializedMedia.value
}, { deep: true })

const breadcrumbs = computed(() => [
  { label: 'Sesizari', to: '/' },
  { label: draftSesizare.value.title || 'Adauga noua sesizare' },
])
async function onSubmit(event: FormSubmitEvent<SesizareFormSchema>) {
  // save the sesizare
  try {
    // Deserialize media from serialized objects to File objects
    const deserializedMedia = await Promise.all(
      draftSesizare.value.serializedMedia.map(async (serializedFile) => {
        const response = await fetch(serializedFile.base64)
        const blob = await response.blob()
        return new File([blob], serializedFile.name, { type: serializedFile.mimeType })
      }),
    )

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
        <UFormField label="Imagini" name="images">
          <ImageUploadInput v-model="media" />
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
