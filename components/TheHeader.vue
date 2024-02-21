<script lang="ts" setup>
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const links = [
  [
    {
      label: 'Sesizari',
      to: '/',
    },
  ],
  [
    {
      icon: colorMode.value === 'dark' ? 'i-heroicons-sun-20-solid' : 'i-heroicons-moon-20-solid',
      click: toggleColorMode,
    },
  ],
]
</script>

<template>
  <UHorizontalNavigation :links="links" />
</template>
