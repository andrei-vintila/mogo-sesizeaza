<script setup lang="ts">
import { format as formatDate } from '@formkit/tempo'

const { user } = useUser()
const languages = usePreferredLanguages()
const { data: sesizari } = await useFetch('/api/sesizari', {
  key: 'sesizari',
})

const { list, containerProps, wrapperProps } = useVirtualList(sesizari, {
  itemHeight: 181,
})
const sesizariViewState = useState('sesizariView', () => 'list')
const toggleIcon = computed(() => sesizariViewState.value === 'list' ? 'i-heroicons-map' : 'i-heroicons-queue-list')
const toggleLabel = computed(() => sesizariViewState.value === 'list' ? 'Harta' : 'Lista')
function toggleMap() {
  sesizariViewState.value = sesizariViewState.value === 'list' ? 'map' : 'list'
}
</script>

<template>
  <div class="grid relative height-minus-header">
    <div class="absolute bottom-2 justify-center flex w-full z-10">
      <div class=" backdrop-blur-sm p-2 min-w-[50%] flex space-x-2 justify-center rounded-full dark:border-white/30 border-black/30 border-[0.5px]">
        <UButton variant="ghost" color="gray" size="lg" :icon="toggleIcon" :label="toggleLabel" :ui="{ rounded: 'rounded-full' }" @click="toggleMap" />
        <UButton
          to="/sesizare/" color="black" size="lg" label="Adauga sesizare" :ui="{ rounded: 'rounded-full' }"
        />
        <UButton v-if="user" to="/me/sesizari" variant="ghost" size="lg" label="Sesizarile mele" :ui="{ rounded: 'rounded-full' }" />
      </div>
    </div>
    <Suspense>
      <div v-show="sesizariViewState === 'list'" v-bind="containerProps" class="height-minus-header py-1 flex-grow">
        <div v-bind="wrapperProps" class="">
          <div v-for="sesizare in list" :key="sesizare.index" class="px-2 py-1">
            <UCard :title="sesizare.data.title" class="hover:bg-opacity-90">
              <template #header>
                <div class="flex justify-between">
                  <div class="flex space-x-2">
                    <UBadge color="primary" variant="outline" size="sm">
                      {{ sesizare.data.status?.toUpperCase() }}
                    </UBadge>
                    <h2 class="md:text-lg text-md font-semibold leading-6">
                      <ULink :to="`/sesizare/${sesizare.data.id}`" class="truncate overflow-ellipsis">
                        {{ sesizare.data.title }}
                      </ULink>
                    </h2>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs">{{ formatDate(sesizare.data.createdAt, 'long', languages[0]) }}</span>
                  </div>
                </div>
              </template>
              <div class="flex flex-col">
                <span class="truncate">{{ sesizare.data.description }}</span>
                <span class="text-xs">{{ sesizare.data.latitude }}</span>
                <span class="text-xs">{{ sesizare.data.longitude }}</span>
              </div>
            </UCard>
          </div>
        </div>
      </div>
      <template #fallback>
        <div v-for="index in 10" :key="index" class="flex items-center justify-center w-[169]">
          <USkeleton class="h-12 w-12" :ui="{ rounded: 'rounded-full' }" />
          <div class="space-y-2">
            <USkeleton class="h-4 w-[250px]" />
            <USkeleton class="h-4 w-[200px]" />
          </div>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<style>
 .height-minus-header {
   height: calc(100svh - 53px);
 }
</style>
