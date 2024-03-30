<script lang="ts" setup>
import type { SesizareCard } from '~/types/sesizare'

defineProps({
  sesizareId: {
    type: Object as PropType<SesizareCard>,
    required: true,
  },
})
const currentSesizare = 

const labelStore = useLabelsStore()
const { labels } = storeToRefs(useLabelsStore())
const sesizareLabels = computed<Label[]>({
  get: () => labelStore.idToLabels(currentPerson.value?.labels || []),
  set: async (labels: Label[]) => {
    if (labels === undefined)
      return
    labels.map((label: Label) => {
      if (label.id)
        return label

      const response = labelStore.add([label])
      return response
    })
    currentPerson.value.labels = labelStore.labelsToId(labels)
    return currentPerson.value.labels
  },
})
</script>

<template>
  <USelectMenu v-model="sesizareLabels" :options="labels" searchable option-attribute="name" multiple creatable>
    <template #label>
      <template v-if="sesizareLabels.length">
        <UBadge v-for="label in sesizareLabels" :key="label.id" :label="label.name" variant="outline" color="gray" />
      </template>
      <template v-else>
        <span class="text-gray-500 dark:text-gray-400 truncate">Select labels</span>
      </template>
    </template>

    <template #option="{ option }">
      <UBadge :label="option.name" />
    </template>

    <template #option-create="{ option }">
      <span class="flex-shrink-0">New label:</span>
      <UBadge :label="option.name" />
    </template>
  </USelectMenu>
</template>

<style>

</style>
