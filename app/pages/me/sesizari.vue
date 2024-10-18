<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'
import { storeToRefs } from 'pinia'

definePageMeta({
  middleware: 'protected',
})
const { user } = useUser()
// store initialization & fetching
const labels = useLabelsStore()
await callOnce(labels.init)

const sesizariStore = useSesizariStore()
await callOnce(async () => sesizariStore.fetchAll({ reporter: user.value?.id }))
const { sesizari } = storeToRefs(sesizariStore)

const { list, containerProps, wrapperProps } = useVirtualList(sesizari ?? [], {
  itemHeight: 181,
})

const sesizariViewState = useState('userSesizariView', () => 'list')
</script>

<template>
  <div class="">
    <div class="grid relative height-minus-header">
      <BottomBar :map-toggle="false" />
      <div v-show="sesizariViewState === 'list'" v-bind="containerProps" class="height-minus-header py-1 flex-grow">
        <div v-bind="wrapperProps" class="">
          <div v-for="sesizare in list" :key="sesizare.index" class="px-2 py-1">
            <SesizareCard :sesizare="sesizare.data" />
          </div>
        </div>
      </div>
    </div>
    <div v-show="sesizariViewState === 'map'" class="absolute top-[59px] inset-2 rounded-xl">
      <SesizariMapView class="h-full" />
    </div>
  </div>
</template>

<style scoped>
.height-minus-header {
  height: calc(100svh - 53px);
}
</style>
