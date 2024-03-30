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
})
