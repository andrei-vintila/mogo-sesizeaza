<script lang="ts" setup>
import { z } from 'zod'
import { StatusEnumSchema } from '@@/server/database/schema'
import type { FormErrorEvent, FormSubmitEvent } from '#ui/types'

defineProps<{
  isEditing?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: Schema): void
}>()

const initialData = defineModel<Schema>('initialData', { required: true })

const schema = z.object({
  id: z.string(),
  title: z.string().min(3, 'Trebuie sa aiba cel putin 3 caractere'),
  description: z.string().optional(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  status: StatusEnumSchema.optional(),
  labels: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
})

type Schema = z.infer<typeof schema>

const { user } = useUser()

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('submit', event.data)
}

function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
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

    <UForm :state="initialData" :schema="schema" class="space-y-4" @submit="onSubmit" @error="onError">
      <UFormGroup label="Titlu" name="title" required>
        <UInput v-model="initialData.title" />
      </UFormGroup>
      <UFormGroup label="Descriere" name="description">
        <UTextarea v-model="initialData.description" />
      </UFormGroup>
      <UFormGroup label="Locație" name="location">
        <LocationPicker v-model:lng="initialData.longitude" v-model:lat="initialData.latitude" />
      </UFormGroup>
      <UFormGroup label="Etichete" name="labels">
        <LabelInput v-model:sesizare-labels="initialData.labels" :sesizare-id="initialData.id" />
      </UFormGroup>
      <UButton
        type="submit" :label="isEditing ? 'Actualizează sesizarea' : 'Adaugă sesizarea'"
        :icon="!user?.id ? 'i-heroicons-lock-closed' : ''" :variant="!user?.id ? 'outline' : 'solid'"
      />
    </UForm>
  </UCard>
</template>
