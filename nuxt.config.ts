import process from 'node:process'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vueuse/nuxt'],
  ui: {
    icons: ['heroicons', 'simple-icons', 'mdi'],
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
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
  ssr: false,
})
