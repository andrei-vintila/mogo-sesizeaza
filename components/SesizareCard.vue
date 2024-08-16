<script lang="ts" setup>
import type { SesizareCard } from '~/types/sesizare'

const props = defineProps({
  sesizare: {
    type: Object as PropType<SesizareCard>,
    required: true,
  },
})
const route = useRoute()
const isSingleView = route.path === `/sesizare/${props.sesizare.id}`
</script>

<template>
  <UCard :title="sesizare.title">
    <template #header>
      <SesizareHeader :sesizare="sesizare" :is-single-view="isSingleView" />
    </template>
    <div v-if="!isSingleView" class="flex flex-row justify-between">
      <div class="flex flex-col space-y-2">
        <p class="text-sm ">
          {{ sesizare.description }}
        </p>
        <div class="flex flex-wrap gap-2">
          <UBadge v-for="label in sesizare.labels" :key="label.id" variant="soft" :label="label.name" />
        </div>
      </div>
    </div>
    <div v-if="isSingleView" class="flex flex-col space-y-4">
      <div class="sm:grid sm:grid-cols-3 sm:gap-4">
        <dt class="text-sm font-medium mb-1 ">
          Descriere detaliata
        </dt>
        <dd class="text-sm leading-6 sm:col-span-2">
          {{ sesizare.description }}
        </dd>
      </div>
      <div class="sm:grid sm:grid-cols-3 sm:gap-4">
        <dt class="text-sm font-medium mb-1 ">
          Locatie
        </dt>
        <dd class="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0 relative group tab-index-0">
          <LocationViewer :static-map-url="getStaticMapUrl(sesizare.latitude, sesizare.longitude, 16) " />
          <UButton
            class="absolute bottom-2 left-1/2 transform -translate-x-1/2 group-hover:opacity-100 opacity-0 transition-opacity duration-300 ease-in-out"
            label="Vezi pe Google Maps" target="_blank"
            :to="`https://www.google.com/maps/search/?api=1&query=${sesizare.latitude},${sesizare.longitude}`"
            rel="noopener noreferrer" color="gray" icon="i-heroicons-arrow-top-right-on-square"
          />
        </dd>
      </div>
      <div class="sm:grid sm:grid-cols-3 sm:gap-4">
        <dt class="text-sm font-medium mb-1 ">
          Etichete
        </dt>
        <dd class="text-sm leading-6 sm:col-span-2 flex gap-2">
          <UBadge v-for="label in sesizare.labels" :key="label.id" variant="soft" :label="label.name" />
        </dd>
      </div>
    </div>
  </UCard>
</template>
