export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  ui: {
    icons: ['heroicons', 'simple-icons'],
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
    logLevel: '5'
  }
})
