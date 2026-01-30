<template>
  <div class="size-8 flex-center p-1 rounded cursor-pointer hover:bg-gray-2" @click="toggle">
    <Fold :size="18" :style="{ transform: `rotate(${store.sidebar.open ? 0 : 180}deg)`, transition: '0.3s' }" />
  </div>
</template>

<script setup lang="ts">
import { Fold } from '@element-plus/icons-vue'
import useAppStore from '@/store/app'

const store = useAppStore()
const toggle = () => {
  store.sidebar.open = !store.sidebar.open
}
</script>
