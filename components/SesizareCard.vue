<script lang="ts" setup>
import { intlFormat, intlFormatDistance } from 'date-fns'
import type { SesizareCard } from '~/types/sesizare'

defineProps({
  sesizare: {
    type: Object as PropType<SesizareCard>,
    required: true,
  },
})
</script>

<template>
  <UCard :title="sesizare.title">
    <template #header>
      <div class="flex flex-col gap-y-2">
        <div class="flex flex-grow justify-between w-auto">
          <div class="flex gap-y-2">
            <div class="flex space-x-3 items-center">
              <StatusBadge :status="sesizare.status" class="h-6 w-6" />
              <h2 class="md:text-lg text-md font-semibold leading-6 underline hover:text-primary">
                <ULink :to="`/sesizare/${sesizare.id}`" class="truncate overflow-ellipsis">
                  {{ sesizare.title }}
                </ULink>
              </h2>
            </div>
          </div>
          <div>
            <VoteButton :id="sesizare.id" :votes="sesizare.votes" :voted="Boolean(sesizare.voted)" />
          </div>
        </div>

        <div class="inline-flex items-center  gap-x-2">
          <UTooltip
            :text="intlFormat(sesizare.createdAt, {
              dateStyle: 'long',
              timeStyle: 'short',
            }, { locale: 'ro' })"
          >
            <span class="text-sm text-gray-500 dark:text-gray-300 pr-1">Creat</span>
            <time class="text-sm text-gray-500 dark:text-gray-300"> {{ intlFormatDistance(sesizare.createdAt, new
              Date(), { locale: 'ro' }) }}</time>
          </UTooltip>
          <svg viewBox="0 0 2 2" class="h-1 w-1 fill-gray-500 dark:fill-gray-300">
            <circle cx="1" cy="1" r="1" />
          </svg>
          <UAvatar size="xs" :alt="sesizare.reporterName" />
        </div>
      </div>
    </template>
    <div class="flex flex-row justify-between">
      <div class="flex flex-col space-y-2">
        <p class="text-sm ">
          {{ sesizare.description }}
        </p>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="label in sesizare.labels" :key="label" variant="outline" color="gray"
            :label="label"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
