<script lang="ts" setup>
import type { StatusEnumSchema } from '@@/server/database/schema'
import type { z } from 'zod'

const { status } = defineProps<{
  status: z.infer<typeof StatusEnumSchema>
}>()

const statusColor = computed(() => {
  switch (status) {
    case 'new':
      return 'border-dashed border-gray-300'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800'
    case 'resolved':
      return 'bg-green-100 text-green-800'
    case 'archived':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})
const statusTitle = computed(() => {
  switch (status) {
    case 'new':
      return 'Nou'
    case 'in_progress':
      return 'In curs de rezolvare'
    case 'resolved':
      return 'Rezolvat'
    case 'archived':
      return 'Arhivat'
    default:
      return 'Necunoscut'
  }
})
</script>

<template>
  <UTooltip :text="statusTitle">
    <div class="inline-flex rounded-full border-2 h-6 w-6" :class="statusColor" />
  </UTooltip>
</template>
