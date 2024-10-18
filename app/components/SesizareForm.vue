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

const { user } = useUser()

function onSubmit(event: FormSubmitEvent<SesizareFormSchema>) {
  emit('submit', event.data)
}

function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0]?.id || '')
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
      <UFormField label="Locație" name="location">
        <LocationPicker v-model:lng="initialData.longitude" v-model:lat="initialData.latitude" />
      </UFormField>
      <UFormField label="Etichete" name="labels">
        <LabelInput v-model:sesizare-labels="initialData.labels" :sesizare-id="initialData.id" />
      </UFormField>
      <UButton
        type="submit" :label="isEditing ? 'Actualizează sesizarea' : 'Adaugă sesizarea'"
        :icon="!user?.id ? 'i-heroicons-lock-closed' : ''" :variant="!user?.id ? 'outline' : 'solid'"
      />
    </UForm>
  </UCard>
</template>
