<script setup lang="ts">
import { format as formatDate } from '@formkit/tempo'

const { user } = useUser()
const languages = usePreferredLanguages()
const { data: sesizari } = await useFetch('/api/sesizari', {
  key: 'sesizari',
})

const { list, containerProps, wrapperProps } = useVirtualList(sesizari, {
  itemHeight: 169,
})
</script>

<template>
  <div class="grid">
    <div class="absolute bottom-2 justify-self-center z-10">
      <UButton
        to="/sesizare/" color="black" size="lg" label="Adauga sesizare" :ui="{ rounded: 'rounded-full' }"
      />
    </div>
    <Suspense>
      <div v-bind="containerProps" class="height-minus-header flex-grow">
        <div v-bind="wrapperProps" class="m-2">
          <div v-for="sesizare in list" :key="sesizare.index" class="p-2">
            <UCard :title="sesizare.data.title">
              <template #header>
                <div class="flex space-x-2">
                  <UBadge color="primary" variant="outline" size="sm">
                    {{ sesizare.data.status?.toUpperCase() }}
                  </UBadge>
                  <h2 class="text-lg font-semibold leading-6">
                    <NuxtLink :to="`/sesizare/${sesizare.data.id}`">
                      {{ sesizare.data.title }}
                    </NuxtLink>
                  </h2>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500">{{ formatDate(sesizare.data.createdAt, 'long', languages[0]) }}</span>
                </div>
              </template>
              <div class="flex flex-col">
                <span class="truncate">{{ sesizare.data.description }}</span>
                <span class="text-xs text-gray-500">{{ sesizare.data.latitude }}</span>
                <span class="text-xs text-gray-500">{{ sesizare.data.longitude }}</span>
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
   height: calc(100vh - 96px);
 }
</style>
