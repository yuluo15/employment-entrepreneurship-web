<template>
  <component :is="isDark ? Sun : Moon" @click="toggle" />
</template>

<script setup lang="ts">
import { Sunny as Sun, Moon } from '@element-plus/icons-vue'

const THEME_KEY = 'app-theme'
const prefersDark =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null
const isDark = ref(prefersDark?.matches ?? false)

const applyTheme = (value: boolean) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', value)
  }
}

const toggle = () => {
  isDark.value = !isDark.value
}

watch(
  isDark,
  value => {
    applyTheme(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, value ? 'dark' : 'light')
    }
  },
  { immediate: true },
)

const handlePrefersChange = (event: MediaQueryListEvent) => {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem(THEME_KEY)) {
    isDark.value = event.matches
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else if (prefersDark) {
      isDark.value = prefersDark.matches
    }
  }
  prefersDark?.addEventListener('change', handlePrefersChange)
})

onBeforeUnmount(() => {
  prefersDark?.removeEventListener('change', handlePrefersChange)
})
</script>
