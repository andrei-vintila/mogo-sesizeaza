<script lang="ts" setup>
import type { SesizareFormSchema } from '@@/utils/forms/sesizareSchema'
import { toCardSchema, toFormSchema } from '@/utils/transforms'

const route = useRoute()
const sesizariStore = useSesizariStore()
const labelsStore = useLabelsStore()

await labelsStore.init() // Ensure labels are loaded
await sesizariStore.fetchById(useRoute().params.id as string)
const { sesizari } = storeToRefs(sesizariStore)
const sesizare = sesizari.value.find(s => s.id === useRoute().params.id)

const breadcrumbs = computed(() => [
  { label: 'Sesizari', to: '/' },
  { label: sesizare?.title || 'Editare sesizare', to: `/sesizare/${route.params.id}` },
  { label: 'Editare' },
])

const deletedMedia = ref<string[]>([])

async function handleSubmit(formData: SesizareFormSchema) {
  try {
    if (!sesizare)
      return

    // Update the sesizare first
    await sesizariStore.updateSesizare(toCardSchema(formData, sesizare))

    // If update was successful, delete the removed media files
    if (deletedMedia.value.length > 0) {
      await Promise.all(
        deletedMedia.value.map(async (pathname) => {
          try {
            await $fetch(`/api/images/${pathname}`, { method: 'DELETE' })
          }
          catch (error) {
            console.error(`Failed to delete media file ${pathname}:`, error)
          }
        }),
      )
    }

    // Redirect to the sesizare details page after successful update
    navigateTo(`/sesizare/${route.params.id}`)
  }
  catch (error) {
    console.error(error)
    // Handle error (e.g., show error message)
  }
}

// Transform the sesizare to form schema
const formData = computed(() => sesizare ? toFormSchema(sesizare) : undefined)

function handleDeleteMedia(url: string) {
  deletedMedia.value.push(url)
}
</script>

<template>
  <div class="mt-2 flex flex-col gap-2">
    <UBreadcrumb :items="breadcrumbs" />
    <SesizareForm
      v-if="formData"
      v-model:initial-data="formData"
      :is-editing="true"
      @submit="handleSubmit"
      @delete-media="handleDeleteMedia"
    />
  </div>
</template>
