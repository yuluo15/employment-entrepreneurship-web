import type { RouteRecordRaw } from 'vue-router'
import {
  House, Setting, User, DataLine,
  Trophy, Bell, School, OfficeBuilding,
  UserFilled, Monitor, Lock
} from '@element-plus/icons-vue'

// ... (类型定义 UserRole, SidebarMenuItem, ROLE_BASE_PATH, ROLE_TITLES 等保持不变) ...
export type UserRole = 'admin' | 'student' | 'company' | 'school'

export interface SidebarMenuItem extends RouteRecordRaw {
  fullPath: string
  children?: SidebarMenuItem[]
}

export const ROLE_BASE_PATH: Record<UserRole, string> = {
  admin: '/admin',
  student: '/student',
  company: '/company',
  school: '/school',
}

export const ROLE_TITLES: Record<UserRole, string> = {
  admin: '省厅监管端',
  student: '学生端',
  company: '企业端',
  school: '校级管理端',
}

export const DEFAULT_ROLE: UserRole = 'admin'
export const DEFAULT_HOME_PATH = `${ROLE_BASE_PATH[DEFAULT_ROLE]}/home`

// --- 1. 超级管理员菜单 ---
const adminMenu: RouteRecordRaw[] = [
  {
    path: 'home',
    name: 'AdminHome',
    meta: { title: '平台监管', affix: true },
    component: () => import('@/views/admin/home/index.vue'),
  },

  // 系统管理
  {
    path: 'system',
    meta: { title: '系统管理'},
    redirect: '/admin/system/school',
    children: [
      {
        path: 'school',
        name: 'SysSchool',
        meta: { title: '学校管理' },
        component: () => import('@/views/admin/system/schoolManage.vue'),
      },
      {
        path: 'company',
        name: 'SysCompany',
        meta: { title: '企业管理' },
        component: () => import('@/views/admin/system/companyManage.vue'),
      },
      // 这里的字典管理后续再做，先占位
      {
        path: 'dict',
        name: 'SysDict',
        meta: { title: '字典管理' },
        component: () => import('@/views/admin/system/dictManage.vue'),
      }
    ]
  },

  // 人才数据中心
  {
    path: 'talent',
    meta: { title: '人才数据中心' },
    redirect: '/admin/talent/student',
    children: [
      {
        path: 'student',
        name: 'TalentStudent',
        meta: { title: '学生档案库' },
        component: () => import('@/views/admin/talent/studentList.vue'),
      },
      {
        path: 'teacher',
        name: 'TalentTeacher',
        meta: { title: '师资数据库' },
        component: () => import('@/views/admin/talent/teacherList.vue'),
      }
    ]
  },

  // 就业监管中心
  {
    path: 'employment',
    meta: { title: '就业监管中心' },
    children: [
      {
        path: 'stats',
        name: 'EmpStats',
        meta: { title: '就业数据统计' },
        component: () => import('@/views/admin/employment/stats/index.vue'),
      },
      {
        path: 'verify',
        name: 'EmpVerify',
        meta: { title: '就业核查督导' },
        component: () => import('@/views/icon/index.vue'),
      }
    ]
  },

  // 创新创业库
  {
    path: 'entrep',
    meta: { title: '创新创业库' },
    children: [
      {
        path: 'projects',
        name: 'EntrepProjects',
        meta: { title: '省级项目库' },
        component: () => import('@/views/icon/index.vue'),
      },
      {
        path: 'mentors',
        name: 'EntrepMentors',
        meta: { title: '创业导师资源' },
        component: () => import('@/views/icon/index.vue'),
      }
    ]
  },

  // 内容运营
  {
    path: 'operation',
    meta: { title: '内容运营' },
    children: [
      {
        path: 'notice',
        name: 'OpNotice',
        meta: { title: '通知公告' },
        component: () => import('@/views/icon/index.vue'),
      },
      {
        path: 'policy',
        name: 'OpPolicy',
        meta: { title: '政策法规' },
        component: () => import('@/views/icon/index.vue'),
      }
    ]
  },

  // 【恢复】个人中心
  {
    path: 'person',
    meta: { title: '个人中心' },
    children: [
      {
        path: 'profile',
        name: 'AdminProfile',
        meta: { title: '基本信息' },
        component: () => import('@/views/icon/index.vue'), // 后续替换为真实页面
      },
      {
        path: 'password',
        name: 'ChangePassword',
        meta: { title: '修改密码' },
        component: () => import('@/views/icon/index.vue'),
      }
    ]
  }
]

// ... (其他角色的菜单保持不变) ...
// const studentMenu: RouteRecordRaw[] = [
//   { path: 'home', name: 'StudentHome', meta: { title: '学生首页', icon: House }, component: () => import('@/views/admin/home/index.vue') }
// ]
const studentMenu: RouteRecordRaw[] = [
  {
    path: 'home',
    name: 'StudentHome',
    meta: { title: '首页', affix: true, hideNavBar: true }, // 首页通常自定义头部，隐藏默认NavBar
    component: () => import('@/views/mobile/home/index.vue')
  },
  {
    path: 'jobs',
    name: 'StudentJobs',
    meta: { title: '职位广场' },
    component: () => import('@/views/mobile/jobs/index.vue')
  },
  {
    path: 'search',
    name: 'SearchJobs',
    component: () => import('@/views/mobile/jobs/index.vue')
  },
  // [新增] 详情页路由 (hidden: true 表示不在侧边栏/菜单显示，这里用于逻辑标识)
  {
    path: 'job/:id',
    name: 'JobDetail',
    meta: { title: '职位详情', hideNavBar: true, hideTabBar: true }, // 详情页通常自定义导航栏(透明渐变等)
    component: () => import('@/views/mobile/job/detail.vue')
  },
  {
    path: 'company/:id',
    name: 'CompanyDetail',
    meta: { title: '公司详情', hideNavBar: true, hideTabBar: true }, // 公司页可以使用默认 NavBar
    component: () => import('@/views/mobile/company/detail.vue')
  },
  {
    path: 'project/:id',
    name: 'ProjectDetail',
    meta: { title: '项目详情', hideNavBar: true, hideTabBar: true },
    component: () => import('@/views/mobile/project/detail.vue')
  },
  // [新增] 创业作为一级入口，替换掉原来的消息
  {
    path: 'entrepreneurship',
    name: 'StudentEntrep',
    meta: { title: '创新创业' },
    component: () => import('@/views/mobile/home/index.vue')
  },
  {
    path: 'profile',
    name: 'StudentProfile',
    meta: { title: '个人中心' },
    component: () => import('@/views/mobile/profile/index.vue')
  },
  // 简历编辑页（通常不显示在 TabBar，可以隐藏）
  // {
  //   path: 'resume/edit',
  //   name: 'ResumeEdit',
  //   meta: { title: '编辑简历', hidden: true, hideNavBar: false },
  //   component: () => import('@/views/mobile/resume/edit.vue')
  // }
  {
    path: 'settings/account',
    name: 'AccountSettings',
    meta: { title: '账号与安全', hideNavBar: false, hideTabBar: true }, // 这里 hideNavBar: false 让页面自己控制或者使用系统默认
    component: () => import('@/views/mobile/settings/account.vue')
  },
  // [新增] 投递记录 (复用组件)
  {
    path: 'my/delivery',
    name: 'MyDelivery',
    meta: { title: '我的投递', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/delivery.vue')
  },
  {
    path: 'my/interview', // 专门的路由，指向同一个组件，方便Profile页跳转
    name: 'MyInterview',
    meta: { title: '我的面试', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/delivery.vue')
  },
  {
    path: 'my/offer',
    name: 'MyOffer',
    meta: { title: '我的OFFER', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/delivery.vue')
  },

  // [新增] 我的收藏
  {
    path: 'my/collection',
    name: 'MyCollection',
    meta: { title: '我的收藏', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/collection.vue')
  }
]
const companyMenu: RouteRecordRaw[] = [
  { path: 'home', name: 'CompanyHome', meta: { title: '企业首页', icon: House }, component: () => import('@/views/admin/home/index.vue') }
]
const schoolMenu: RouteRecordRaw[] = [
  { path: 'home', name: 'SchoolHome', meta: { title: '教务首页', icon: House }, component: () => import('@/views/admin/home/index.vue') }
]

export const roleMenus: Record<UserRole, RouteRecordRaw[]> = {
  admin: adminMenu,
  student: studentMenu,
  company: companyMenu,
  school: schoolMenu,
}

// ... (buildSidebarMenus 等辅助函数保持不变) ...
const joinPath = (parentPath: string, path: string) => {
  if (!path) return parentPath
  if (path.startsWith('/')) return path
  const base = parentPath.endsWith('/') ? parentPath : `${parentPath}/`
  return `${base}${path}`.replace(/\/+/g, '/')
}

const normalizeMenus = (routes: RouteRecordRaw[], parentPath: string): SidebarMenuItem[] =>
    routes.map(route => {
      const fullPath = joinPath(parentPath, route.path)
      const children = Array.isArray(route.children) ? route.children : []
      return {
        ...route,
        fullPath,
        children: children.length ? normalizeMenus(children, fullPath) : undefined,
      }
    })

export const buildSidebarMenus = (role: UserRole): SidebarMenuItem[] => {
  return normalizeMenus(roleMenus[role] ?? [], ROLE_BASE_PATH[role])
}
