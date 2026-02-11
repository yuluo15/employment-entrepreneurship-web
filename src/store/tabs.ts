import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { buildSidebarMenus, ROLE_BASE_PATH, type SidebarMenuItem, type UserRole } from '@/router/menu'
import { useUserStore } from '@/store/userStore'

export type TabView = Pick<RouteLocationNormalizedLoaded, 'path' | 'fullPath' | 'meta' | 'query' | 'params' | 'name'>

const pickTabFields = (route: RouteLocationNormalizedLoaded): TabView => ({
  path: route.path,
  fullPath: route.fullPath,
  meta: route.meta,
  query: route.query,
  params: route.params,
  name: route.name,
})

const collectAffixTabs = (items: SidebarMenuItem[]): TabView[] => {
  const list: TabView[] = []
  const traverse = (routes: SidebarMenuItem[]) => {
    routes.forEach(route => {
      const routeAny = route as any
      if (routeAny.meta?.affix) {
        list.push({
          path: route.fullPath,
          fullPath: route.fullPath,
          meta: routeAny.meta || {},
          query: {},
          params: {},
          name: routeAny.name || '',
        })
      }
      if (route.children?.length) {
        traverse(route.children)
      }
    })
  }
  traverse(items)
  return list
}

export const getInitTabs = (role: UserRole): TabView[] => {
  const menus = buildSidebarMenus(role)
  return collectAffixTabs(menus)
}

// 根据角色获取首页路径
const getHomePath = (role: string): string => {
  return `${ROLE_BASE_PATH[role as keyof typeof ROLE_BASE_PATH] || ROLE_BASE_PATH.admin}/home`
}

const useTabStore = defineStore(
  'tabs',
  () => {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()

    // 根据当前用户角色初始化标签页
    const tabs = ref<TabView[]>(getInitTabs((userStore.role || 'admin') as UserRole))
    
    const add = (tab: RouteLocationNormalizedLoaded) => {
      if (tab.meta.hidden) return
      if (tabs.value.some(e => e.fullPath === tab.fullPath)) return
      tabs.value.push(pickTabFields(tab))
      router.push(tab.fullPath)
    }
    const remove = (path: string) => {
      const index = tabs.value.findIndex(e => [e.path, e.fullPath].includes(path))
      if (index === -1) return
      const removed = tabs.value.splice(index, 1)
      if ([route.fullPath, route.path].includes(path)) {
        const fallback = tabs.value[index - 1] ?? tabs.value[0]
        router.push(fallback?.fullPath ?? getHomePath(userStore.role || 'admin'))
      }
      return removed
    }

    // 【新增】重置 Tabs 的方法，根据角色重新初始化
    const reset = (role?: UserRole) => {
      tabs.value = getInitTabs((role || userStore.role || 'admin') as UserRole)
    }

    return { tabs, add, remove, reset }
  },
  {
    persist: {
      key: 'app-tag-view-cache',
      storage: sessionStorage,
    },
  },
)

export default useTabStore


