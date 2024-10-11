<script setup lang="ts">
const { mapToggle = true } = defineProps<{
  mapToggle?: boolean
}>()
const sesizariViewState = useState('sesizariView')
const { user } = useUser()

const toggleIcon = computed(() => sesizariViewState.value === 'list' ? 'i-heroicons-map' : 'i-heroicons-queue-list')
const toggleLabel = computed(() => sesizariViewState.value === 'list' ? 'Harta' : 'Lista')

function handleToggleMap() {
  sesizariViewState.value = sesizariViewState.value === 'list' ? 'map' : 'list'
}
</script>

<template>
  <div class="absolute bottom-2 justify-center flex w-full z-10">
    <div
      class="backdrop-blur-sm p-2 min-w-[50%] flex space-x-2 justify-center rounded-full dark:border-white/30 border-black/30 border-[0.5px]"
    >
      <UButton
        v-if="mapToggle" variant="ghost" color="neutral" size="lg" :icon="toggleIcon" :label="toggleLabel"
        class="rounded-full" @click="handleToggleMap"
      />
      <UButton to="/sesizare/" color="neutral" size="lg" label="Adauga sesizare" class="rounded-full" />
      <UButton
        v-if="user" to="/me/sesizari" variant="ghost" size="lg" label="Sesizarile mele"
        class="rounded-full"
      />
    </div>
  </div>
</template>
