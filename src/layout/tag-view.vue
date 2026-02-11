<template>
  <nav class="tag-view">
    <el-tabs :model-value="$route.path" type="card" @tab-click="onClick" @tab-remove="onRemove">
      <el-tab-pane v-for="item in tabs" :key="item.fullPath" :name="item.fullPath" :closable="!item.meta?.affix">
        <template #label>
          <div class="tag-label" @contextmenu.prevent="openMenu($event, item)">
            {{ item.meta?.title ?? '暂无标题' }}
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <teleport to="body">
      <transition name="fade">
        <ul
          v-if="contextMenu.visible && contextMenu.tab"
          class="tag-context-menu"
          :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        >
          <li @click="handleMenuAction(() => refreshTab(contextMenu.tab!))">
            <RefreshRight class="tag-context-menu__icon" />
            刷新
          </li>
          <li @click="handleMenuAction(() => onRemove(contextMenu.tab!.fullPath))">
            <Close class="tag-context-menu__icon" />
            关闭
          </li>
          <li @click="handleMenuAction(() => closeOther(contextMenu.tab!))">
            <SwitchButton class="tag-context-menu__icon" />
            关闭其它
          </li>
          <li @click="handleMenuAction(closeAll)">
            <CircleCloseFilled class="tag-context-menu__icon" />
            关闭所有
          </li>
        </ul>
      </transition>
    </teleport>
  </nav>
</template>

<script setup lang="ts">
import { APP_TAG_HEIGHT } from '@/constants'
import useTabStore, { getInitTabs, type TabView } from '@/store/tabs'
// import { watch, onMounted, onBeforeUnmount, reactive } from 'vue' // 确保引入 watch
import bus from '@/utils/bus'
import { ROLE_BASE_PATH } from '@/router/menu'
import { CircleCloseFilled, Close, RefreshRight, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/userStore'

defineOptions({ name: 'TagView' })
const store = useTabStore()
const userStore = useUserStore()
const { tabs } = storeToRefs(store)
const router = useRouter()
const route = useRoute()

// 根据当前用户角色获取首页路径
const getHomePath = () => {
  const role = userStore.role || 'admin'
  return `${ROLE_BASE_PATH[role as keyof typeof ROLE_BASE_PATH]}/home`
}

// bus.on('ROUTE_CHANGE', route => {
//   store.add(route)
// })
watch(
    () => route.fullPath,
    () => {
      store.add(route)
    }
)
const onClick = pane => {
  router.push(pane.paneName)
}
const onRemove = path => {
  store.remove(path)
}
const closeAll = () => {
  const role = userStore.role || 'admin'
  // 只保留 affix 的标签（固定标签）
  tabs.value = tabs.value.filter(tab => tab.meta?.affix)
  // 如果没有固定标签，则重新初始化
  if (tabs.value.length === 0) {
    tabs.value = getInitTabs(role as any)
  }
  // 跳转到第一个固定标签（通常是首页）
  const affixTab = tabs.value.find(tab => tab.meta?.affix)
  if (affixTab) {
    router.push(affixTab.fullPath)
  } else {
    router.push(getHomePath())
  }
}
const closeOther = tab => {
  // 如果点击的是固定标签，则关闭所有非固定标签
  if (tab.meta?.affix) {
    tabs.value = tabs.value.filter(e => e.meta?.affix)
    router.push(tab.fullPath)
    return
  }
  
  // 保留固定标签和当前点击的标签
  tabs.value = tabs.value.filter(e => e.meta?.affix || [e.path, e.fullPath].includes(tab.fullPath))
  
  // 如果当前路由不是点击的标签，则跳转到点击的标签
  if (tab.fullPath !== route.fullPath) {
    router.push(tab.fullPath)
  }
}
const refreshTab = (tab: TabView) => {
  router.push({ name: 'Redirect', query: tab.query, params: { path: tab.fullPath } })
}
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  tab: null as TabView | null,
})
const hideMenu = () => {
  contextMenu.visible = false
  contextMenu.tab = null
}
const handleMenuAction = (action: () => void) => {
  action()
  hideMenu()
}
const openMenu = (event: MouseEvent, tab: TabView) => {
  contextMenu.visible = true
  contextMenu.tab = tab
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
}
onMounted(() => {
  store.add(route)
  document.addEventListener('click', hideMenu)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', hideMenu)
})
</script>

<style lang="scss" scoped>
.tag-view {
  --el-tabs-header-height: v-bind('APP_TAG_HEIGHT + "px"');
  border-bottom: 1px solid var(--el-border-color);
  height: var(--el-tabs-header-height);

  :deep(.el-tabs) {
    --el-tabs-header-height: v-bind('APP_TAG_HEIGHT + "px"');
    .el-tabs__nav {
      border-radius: 0;
      border: none;
      border-right: 1px solid var(--el-border-color);
    }
    .el-tabs__item {
      border-bottom: none;
      .is-icon-close {
        min-width: 14px;
      }
    }
  }
}

.tag-label {
  width: 100%;
  font-size: 14px;
  font-weight: 400;
  user-select: none;
}

.tag-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 140px;
  padding: 6px 0;
  border-radius: 6px;
  background-color: var(--el-bg-color-overlay);
  box-shadow: var(--el-box-shadow-light);
  border: 1px solid var(--el-border-color);
  list-style: none;
  color: var(--el-text-color-primary);

  li {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    cursor: pointer;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  &__icon {
    width: 16px;
    height: 16px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
