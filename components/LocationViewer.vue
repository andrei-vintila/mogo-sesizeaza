<script lang="ts" setup>
const props = defineProps<{
  staticMapUrl: string
}>()
</script>

<template>
  <div>
    <img :src="props.staticMapUrl" alt="Location Map">
    <MarkerLocation class="absolute inset-x-[calc(50%-17px)] inset-y-[calc(50%-41px)] z-10" />
  </div>
</template>

<style>

</style>
