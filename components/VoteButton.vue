<script lang="ts" setup>
const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
})
const votes = defineModel<number>('votes', { required: true })
const voted = defineModel<boolean>('voted', { required: true })
const { vote } = useSesizariStore()
</script>

<template>
  <UButton
    :label="votes.toString()" :variant="voted ? 'solid' : 'outline'" icon="i-heroicons-hand-thumb-up"
    size="xs" @click="vote(id)"
  />
</template>
