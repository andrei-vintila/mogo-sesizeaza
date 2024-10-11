export default defineAppConfig({
  ui: {
    primary: 'emerald',
    container: {
      base: 'max-w-3xl',
    },
    button: {
      slots: {
        base: ['rounded-full'],
      },
    },
    input: {
      slots: {
        root: 'w-full',
      },
    },
  },
  mapStyle: {
    lightMapId: 'bca681cd186f5d7d',
    darkMapId: '593a0446512e5198',
  },
})
