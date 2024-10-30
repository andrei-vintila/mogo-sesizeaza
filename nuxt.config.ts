import process from 'node:process'

export default defineNuxtConfig({
  extends: [
    'github:andrei-vintila/nuxt-hub-auth',
  ],
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
    publicKey: process.env.POSTHOG_PUBLIC_KEY,
    clientOptions: {
      ui_host: 'https://eu.posthog.com',
    },
    host: `${process.env.BASE_URL || 'http://localhost:3000'}/ingest`,
  },

  nitro: {
    preset: 'cloudflare-pages',
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
