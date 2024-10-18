<script lang="ts" setup>
import type { SesizareFormSchema } from '~~/utils/forms/sesizareSchema'
import { sesizareFormSchema } from '~~/utils/forms/sesizareSchema'

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

async function handleSubmit(formData: Schema) {
  try {
    await sesizariStore.updateSesizare({
      ...formData,
      latitude: formData.latitude || 0,
      longitude: formData.longitude || 0,
      reporter: sesizare?.reporter || '',
      createdAt: sesizare?.createdAt || new Date(),
      updatedAt: new Date(),
      status: sesizare?.status ?? 'new',
      reporterName: sesizare?.reporterName || '',
      votes: sesizare?.votes || 0,
      voted: sesizare?.voted || false,
      description: formData.description || '',
      labels: formData.labels || [],
    })

    // Redirect to the sesizare details page after successful update
    navigateTo(`/sesizare/${route.params.id}`)
  }
  catch (error) {
    console.error(error)
    // Handle error (e.g., show error message)
  }
}
</script>

<template>
  <div class="mt-2 flex flex-col gap-2">
    <UBreadcrumb :items="breadcrumbs" />
    <SesizareForm v-if="sesizare" v-model:initial-data="sesizare" :is-editing="true" @submit="handleSubmit" />
  </div>
</template>
