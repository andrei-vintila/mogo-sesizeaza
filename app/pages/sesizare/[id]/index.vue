<script lang="ts" setup>
const labels = useLabelsStore()
await labels.init()
const sesizariStore = useSesizariStore()
await sesizariStore.fetchById(useRoute().params.id as string)
const { sesizari } = storeToRefs(sesizariStore)
const sesizare = sesizari.value.find(s => s.id === useRoute().params.id)
const breadcrumbs = [
  { label: 'Sesizari', to: '/' },
  { label: sesizare?.title },
]
</script>

<template>
  <div v-if="sesizare" class="mt-2 flex flex-col gap-2">
    <UBreadcrumb :items="breadcrumbs" />
    <SesizareCard :sesizare="sesizare" />
  </div>
</template>
