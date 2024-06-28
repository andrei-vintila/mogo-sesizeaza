<script lang="ts" setup>
import { format as formatDate } from '@formkit/tempo'

const { user } = useUser()
const id = useRoute().params.id
const languages = usePreferredLanguages()
const { data: sesizare } = await useFetch(`/api/sesizari/${id}`)
const breadcrumbs = [
  { label: 'Sesizari', to: '/' },
  { label: sesizare?.value?.title },
]
</script>

<template>
  <div class="mt-2 flex flex-col gap-2">
    <UBreadcrumb :links="breadcrumbs" />
    <div class="overflow-hidden border border-gray-100 dark:border-gray-800 sm:rounded-lg">
      <div class="px-4 py-6 sm:px-6 ">
        <div class="flex justify-between">
          <h3 class="text-base font-semibold leading-7 ">
            Sesizare
          </h3>
          <div class="flex ">
            <VoteButton :id="sesizare.id" :votes="sesizare.votes" :voted="sesizare.voted" />
            <UButton
              v-if="user?.id === sesizare.reporter" label="Editează" :to="`/sesizare/${sesizare.id}/edit`"
              variant="ghost" color="gray" icon="i-heroicons-pencil" size="xs"
            />
          </div>
        </div>
        <p class="mt-1 max-w-2xl text-sm leading-6 ">
          {{ sesizare.title }}
        </p>
      </div>
      <div class="border-t border-gray-100 dark:border-gray-800">
        <dl class="divide-y divide-gray-100 dark:divide-gray-800">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium ">
              Descriere detaliata
            </dt>
            <dd class="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0">
              {{ sesizare.description }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium ">
              Locatie
            </dt>
            <dd class="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0">
              {{ sesizare.latitude }}, {{ sesizare.longitude }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium ">
              Raportat de
            </dt>
            <dd class="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0">
              {{ sesizare.reporterName }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium ">
              Raportat la
            </dt>
            <dd class="mt-1 text-sm leading-6  sm:col-span-2 sm:mt-0">
              {{ formatDate(sesizare.createdAt, { date: 'long', time: 'short' }, languages[0]) }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
