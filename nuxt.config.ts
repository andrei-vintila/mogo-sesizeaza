import process from 'node:process'

export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: ['@nuxt/ui', '@vueuse/nuxt', '@pinia/nuxt', '@nuxthub/core'],
  ui: {
    icons: ['heroicons', 'simple-icons', 'mdi'],
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      googleMapsApiKey: '',
    },
    githubClientId: '',
    githubClientSecret: '',
    googleClientId: '',
    googleClientSecret: '',
    dbDefaultIdSize: 25,
  },
  nitro: {
    preset: 'cloudflare-pages',
  },
  // ssr: false,
  hub: {
    blob: true,
    database: true,
  },
})
