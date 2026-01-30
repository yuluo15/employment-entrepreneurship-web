import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { buildSidebarMenus, DEFAULT_HOME_PATH, DEFAULT_ROLE, type SidebarMenuItem } from '@/router/menu'

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
      if (route.meta?.affix) {
        list.push({
          path: route.fullPath,
          fullPath: route.fullPath,
          meta: route.meta,
          query: {},
          params: {},
          name: route.name,
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

export const getInitTabs = (): TabView[] => {
  const menus = buildSidebarMenus(DEFAULT_ROLE)
  return collectAffixTabs(menus)
}

const useTabStore = defineStore(
  'tabs',
  () => {
    const route = useRoute()
    const router = useRouter()

    const tabs = ref<TabView[]>(getInitTabs())
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
        router.push(fallback?.fullPath ?? DEFAULT_HOME_PATH)
      }
      return removed
    }

    // 【新增】重置 Tabs 的方法
    const reset = () => {
      tabs.value = getInitTabs()
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


