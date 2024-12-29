<script lang="ts" setup>
import type { FormErrorEvent, FormSubmitEvent } from '#ui/types'
import type { SesizareFormSchema } from '@@/utils/forms/sesizareSchema'
import { sesizareFormSchema } from '@@/utils/forms/sesizareSchema'

defineProps<{
  isEditing?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: SesizareFormSchema): void
}>()

const initialData = defineModel<SesizareFormSchema>('initialData', { required: true })
const mediaFiles = ref<File[]>([])
const deletedMedia = ref<string[]>([])

const { user } = useUser()

const filteredExistingMedia = computed(() =>
  initialData.value.media?.filter((item): item is string =>
    typeof item === 'string' && !deletedMedia.value.includes(item),
  ) || [],
)

const upload = useUpload('/api/images/', { multiple: true, method: 'PUT' })
const isUploading = ref(false)
const uploadError = ref('')

interface UploadResult {
  pathname: string
}

async function onSubmit(event: FormSubmitEvent<SesizareFormSchema>) {
  try {
    if (mediaFiles.value.length > 0) {
      isUploading.value = true

      // Upload the files first
      const uploadResult = await upload(mediaFiles.value)
      const uploadedUrls = Array.isArray(uploadResult)
        ? (uploadResult as UploadResult[]).map(r => r.pathname)
        : [(uploadResult as UploadResult).pathname]

      // Combine existing URLs (excluding deleted ones) with new ones
      event.data.media = [
        ...(event.data.media?.filter((item): item is string =>
          typeof item === 'string' && !deletedMedia.value.includes(item),
        ) || []),
        ...uploadedUrls,
      ]
    }
    else {
      // If no new files, just filter out deleted ones
      event.data.media = event.data.media?.filter(item =>
        typeof item === 'string' && !deletedMedia.value.includes(item),
      )
    }

    // Emit the complete form data with the uploaded file URLs
    emit('submit', event.data)
  }
  catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'Upload failed'
  }
  finally {
    isUploading.value = false
  }
}

function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0]?.id || '')
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function handleMediaChange(files: File[]) {
  mediaFiles.value = files
}

function handleDeleteMedia(url: string) {
  deletedMedia.value.push(url)
}
</script>

<template>
  <UCard class="overflow-hidden border border-gray-100 dark:border-gray-800 sm:rounded-lg">
    <template #header>
      <div class="flex justify-between">
        <h3 class="text-base font-semibold leading-7">
          {{ isEditing ? 'Editare' : 'Adăugare' }} Sesizare
        </h3>
        <StatusBadge v-if="isEditing" :status="initialData.status || 'new'" class="h-6 w-6" />
      </div>
    </template>

    <UForm :state="initialData" :schema="sesizareFormSchema" class="space-y-4" @submit="onSubmit" @error="onError">
      <UFormField label="Titlu" name="title" required>
        <UInput v-model="initialData.title" />
      </UFormField>
      <UFormField label="Descriere" name="description">
        <UTextarea v-model="initialData.description" class="w-full" />
      </UFormField>
      <UFormField label="Imagine" name="media">
        <ImageUploadInput
          v-model="mediaFiles"
          :existing-media="filteredExistingMedia"
          :disabled="isUploading"
          @update:model-value="handleMediaChange"
          @delete-media="handleDeleteMedia"
        />
        <p v-if="uploadError" class="text-red-600 text-sm mt-1" role="alert">
          {{ uploadError }}
        </p>
      </UFormField>
      <UFormField label="Locație" name="location">
        <LocationPicker v-model:lng="initialData.longitude" v-model:lat="initialData.latitude" />
      </UFormField>
      <UFormField label="Etichete" name="labels">
        <LabelInput v-model:sesizare-labels="initialData.labels" :sesizare-id="initialData.id" />
      </UFormField>
      <UButton
        type="submit"
        :label="isEditing ? 'Actualizează sesizarea' : 'Adaugă sesizarea'"
        :icon="!user?.id ? 'i-heroicons-lock-closed' : ''"
        :variant="!user?.id ? 'outline' : 'solid'"
        :disabled="isUploading"
      />
    </UForm>
  </UCard>
</template>
