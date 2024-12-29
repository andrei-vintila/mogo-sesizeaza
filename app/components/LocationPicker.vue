<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { GoogleMap } from 'vue3-google-map'

const { googleMapsApiKey } = useRuntimeConfig().public
const { coords, resume, pause } = useGeolocation({ immediate: false, enableHighAccuracy: true })
const mapId = 'bca681cd186f5d7d'
const lat = defineModel('lat', { type: [Number, null] as PropType<number | null> })
const lng = defineModel('lng', { type: [Number, null] as PropType<number | null> })

const location = computed(() => ({ lat: lat.value, lng: lng.value }))
const draftLocation = ref()

onBeforeUnmount(() => {
  pause()
})

const center = computed(() => {
  if (location.value.lat && location.value.lng)
    return { lat: location.value.lat, lng: location.value.lng } as google.maps.LatLngLiteral

  if (!coords.value.latitude || coords.value.latitude === Number.POSITIVE_INFINITY || !coords.value.longitude || coords.value.longitude === Number.POSITIVE_INFINITY)
    return { lat: 44.52253832168663, lng: 26.006091098242493 }

  return { lat: coords.value.latitude, lng: coords.value.longitude }
})

const showMap = ref(false)
const mapRef = ref()

function handleOpenMapDialog() {
  resume()
  showMap.value = true
}

function handleConfirmLocation() {
  showMap.value = false
  lat.value = draftLocation.value.lat
  lng.value = draftLocation.value.lng
  pause()
}

function handleChangeLocation() {
  resume()
  showMap.value = true
  draftLocation.value = null
}

watch(() => mapRef.value?.ready, (ready) => {
  if (!ready)
    return
  mapRef.value.map.addListener('center_changed', () => {
    draftLocation.value = mapRef.value.map.getCenter().toJSON()
  })
})
</script>

<template>
  <div>
    <div v-if="location.lat && location.lng" class="relative">
      <LocationViewer
        :latitude="location.lat"
        :longitude="location.lng"
        :zoom="16"
        :width="600"
        :height="300"
        class="h-full"
      />
      <UButton label="Schimbă locația" variant="outline" class="mt-2" @click="handleChangeLocation" />
    </div>
    <div v-else>
      <UButton label="Selectează locația" @click="handleOpenMapDialog" />
    </div>

    <!-- Modal Dialog for Google Maps -->
    <UModal v-model:open="showMap">
      <template #content>
        <div class="p-4">
          <MarkerLocation class="absolute inset-x-[calc(50%-17px)] inset-y-[calc(50%-41px)] z-10" />
          <GoogleMap
            ref="mapRef"
            :api-key="googleMapsApiKey"
            :center="center"
            :zoom="16"
            class="flex h-[600px] max-h-[75svh]"
            :map-id="mapId"
          />
          <UButton label="Confirmă locația" block class="mt-2" @click="handleConfirmLocation" />
        </div>
      </template>
    </UModal>
  </div>
</template>
