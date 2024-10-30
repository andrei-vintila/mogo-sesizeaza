<script lang="ts" setup>
const colorMode = useColorMode()
const { loggedIn, user, logout } = useUser()
function toggleColorMode() {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const mobileMenuOpen = ref(false)

const publicLinks = [
  {
    label: 'Sesizari',
    to: '/sesizari',
  },
  {
    label: 'Despre',
    to: '/despre',
  },
]
const userLinks = [
  {
    label: 'Setări',
    to: '/setari',
  },
]
</script>

<template>
  <header>
    <nav class="mx-auto flex items-center justify-between pt-2 px-2" aria-label="Global">
      <div class="flex md:flex-1">
        <NuxtLink to="/" class="-m-1.5 p-1.5">
          <span class="sr-only">Mogo sesizează!</span>
          <img
            class="h-10
             w-auto" :src="colorMode.value === 'dark' ? '/logo-wide-dark.svg' : '/logo-wide.svg'" alt=""
          >
        </NuxtLink>
      </div>
      <UButton
        color="neutral" variant="ghost" size="xl" icon="i-heroicons-bars-3" class="md:hidden"
        @click="mobileMenuOpen = true"
      />
      <div
        class="hidden md:flex md:gap-x-4 px-2 py-1.5 rounded-full dark:border-white/30 border-black/30 border-[0.5px]"
      >
        <UButton
          v-for="item in publicLinks" :key="item.to" active-class="text-primary" variant="ghost" color="neutral" class="rounded-full"
          :title="item.label" :to="item.to"
        >
          {{ item.label }}
        </UButton>
      </div>
      <div class="hidden md:flex md:flex-1 md:justify-end space-x-2">
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'" variant="ghost"
          color="neutral" size="lg" padded @click="toggleColorMode"
        />
        <UButton v-if="!loggedIn" size="lg" to="/login" variant="ghost" label="Log in" class="rounded-full" />
        <UPopover v-else>
          <UButton variant="ghost" square color="neutral">
            <UAvatar :src="user?.profilePictureUrl" :alt="user?.fullName" />
          </UButton>
          <template #content>
            <div class="flex flex-col space-y-2 p-2">
              <UButton
                v-for="item in userLinks" :key="item.label" :to="item.to" variant="ghost" color="neutral" size="lg"
                :label="item.label"
              />
              <UButton label="Delogare" color="neutral" size="lg" variant="ghost" @click="logout" />
            </div>
          </template>
        </UPopover>
      </div>
    </nav>
    <USlideover v-model:open="mobileMenuOpen">
      <template #content>
        <UCard class="" :ui="{ header: 'flex justify-between', root: 'shadow-none border-none ring-0' }">
          <template #header>
            <img
              class="h-10
             w-auto" :src="colorMode.value === 'dark' ? '/logo-wide-dark.svg' : '/logo-wide.svg'" alt=""
            >
            <UButton variant="ghost" color="neutral" size="lg" icon="i-heroicons-x-mark" @click="mobileMenuOpen = false" />
          </template>
          <div class="flex flex-col space-y-2 h-full">
            <UButton
              v-for="item in publicLinks" :key="item.label" :label="item.label" color="neutral" size="lg"
              variant="ghost" :to="item.to" class="-ml-3"
            />
            <UButton v-if="!loggedIn" label="Log in" to="/login" variant="ghost" size="lg" class="-ml-3" />
            <div v-if="loggedIn" class="flex flex-col space-y-2">
              <div class="py-2 flex items-center gap-2">
                <UAvatar :src="user?.profilePictureUrl" :alt="user?.fullName" />
                <div class="text-base font-medium">
                  {{ user?.fullName }}
                </div>
              </div>
              <UButton
                v-for="item in userLinks" :key="item.label" :label="item.label" color="neutral" size="lg"
                variant="ghost" :to="item.to" class="-ml-3"
              />
              <UButton label="Delogare" color="neutral" size="lg" variant="ghost" class="-ml-3" @click="logout" />
            </div>
          </div>
        </UCard>
      </template>
    </USlideover>
  </header>
</template>
