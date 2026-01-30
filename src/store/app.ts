import { setCssVar, blendColors } from '@/utils'

const BRAND_COLOR_KEY = 'app-brand-color'

const createPersistentColor = (key: string, defaultColor: string) => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  const color = ref(stored || defaultColor)
  watch(
    color,
    value => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value)
      }
    },
    { immediate: true },
  )
  return color
}

/** 修改项目主色 */
export const setAppBrandColor = (color: string): void => {
  const html = document.documentElement
  setCssVar(html, '--el-color-primary', color)
  setCssVar(html, '--el-color-primary-dark-2', blendColors('#000000', color, 0.2))
  ;[3, 5, 7, 8, 9].forEach(level => {
    const computedColor = blendColors('#ffffff', color, level / 10)
    setCssVar(html, `--el-color-primary-light-${level}`, computedColor)
  })
}

const useAppStore = defineStore('app', () => {
  const sidebar = reactive({
    bg: '#202020',
    text: '#c0c4cc',
    open: true,
    foldWidth: 48,
    expendWidth: 210,
  })
  const sidebarWidth = computed(() => (sidebar.open ? sidebar.expendWidth : sidebar.foldWidth))
  const brandColor = createPersistentColor(BRAND_COLOR_KEY, '#409eff')
  watch(brandColor, setAppBrandColor, { immediate: true })

  return { sidebar, sidebarWidth, brandColor }
})

export default useAppStore


