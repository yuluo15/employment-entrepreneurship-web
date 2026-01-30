<template>
  <component :is="isFullscreen ? ExitFullScreen : FullScreen" @click="toggle" />
</template>

<script setup lang="ts">
import { FullScreen, CopyDocument as ExitFullScreen } from '@element-plus/icons-vue'

const isClient = typeof document !== 'undefined'
const isFullscreen = ref(isClient ? Boolean(document.fullscreenElement) : false)
const syncFullscreen = () => {
  if (!isClient) return
  isFullscreen.value = Boolean(document.fullscreenElement)
}
const toggle = async () => {
  if (!isClient) return
  if (document.fullscreenElement) {
    await document.exitFullscreen()
  } else {
    await document.documentElement.requestFullscreen()
  }
}

onMounted(() => {
  if (!isClient) return
  document.addEventListener('fullscreenchange', syncFullscreen)
})
onBeforeUnmount(() => {
  if (!isClient) return
  document.removeEventListener('fullscreenchange', syncFullscreen)
})
</script>
