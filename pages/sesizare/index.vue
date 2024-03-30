<script lang="ts" setup>
import { format as formatDate } from '@formkit/tempo'

import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const { user } = useUser()
const languages = usePreferredLanguages()

const schema = z.object({
  title: z.string().min(3, 'Trebuie sa aiba cel putin 3 caractere'),
  description: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  labels: z.array(z.string()).optional(),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  title: '',
  description: '',
  latitude: 0,
  longitude: 0,
})
const breadcrumbs = computed(() => [
  { label: 'Sesizari', to: '/' },
  { label: state.title || 'Adauga noua sesizare' },
])
async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with data
  console.log(event.data)
}
</script>

<template>
  <div class="mt-2 flex flex-col gap-2">
    <UBreadcrumb :links="breadcrumbs" />
    <UCard class="overflow-hidden border border-gray-100 dark:border-gray-800 sm:rounded-lg">
      <template #header>
        <div class="flex justify-between">
          <h3 class="text-base font-semibold leading-7 ">
            Sesizare
          </h3>
        </div>
      </template>

      <UForm :state="state" :schema="schema" class="space-y-4">
        <UFormGroup label="Titlu" name="title" required>
          <UInput v-model="state.title" />
        </UFormGroup>
        <UFormGroup label="Descriere" name="description">
          <UTextarea v-model="state.description" />
        </UFormGroup>
        <UFormGroup label="Etichete" name="labels">
          <UInput v-model="state.labels" />
        </UFormGroup>
      </UForm>
    </UCard>
  </div>
</template>
