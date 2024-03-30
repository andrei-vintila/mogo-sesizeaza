<script setup lang="ts">
import { CustomMarker, GoogleMap, MarkerCluster } from 'vue3-google-map'
import { intlFormat, intlFormatDistance } from 'date-fns'

const sesizariStore = useSesizariStore()
const config = useRuntimeConfig()
const { user } = useUser()
const colorMode = useColorMode()
const mapIdBasedColorMode = computed(() =>
  colorMode.value === 'dark' ? '593a0446512e5198' : 'bca681cd186f5d7d',
)
await sesizariStore.fetchAll()
const { coords, error, resume, pause } = useGeolocation({
  immediate: false,
  enableHighAccuracy: true,
})
const defaultCoords = { lat: 44.52253832168663, lng: 26.006091098242493 }
const center = ref(defaultCoords || coords.value)
const { list, containerProps, wrapperProps } = useVirtualList(sesizariStore.sesizari ?? [], {
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
  <div class="">
    <div class="grid relative height-minus-header">
      <div class="absolute bottom-2 justify-center flex w-full z-10">
        <div
          class=" backdrop-blur-sm p-2 min-w-[50%] flex space-x-2 justify-center rounded-full dark:border-white/30 border-black/30 border-[0.5px]"
        >
          <UButton
            variant="ghost" color="gray" size="lg" :icon="toggleIcon" :label="toggleLabel"
            :ui="{ rounded: 'rounded-full' }" @click="toggleMap"
          />
          <UButton to="/sesizare/" color="black" size="lg" label="Adauga sesizare" :ui="{ rounded: 'rounded-full' }" />
          <UButton
            v-if="user" to="/me/sesizari" variant="ghost" size="lg" label="Sesizarile mele"
            :ui="{ rounded: 'rounded-full' }"
          />
        </div>
      </div>
      <div v-show="sesizariViewState === 'list'" v-bind="containerProps" class="height-minus-header py-1 flex-grow">
        <div v-bind="wrapperProps" class="">
          <div v-for="sesizare in list" :key="sesizare.index" class="px-2 py-1">
            <SesizareCard :sesizare="sesizare.data" />
          </div>
        </div>
      </div>
    </div>
    <div v-show="sesizariViewState === 'map'" class=" absolute top-[59px] inset-2 rounded-xl">
      <GoogleMap
        :center="center" :zoom="14" :map-id="mapIdBasedColorMode" class="h-full"
        :api-key="config.public.googleMapsApiKey"
      >
        <MarkerCluster>
          <CustomMarker
            v-for="sesizare in sesizari" :key="sesizare.id"
            :options="{ position: { lat: sesizare.latitude, lng: sesizare.longitude }, anchorPoint: 'BOTTOM_CENTER' }"
          >
            <Marker :id="sesizare.id" :title="sesizare.title" :votes="sesizare.votes" />
          </CustomMarker>
        </MarkerCluster>
      </GoogleMap>
    </div>
  </div>
</template>

<style>
 .height-minus-header {
   height: calc(100svh - 53px);
 }
</style>
