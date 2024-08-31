<script setup lang="ts">
import { GoogleMap } from 'vue3-google-map'

const { googleMapsApiKey } = useRuntimeConfig().public
const { coords, resume, pause } = useGeolocation({ immediate: false, enableHighAccuracy: true })
const mapId = 'bca681cd186f5d7d'
const lat = defineModel('lat', { type: Number })
const lng = defineModel('lng', { type: Number })

const location = computed(() => ({ lat: lat.value, lng: lng.value }))
const draftLocation = ref()

onBeforeUnmount(() => {
  pause()
})
// Check if the location is set on the model, if not, use the geolocation, fallback to default coords.
const center = computed(() => {
  if (location.value.lat && location.value.lng)
    return { lat: location.value.lat, lng: location.value.lng } as google.maps.LatLngLiteral

  if (!coords.value.latitude || coords.value.latitude === Number.POSITIVE_INFINITY || !coords.value.longitude || coords.value.longitude === Number.POSITIVE_INFINITY)
    return { lat: 44.52253832168663, lng: 26.006091098242493 }

  return { lat: coords.value.latitude, lng: coords.value.longitude }
})
// implement logic that gets the current location of the user
const showMap = ref(false)
const mapRef = ref()

async function openMapDialog() {
  resume()
  showMap.value = true
  // pause()
}

function confirmLocation() {
  showMap.value = false
  // additional logic to handle location confirmation
  lat.value = draftLocation.value.lat
  lng.value = draftLocation.value.lng
  pause()
}

async function changeLocation() {
  resume()
  showMap.value = true
  draftLocation.value = null
}

const staticMapUrl = computed(() => {
  if (!location.value)
    return ''
  return `https://maps.googleapis.com/maps/api/staticmap?zoom=16&size=600x300&map_id=${mapId}&markers=size:mid%7Canchor:BOTTOM%7Ccolor:red%7C${location.value.lat},${location.value.lng}&key=${googleMapsApiKey}`
})

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
    <div v-if="location.lat && location.lng">
      <LocationViewer :static-map-url="staticMapUrl" />
      <UButton label="Schimbă locația" class="mt-2" variant="outline" @click="changeLocation" />
    </div>
    <div v-else>
      <UButton label="Selectează locația" @click="openMapDialog" />
    </div>

    <!-- Modal Dialog for Google Maps -->
    <UModal v-model="showMap">
      <div class="p-4">
        <!-- Google Maps will be rendered here -->
        <MarkerLocation class="absolute inset-x-[calc(50%-17px)] inset-y-[calc(50%-41px)] z-10" />
        <!-- <div ref="mapRef" class="h-[300px]" /> -->
        <GoogleMap
          ref="mapRef" :api-key="googleMapsApiKey" :center="center" :zoom="16" class="flex h-[600px] max-h-[75svh]"
          map-id="bca681cd186f5d7d"
        />
        <UButton label="Confirmă locația" block class="mt-2" @click="confirmLocation" />
      </div>
    </UModal>
  </div>
</template>
