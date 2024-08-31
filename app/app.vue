<script setup>
useHead({
  htmlAttrs: { lang: 'ro' },
  link: [{ rel: 'icon', href: '/icon.png' }],
})

// useSeoMeta({
//   viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
//   title: 'Nuxt Todos Edge',
//   description:
//     'A Nuxt demo hosted with Edge-side rendering, authentication and queyring a SQLite database',
//   ogImage: '/social-image.png',
//   twitterImage: '/social-image.png',
//   twitterCard: 'summary_large_image',
// })
</script>

<template>
  <NuxtLoadingIndicator />
  <UContainer>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UContainer>
  <UNotifications />
</template>
