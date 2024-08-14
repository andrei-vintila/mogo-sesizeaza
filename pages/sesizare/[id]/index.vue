<script lang="ts" setup>
import { format as formatDate } from '@formkit/tempo'
import { getStaticMapUrl } from '~/utils/googleMaps'

const labels = useLabelsStore()
await labels.init()
const sesizariStore = useSesizariStore()
await sesizariStore.fetchAll()
const { sesizari } = storeToRefs(sesizariStore)
const { user } = useUser()
const languages = usePreferredLanguages()
const { googleMapsApiKey } = useRuntimeConfig().public
const sesizare = sesizari.value.find(s => s.id === useRoute().params.id)
const breadcrumbs = [
  { label: 'Sesizari', to: '/' },
  { label: sesizare?.title },
]
</script>

<template>
  <div v-if="sesizare" class="mt-2 flex flex-col gap-2">
    <UBreadcrumb :links="breadcrumbs" />
    <SesizareCard :sesizare="sesizare" />
  </div>
</template>
