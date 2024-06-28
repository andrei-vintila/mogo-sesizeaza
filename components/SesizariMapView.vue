<script lang="ts" setup>
import { CustomMarker, GoogleMap, MarkerCluster } from 'vue3-google-map'
import { useSesizariStore } from '@/stores/sesizari'
import type { SesizareCard } from '~/types/sesizare'

const { googleMapsApiKey } = useRuntimeConfig().public
const mapRef = ref()
const sesizariStore = useSesizariStore()
await sesizariStore.fetchAll()
const colorMode = useColorMode()
const mapIdBasedColorMode = computed(() =>
  colorMode.value === 'dark' ? '593a0446512e5198' : 'bca681cd186f5d7d',
)

const { coords } = useGeolocation({
  immediate: false,
  enableHighAccuracy: true,
})
const defaultCoords = { lat: 44.52253832168663, lng: 26.006091098242493 }
const center = ref(defaultCoords || coords.value)
const selectedSesizare = ref<SesizareCard | null>(null)
const isOpen = ref(false)
function handleOpen(sesizareId: string) {
  isOpen.value = !isOpen.value
  if (isOpen.value)
    selectedSesizare.value = sesizariStore.sesizari.find(sesizare => sesizare.id === sesizareId)!
  else
    selectedSesizare.value = null
}
</script>

<template>
  <div>
    <GoogleMap
      ref="mapRef" :api-key="googleMapsApiKey" :center="center" :zoom="15" :map-id="mapIdBasedColorMode"
      :street-view-control="false" :clickable-icons="false" class="h-full"
    >
      <MarkerCluster>
        <CustomMarker
          v-for="sesizare in sesizariStore.sesizari" :key="sesizare.id"
          :options="{ position: { lat: sesizare.latitude, lng: sesizare.longitude }, anchorPoint: 'BOTTOM_CENTER' }"
          @click="handleOpen(sesizare.id)"
        >
          <MarkerLocation />
        </CustomMarker>
      </MarkerCluster>
    </GoogleMap>
    <USlideover v-model="isOpen">
      <SesizareCard :sesizare="selectedSesizare!" />
    </USlideover>
  </div>
</template>

<style>

</style>
