<script lang="ts" setup>
const sesizareLabels = defineModel<Label[]>('sesizareLabels', { default: [] })

const labelStore = useLabelsStore()
await labelStore.init()
const { labels } = storeToRefs(labelStore)
// const sesizareLabels = computed<Label[]>({
//   get: () => labelStore.idToLabels(sesizariStore.sesizari[currentSesizareIdx.value]?.labels || []),
//   set: async (labels: Label[]) => {
//     if (labels === undefined)
//       return
//     labels.map((label: Label) => {
//       if (label.id)
//         return label

//       const response = labelStore.add([label])
//       return response
//     })
//     if (currentSesizareIdx.value) {
//       sesizariStore.sesizari[currentSesizareIdx.value].labels = labelStore.labelsToId(labels)
//       return sesizariStore.sesizari[currentSesizareIdx.value].labels
//     }
//     else { return labels }
//   },
// })
</script>

<template>
  <USelectMenu v-model="sesizareLabels" :options="labels" searchable multiple by="id">
    <template #label>
      <template v-if="sesizareLabels.length">
        <UBadge v-for="label in sesizareLabels" :key="label.id" :label="label.name" variant="soft" />
      </template>
      <template v-else>
        <span class="text-gray-500 dark:text-gray-400 truncate">Select labels</span>
      </template>
    </template>

    <template #option="{ option }">
      <UBadge :label="option.name" variant="soft" />
    </template>
  </USelectMenu>
</template>

<style>

</style>
