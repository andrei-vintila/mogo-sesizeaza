import process from 'node:process'

export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxthub/core',
    'nuxt-posthog',
    'nuxt-auth-utils',
    '@nuxt/test-utils/module',
  ],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      googleMapsApiKey: '',
    },
    githubClientId: '',
    githubClientSecret: '',
    googleClientId: '',
    googleClientSecret: '',
    facebookClientId: '',
    facebookClientSecret: '',
    dbDefaultIdSize: 25,

  },
  posthog: {
    clientOptions: {
      ui_host: 'https://eu.posthog.com',
    },
    publicKey: 'phc_8jEcKWON11hBZBXqG6W3CmgddZO3OKrKZG8iKAiDr7W',
  },
  $development: {
    posthog: {
      host: 'http://localhost:3000/ingest',
    },
  },
  $production: {
    posthog: {
      host: 'https://mogo-sesizeaza.pages.dev/ingest',
      clientOptions: {
        mask_all_text: true,
      },
    },
  },

  nitro: {
    experimental: {
      tasks: true,
      openAPI: true,
    },
  },
  logLevel: 'verbose',
  ssr: true,
  hub: {
    database: true,
    blob: true,
  },

  compatibilityDate: '2024-07-27',
  future: {
    compatibilityVersion: 4,
  },
  routeRules: {
    '/ingest/static/**': { proxy: 'https://eu-assets.i.posthog.com/static/**' },
    '/ingest/**': { proxy: 'https://eu.i.posthog.com/**' },
  },
})
