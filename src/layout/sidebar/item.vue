<template>
  <div v-if="!route.meta?.hidden">
    <el-sub-menu v-if="route.children?.length" :index="route.fullPath">
      <template #title>
        <component v-if="route.meta?.icon" :is="route.meta.icon" class="app-sidebar-icon" :size="18" />
        <span class="ml-2 truncate" :title="route.meta.title">
          {{ route.meta?.title ?? '暂无标题' }}
        </span>
      </template>
      <SidebarItem v-for="item in route.children" :key="item.fullPath" :route="item" />
    </el-sub-menu>
    <el-menu-item v-else :index="route.fullPath">
      <component v-if="route.meta?.icon" :is="route.meta.icon" class="app-sidebar-icon" :size="18" />
      <template #title>
        <span class="ml-2 truncate" :title="route.meta.title">
          {{ route.meta?.title ?? '暂无标题' }}
        </span>
      </template>
    </el-menu-item>
  </div>
</template>

<script setup lang="ts">
import type { SidebarMenuItem } from '@/router/menu'

defineOptions({ name: 'SidebarItem' })
defineProps<{
  route: SidebarMenuItem
}>()
</script>
