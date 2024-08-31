<script setup lang="ts">
definePageMeta({
  layout: 'fullscreen',
})
const { user } = useUser()
if (user.value)
  await navigateTo('/') // redirect to homepage
const colorMode = useColorMode()
</script>

<template>
  <div
    class="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        class="mx-auto h-24 w-auto"
        :src="colorMode.value === 'dark' ? '/logo-wide-dark.svg' : '/logo-wide.svg'"
        alt="Mogo sesizează! logo"
      >

      <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight">
        Loghează-te în contul tău
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] flex flex-col gap-2">
      <UButton
        label="Folosind Google"
        color="white"
        icon="i-mdi-google"
        size="lg"
        trailing
        to="/api/auth/login/google"
        external
        padded
        block
      />
      <UButton
        label="Folosind Facebook"
        color="white"
        icon="i-mdi-facebook"
        size="lg"
        trailing
        to="/api/auth/login/facebook"
        external
        padded
        block
      />
    </div>
  </div>
</template>
