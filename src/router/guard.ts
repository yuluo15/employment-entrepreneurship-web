import type { Router } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { APP_TITLE } from '@/constants'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 白名单
const whiteList = ['/login', '/register', '/404', '/401', '/403']

// 角色映射表：后端中文名称 -> 路由 meta 中的英文 Key
// 必须和你 menu.ts 定义的一致
const ROLE_NAME_MAP: Record<string, string> = {
  'ROLE_ADMIN': 'admin',
  'ROLE_STUDENT': 'student',
  'ROLE_COMPANY': 'company',
  'ROLE_SCHOOL': 'school',
}

const setupRouterGuard = (router: Router): void => {
  router.beforeEach((to, from, next) => {
    NProgress.start()
    const userStore = useUserStore()

    if (userStore.token) {
      if (to.path === '/login') {
        // 1. 已登录用户访问登录页 -> 踢回首页
        const role = userStore.role
        // 如果后端返回的角色不在映射表中，默认回个首页或报错，防止死循环
        const roleKey = ROLE_NAME_MAP[role] || 'student'
        next(`/${roleKey}/home`)
        NProgress.done()
      } else {
        // 2. 【核心逻辑】权限校验

        // 查找目标路由（包含父级）中是否有 role 限制
        // to.matched 是一个数组，包含从父到子的所有路由记录
        const requiredRole = to.matched.find(record => record.meta?.role)?.meta?.role

        // 如果该页面配置了角色限制
        if (requiredRole) {
          // 将当前用户的中文角色（'管理员'）转为英文 Key ('admin')
          const currentRoleKey = ROLE_NAME_MAP[userStore.role]

          // 比对：如果当前角色 不等于 目标需要的角色
          if (currentRoleKey !== requiredRole) {
            // 无权访问 -> 重定向到 403 页面
            next('/403')
          } else {
            // 权限匹配 -> 放行
            next()
          }
        } else {
          // 如果该页面没有配置 role (比如公共页面) -> 放行
          next()
        }
      }
    } else {
      // 3. 未登录逻辑
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next('/login')
      }
    }
  })

  router.afterEach((to) => {
    NProgress.done()
    document.title = to.meta?.title ? `${to.meta.title} | ${APP_TITLE}` : APP_TITLE
  })
}

export default setupRouterGuard