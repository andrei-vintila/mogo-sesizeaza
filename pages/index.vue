<script setup lang="ts">
const { user } = useUser()
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold leading-6">
        Todo List
      </h3>
      <UButton
        v-if="!user"
        to="/api/auth/login/github"
        icon="i-simple-icons-github"
        label="Login with GitHub"
        color="black"
        external
      />
      <UButton
        v-else
        to="/todos"
        icon="i-heroicons-list-bullet"
        label="Go to Todos"
        color="black"
      />
    </template>
    <p class="font-medium">
      Welcome to Nuxt Todos Edge.
    </p>
    <hr class="dark:border-gray-700">
    <p class="text-sm text-gray-700 dark:text-gray-300 italic">
      No personal informations regarding your GitHub account are stored in database.<br>
      We store only the todos created linked with your GitHub ID.
    </p>
  </UCard>
</template>
