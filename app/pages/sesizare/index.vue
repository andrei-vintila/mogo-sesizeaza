<script lang="ts" setup>
import type { FormErrorEvent } from '#ui/types'
import { sesizareFormSchema } from '@@/utils/forms/sesizareSchema'
import { useSesizareForm } from '~/composables/useSesizareForm'

const { formState, handleMediaChange, handleSubmit } = useSesizareForm()
const { user } = useUser()

const breadcrumbs = computed(() => [
  { label: 'Sesizari', to: '/' },
  { label: formState.value.title || 'Adauga noua sesizare' },
])

async function onSubmit() {
  try {
    await handleSubmit()
    navigateTo('/')
  }
  catch (error) {
    console.error(error)
  }
}

async function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0]?.id || '')
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div class="mt-2 flex flex-col gap-2">
    <UBreadcrumb :items="breadcrumbs" />
    <UCard class="overflow-hidden border border-gray-100 dark:border-gray-800 sm:rounded-lg">
      <template #header>
        <div class="flex justify-between">
          <h3 class="text-base font-semibold leading-7">
            Sesizare
          </h3>
        </div>
      </template>

      <UForm :state="formState" :schema="sesizareFormSchema" class="space-y-4" @submit="onSubmit" @error="onError">
        <UFormField label="Titlu" name="title" required>
          <UInput v-model="formState.title" />
        </UFormField>
        <UFormField label="Descriere" name="description">
          <UTextarea v-model="formState.description" :rows="4" autoresize class="w-full" />
        </UFormField>
        <UFormField label="Imagini" name="images">
          <ImageUploadInput v-model="formState.mediaFiles" @update:model-value="handleMediaChange" />
        </UFormField>
        <UFormField label="Locație" name="location">
          <LocationPicker
            v-model:lng="formState.longitude"
            v-model:lat="formState.latitude"
          />
        </UFormField>
        <UFormField label="Etichete" name="labels">
          <LabelInput v-model:sesizare-labels="formState.labels" :sesizare-id="formState.id" />
        </UFormField>
        <UButton type="submit" label="Adaugă sesizarea" :icon="!user?.id ? 'i-heroicons-lock-closed' : ''" />
      </UForm>
    </UCard>
  </div>
</template>
