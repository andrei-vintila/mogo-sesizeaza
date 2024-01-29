<script setup>
definePageMeta({
  middleware: 'protected'
})

const { user, logout } = useUser()




const items = [[{
  label: 'Logout',
  icon: 'i-heroicons-arrow-left-on-rectangle',
  click: logout
}]]
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold leading-6">
        <NuxtLink to="/">
          Todo List
        </NuxtLink>
      </h3>

      <UDropdown v-if="user" :items="items">
        <UButton color="white" trailing-icon="i-heroicons-chevron-down-20-solid">
          <UAvatar :src="user.profilePictureUrl" :alt="user.githubUsername" size="3xs" />
          {{ user.githubUsername }}
        </UButton>
      </UDropdown>
    </template>
    <h1>
      Just testing out that everything works after login.
    </h1>
  </UCard>
</template>
