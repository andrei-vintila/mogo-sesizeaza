<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(defineProps<Props>(), {
  zoom: 15,
  width: 400,
  height: 300,
})

const { googleMapsApiKey } = useRuntimeConfig().public

interface Props {
  latitude: number
  longitude: number
  zoom?: number
  width?: number
  height?: number
  customMarkerUrl?: string
}

const staticMapUrl = computed(() => {
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
  const center = `${props.latitude},${props.longitude}`
  const size = `${props.width}x${props.height}`

  let url = `${baseUrl}?center=${center}&zoom=${props.zoom}&size=${size}&key=${googleMapsApiKey}`

  if (props.customMarkerUrl) {
    const encodedMarkerUrl = encodeURIComponent(props.customMarkerUrl)
    url += `&markers=icon:${encodedMarkerUrl}|${center}`
  }
  else {
    url += `&markers=${center}`
  }

  return url
})
</script>

<template>
  <div class="relative w-full h-full">
    <img
      :src="staticMapUrl"
      :alt="`Map showing location at ${latitude},${longitude}`"
      class="w-full h-full object-cover"
    >
  </div>
</template>

<style>

</style>
