<script lang="ts" setup>
const colorMode = useColorMode()
const { user } = useUser()

function toggleColorMode() {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const mobileMenuOpen = ref(false)

const links = [
  {
    label: 'Sesizari',
    to: '/sesizari',
  },
  {
    label: 'Despre',
    to: '/despre',
  },
]
</script>

<template>
  <header>
    <nav class="mx-auto flex items-center justify-between pt-2 px-2" aria-label="Global">
      <div class="flex md:flex-1">
        <a href="#" class="-m-1.5 p-1.5">
          <span class="sr-only">Your Company</span>
          <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="">
        </a>
      </div>
      <UButton
        color="gray" variant="ghost" size="xl" icon="i-heroicons-bars-3" class="md:hidden" @click="mobileMenuOpen = true"
      />
      <div class="hidden md:flex md:gap-x-4 px-2 py-1.5 rounded-full dark:border-white/30 border-black/30 border-[0.5px]">
        <UButton v-for="item in links" :key="item.to" active-class="text-primary" variant="ghost" color="gray" :title="item.label" :to="item.to">
          {{ item.label }}
        </UButton>
      </div>
      <div class="hidden md:flex md:flex-1 md:justify-end space-x-2">
        <UButton :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'" variant="ghost" color="gray" size="lg" @click="toggleColorMode" />
        <UButton size="lg" to="/login" variant="ghost" label="Log in" />
      </div>
    </nav>
    <USlideover v-model="mobileMenuOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', rounded: '', shadow: '' }">
        <template #header>
          <h2 class="text-lg font-semibold leading-6">
            Menu
          </h2>
          <UButton variant="ghost" color="gray" size="lg" icon="i-heroicons-x-mark" @click="mobileMenuOpen = false" />
        </template>
        <div class="flex flex-col space-y-4 h-full">
          <UButton v-for="item in links" :key="item.label" :label="item.label" color="gray" size="xl" variant="ghost" :to="item.to" class="-ml-3" />
          <UDivider />
          <UButton label="Log in" to="/login" variant="ghost" size="xl" class="-ml-3" />
        </div>
      </UCard>
    </USlideover>
  </header>
</template>
