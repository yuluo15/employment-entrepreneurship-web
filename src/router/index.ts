import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

import Layout from '@/layout/index.vue'
import Redirect from '@/views/redirect.vue'
import Login from '@/views/login/index.vue'
import setupRouterGuard from './guard'
import MobileLayout from '@/layout/mobile/index.vue'
import TeacherLayout from '@/layout/teacher/index.vue'

import {
  DEFAULT_HOME_PATH,
  ROLE_BASE_PATH,
  ROLE_TITLES,
  roleMenus,
  type UserRole,
} from './menu'

// [修改] 定义角色与布局的映射关系
const layoutMap: Record<UserRole, any> = {
  admin: Layout,
  school: Layout,
  company: Layout,
  student: MobileLayout, // 学生端使用移动布局
  teacher: TeacherLayout // 教师端使用移动布局
}

const createRoleRoutes = (): RouteRecordRaw[] =>
  (Object.keys(roleMenus) as UserRole[]).map(role => ({
    path: ROLE_BASE_PATH[role],
    meta: { title: ROLE_TITLES[role], role },
    // component: Layout,
    component: layoutMap[role],
    children: roleMenus[role],
  }))

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: DEFAULT_HOME_PATH,
  },
  ...createRoleRoutes(),
  {
    name: 'Login',
    path: '/login',
    meta: { title: '登录', hidden: true },
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    meta: { title: '企业入驻注册', hidden: true },
    component: () => import('@/views/register/index.vue')
  },
  {
    name: 'Redirect',
    path: '/redirect/:path',
    meta: { title: '加载中..', hidden: true },
    component: Redirect,
  },
  {
    path: '/403',
    name: 'NoPermission',
    meta: { title: '无权限', hidden: true },
    component: () => import('@/views/error/403.vue'),
  },
// 建议顺手把 404 也加上（通常放在最后）：
  {
    path: '/:pathMatch(.*)*', // 匹配所有未定义的路径
    redirect: '/404', // 或者直接跳转到首页
    meta: { hidden: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

setupRouterGuard(router)

export default router


