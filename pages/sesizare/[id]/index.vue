<script lang="ts" setup>
import { format as formatDate } from '@formkit/tempo'

const id = useRoute().params.id
const languages = usePreferredLanguages()
const sesizare = await $fetch(`/api/sesizari/${id}`)
</script>

<template>
  <Suspense>
    <div class="overflow-hidden shadow sm:rounded-lg">
      <div class="px-4 py-6 sm:px-6">
        <h3 class="text-base font-semibold leading-7 ">
          Sesizare
        </h3>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Detalii despre sesizare.
        </p>
      </div>
      <div class="border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium">
              Titlu
            </dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ sesizare.title }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium ">
              Descriere detaliata
            </dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ sesizare.description }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium ">
              Locatie
            </dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ sesizare.latitude }}, {{ sesizare.longitude }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium ">
              Raportat de
            </dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ sesizare.reporterName }}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium ">
              Raportat la
            </dt>
            <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {{ formatDate(sesizare.createdAt, { date: 'long', time: 'short' }, languages[0]) }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </Suspense>
</template>
