<script setup lang="ts">
import { GoogleMap, Marker } from 'vue3-google-map'

const { googleMapsApiKey } = useRuntimeConfig()
const { coords, locatedAt, error, resume, pause } = useGeolocation()
const defaultCoords = { lat: 44.52253832168663, lng: 26.006091098242493 }
const center = ref(defaultCoords || coords.value)

// implement logic that gets the current location of the user
const showMap = ref(false)

// Replace with your Google Maps API Key
const loader = new Loader({
  apiKey: 'YOUR_API_KEY',
  version: 'weekly',
})

async function openMapDialog() {
  showMap.value = true
  initMap()
}
let map
function initMap() {
  const { Map } = await loader.importLibrary('maps')
  map = new Map(document.getElementById('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  })

  // Add click event to update location
  map.addListener('click', (e) => {
    location.value = e.latLng.toJSON()
  })
}

function confirmLocation() {
  showMap.value = false
  // additional logic to handle location confirmation
}

function changeLocation() {
  location.value = null
}

const staticMapUrl = computed(() => {
  if (!location.value)
    return ''
  return `https://maps.googleapis.com/maps/api/staticmap?center=${location.value.lat},${location.value.lng}&zoom=13&size=600x300&maptype=roadmap
&markers=color:red%7Clabel:C%7C${location.value.lat},${location.value.lng}&key=YOUR_API_KEY`
})
</script>

<template>
  <div>
    <div v-if="location">
      <img :src="staticMapUrl" alt="Location Map">
      <button @click="changeLocation">
        Change Location
      </button>
    </div>
    <div v-else>
      <UButton label="Selecteaza locatia" @click="openMapDialog" />
    </div>

    <!-- Modal Dialog for Google Maps -->
    <UModal>
      <!-- Google Maps will be rendered here -->
      <GoogleMap :api-key="googleMapsApiKey" :center="center" :zoom="8" />
      <UButton label="Confirma locatia" @click="confirmLocation" />
    </UModal>
  </div>
</template>
