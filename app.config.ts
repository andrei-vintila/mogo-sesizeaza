export default defineAppConfig({
  ui: {
    primary: 'emerald',
    container: {
      constrained: 'max-w-2xl',
    },
    button: {
      rounded: 'rounded-full',
    },
    card: {

      body: {
        base: 'space-y-4',
      },
    },
    dropdown: {
      width: 'w-full',
      popper: {
        strategy: 'absolute',
      },
    },
  },
  mapStyle: {
    lightMapId: 'bca681cd186f5d7d',
    darkMapId: '593a0446512e5198',
  },
})
