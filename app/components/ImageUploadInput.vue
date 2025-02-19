<script setup lang="ts">
import { useDropZone, useFileDialog } from '@vueuse/core'

const props = defineProps<{
  existingMedia?: string[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'deleteMedia', url: string): void
}>()

const media = defineModel<File[]>({ default: () => [] })
const dropZoneRef = ref<HTMLDivElement>()
const containerRef = ref<HTMLDivElement>()

const { open, onChange } = useFileDialog({
  accept: 'image/*,video/*',
  multiple: true,
})

function onDrop(newFiles: File[] | null) {
  if (newFiles) {
    media.value = [...media.value, ...newFiles]
  }
}

onChange((newFiles: FileList | null) => {
  if (newFiles) {
    media.value = [...media.value, ...Array.from(newFiles)]
  }
})

function removeFile(index: number) {
  media.value.splice(index, 1)
}

function removeExistingMedia(url: string) {
  // Extract the pathname from the URL (remove /api/images/ prefix)
  const pathname = url.replace('/api/images/', '')
  emit('deleteMedia', pathname)
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  dataTypes: ['image/png', 'image/jpeg', 'image/webp'],
})

const previewUrls = computed(() => [
  ...(props.existingMedia?.map(url => ({
    url: `/api/images/${url}`,
    originalUrl: url,
    type: 'image',
    isExisting: true,
  })) || []),
  ...media.value.map(file => ({
    url: URL.createObjectURL(file),
    originalUrl: '',
    type: file.type.startsWith('image/') ? 'image' : 'video',
    isExisting: false,
  })),
])

onBeforeUnmount(() => {
  previewUrls.value
    .filter(preview => !preview.isExisting)
    .forEach(preview => URL.revokeObjectURL(preview.url))
})

const isImage = (type: string) => type === 'image'

const visibleItemsCount = ref(0)
const showAdditionalCount = ref(false)

const additionalMediaCount = computed(() => Math.max(0, previewUrls.value.length - visibleItemsCount.value))

function updateVisibleItems() {
  if (!containerRef.value)
    return
  const containerWidth = containerRef.value.offsetWidth
  const itemWidth = 112 // Width of each item
  const gap = 16 // Gap between items
  const addButtonWidth = itemWidth // Always consider the "Add more" button

  // Calculate available width for preview items
  const availableWidth = containerWidth - addButtonWidth - gap

  // Calculate max items that can fit, including space for "+more" if needed
  let maxItems = Math.floor((availableWidth + gap) / (itemWidth + gap))

  // If we can't fit all items, reserve space for "+more"
  if (maxItems < previewUrls.value.length) {
    maxItems = Math.max(1, maxItems - 1) // Ensure at least one preview is shown
  }

  visibleItemsCount.value = Math.min(maxItems, previewUrls.value.length)
  showAdditionalCount.value = visibleItemsCount.value < previewUrls.value.length
}

onMounted(() => {
  updateVisibleItems()
  window.addEventListener('resize', updateVisibleItems)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateVisibleItems)
})

watch(media, updateVisibleItems)
watch(() => props.existingMedia, updateVisibleItems)
</script>

<template>
  <div ref="containerRef" class="relative">
    <div class="flex flex-wrap gap-4">
      <UButton
        ref="dropZoneRef"
        variant="ghost"
        :color="isOverDropZone ? 'info' : 'neutral'"
        class="transition-colors duration-200 group rounded-lg border-2 border-dashed border-neutral-200 flex-grow-0 flex-shrink-0"
        :class="{
          'w-full h-28': !previewUrls.length,
          'size-28': previewUrls.length > 0,
        }"
        :disabled="disabled"
        @click="open()"
      >
        <div class="w-full h-full flex items-center justify-center">
          <div class="flex flex-col w-full justify-center items-center">
            <UIcon
              name="i-heroicons-arrow-up-tray"
              class="w-6 h-6 mb-2"
            />
            <span class="text-center">{{ previewUrls.length > 0 ? 'Incarca' : 'Incarca poze care ajuta la clarificarea problemei' }}</span>
            <span v-if="!previewUrls.length" class="text-xs mt-1 text-center">Formate acceptate: JPEG, PNG, WebP</span>
          </div>
        </div>
      </UButton>
      <template v-if="previewUrls.length > 0">
        <div
          v-for="(preview, index) in previewUrls.slice(0, visibleItemsCount)"
          :key="preview.url"
          class="relative size-28 rounded overflow-hidden flex-grow-0 flex-shrink-0"
        >
          <img
            v-if="isImage(preview.type)"
            :src="preview.url"
            :alt="`Preview ${index + 1}`"
            class="w-full h-full object-cover"
          >
          <video
            v-else
            :src="preview.url"
            class="w-full h-full object-cover"
            controls
          />
          <UButton
            color="error"
            variant="outline"
            icon="i-heroicons-trash"
            size="xs"
            class="absolute bottom-2 right-2"
            @click="preview.isExisting ? removeExistingMedia(preview.url) : removeFile(index)"
          />
        </div>
        <div
          v-if="showAdditionalCount"
          class="relative size-28 rounded overflow-hidden flex-grow-0 flex flex-shrink bg-neutral-100 dark:bg-neutral-800/20 items-center justify-center"
        >
          <span class="text-sm font-semibold">+{{ additionalMediaCount }} more</span>
        </div>
      </template>
    </div>
  </div>
</template>
