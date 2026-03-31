import type { RouteRecordRaw } from 'vue-router'
import {
  House, Setting, User, DataLine,
  Trophy, Bell, School, OfficeBuilding,
  UserFilled, Monitor, Lock
} from '@element-plus/icons-vue'

// ... (类型定义 UserRole, SidebarMenuItem, ROLE_BASE_PATH, ROLE_TITLES 等保持不变) ...
export type UserRole = 'admin' | 'student' | 'company' | 'school' | 'teacher'

export interface SidebarMenuItem extends RouteRecordRaw {
  fullPath: string
  children?: SidebarMenuItem[]
}

export const ROLE_BASE_PATH: Record<UserRole, string> = {
  admin: '/admin',
  student: '/student',
  company: '/company',
  school: '/school',
  teacher: '/teacher',
}

export const ROLE_TITLES: Record<UserRole, string> = {
  admin: '省厅监管端',
  student: '学生端',
  company: '企业端',
  school: '校级管理端',
  teacher: '教师端',
}

export const DEFAULT_ROLE: UserRole = 'admin'
export const DEFAULT_HOME_PATH = `${ROLE_BASE_PATH[DEFAULT_ROLE]}/home`

// --- 1. 超级管理员菜单 ---
const adminMenu: RouteRecordRaw[] = [
  {
    path: 'home',
    name: 'AdminHome',
    meta: { title: '首页', affix: true },
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
  {
    path: 'employment',
    name: 'employment',
    meta: { title: '就业数据统计' },
    component: () => import('@/views/admin/employment/index.vue'),
  },
  {
    path: 'entrep',
    name: 'EntrepProjects',
    meta: { title: '创业项目库' },
    component: () => import('@/views/admin/entrep/index.vue'),
  },
  {
    path: 'jobAudit',
    name: 'jobAudit',
    meta: { title: '岗位审核' },
    component: () => import('@/views/admin/jobAudit/index.vue'),
  },
  {
    path: 'notice',
    name: 'OpNotice',
    meta: { title: '通知公告' },
    component: () => import('@/views/admin/notice/index.vue'),
  },


  // // 就业监管中心
  // {
  //   path: 'employment',
  //   meta: { title: '就业中心' },
  //   children: [
  //     {
  //       path: 'stats',
  //       name: 'EmpStats',
  //       meta: { title: '就业数据统计' },
  //       component: () => import('@/views/admin/employment/index.vue'),
  //     },
  //     {
  //       path: 'verify',
  //       name: 'EmpVerify',
  //       meta: { title: '就业核查督导' },
  //       component: () => import('@/views/icon/index.vue'),
  //     }
  //   ]
  // },
  //
  // // 创新创业库
  // {
  //   path: 'entrep',
  //   meta: { title: '创业中心' },
  //   children: [
  //     {
  //       path: 'projects',
  //       name: 'EntrepProjects',
  //       meta: { title: '创业项目库' },
  //       component: () => import('@/views/icon/index.vue'),
  //     },
  //     {
  //       path: 'mentors',
  //       name: 'EntrepMentors',
  //       meta: { title: '创业导师资源' },
  //       component: () => import('@/views/icon/index.vue'),
  //     }
  //   ]
  // },

  // // 内容运营
  // {
  //   path: 'operation',
  //   meta: { title: '内容运营' },
  //   children: [
  //     {
  //       path: 'notice',
  //       name: 'OpNotice',
  //       meta: { title: '通知公告' },
  //       component: () => import('@/views/icon/index.vue'),
  //     },
  //     {
  //       path: 'policy',
  //       name: 'OpPolicy',
  //       meta: { title: '政策法规' },
  //       component: () => import('@/views/icon/index.vue'),
  //     }
  //   ]
  // },

  // 【恢复】个人中心
  {
    path: 'person',
    meta: { title: '个人中心' },
    children: [
      {
        path: 'profile',
        name: 'AdminProfile',
        meta: { title: '基本信息' },
        component: () => import('@/views/admin/person/info.vue'), // 后续替换为真实页面
      },
      {
        path: 'password',
        name: 'AdminChangePassword',
        meta: { title: '修改密码' },
        component: () => import('@/views/admin/person/password.vue'),
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
    component: () => import('@/views/mobile/entrepreneurship/index.vue')
  },
  // [新增] 通知公告列表
  {
    path: 'notices',
    name: 'NoticeList',
    meta: { title: '通知公告', hideTabBar: true },
    component: () => import('@/views/mobile/notice/list.vue')
  },
  // [新增] 通知公告详情
  {
    path: 'notice/:id',
    name: 'NoticeDetail',
    meta: { title: '通知详情', hideTabBar: true },
    component: () => import('@/views/mobile/notice/detail.vue')
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
  },
  {
    path: 'resume/edit', // 这里作为总览入口
    name: 'ResumeDashboard',
    meta: { title: '我的简历', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/resume/index.vue')
  },

  // 2. 分块编辑页 (子页面)
  {
    path: 'resume/edit/intent',
    name: 'ResumeEditIntent',
    meta: { title: '编辑求职意向', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/resume/modules/edit-intent.vue')
  },
  {
    path: 'resume/edit/education',
    name: 'ResumeEditEducation',
    meta: { title: '教育经历', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/resume/modules/edit-education.vue')
  },
  {
    path: 'resume/edit/experience',
    name: 'ResumeEditExperience',
    meta: { title: '实习与项目', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/resume/modules/edit-experience.vue')
  },
  // [新增] 我的项目列表
  {
    path: 'my/projects',
    name: 'MyProjects',
    meta: { title: '我发布的项目', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/projects.vue')
  },

  // [新增] 我加入的项目列表
  {
    path: 'my/joined-projects',
    name: 'MyJoinedProjects',
    meta: { title: '我加入的项目', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/joined-projects.vue')
  },

  // [新增] 项目编辑/发布 (复用同一个页面)
  {
    path: 'my/project/edit/:id?', // id 是可选参数
    name: 'ProjectEdit',
    meta: { title: '发布项目', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/project-edit.vue')
  },
  
  // [新增] 项目申请列表
  {
    path: 'my/project/:projectId/applications',
    name: 'ProjectApplications',
    meta: { title: '申请列表', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/project-applications.vue')
  },
  // [新增] 消息通知列表
  {
    path: 'my/messages',
    name: 'MyMessages',
    meta: { title: '消息通知', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/messages.vue')
  },
  // [新增] 消息详情
  {
    path: 'my/messages/:id',
    name: 'MessageDetail',
    meta: { title: '消息详情', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/my/message-detail.vue')
  },
  // [新增] 个人信心编辑
  {
    path: 'profile/info',
    name: 'ProfileInfo',
    meta: { title: '个人信息', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/profile/info.vue')
  },
  {
    path: 'settings/password',
    name: 'ChangePassword',
    meta: { title: '修改密码', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/settings/password.vue')
  }
]
// --- 企业端菜单 ---
const companyMenu: RouteRecordRaw[] = [
  {
    path: 'home',
    name: 'CompDashboard',
    meta: { title: '企业工作台', affix: true },
    component: () => import('@/views/company/home/index.vue'),
  },
  {
    path: 'position',
    name: 'Position',
    meta: { title: '职位管理' },
    component: () => import('@/views/company/position/list.vue'),
    // children: [
    //   {
    //     path: 'post',
    //     name: 'CompPostJob',
    //     meta: { title: '发布新职位' },
    //     component: () => import('@/views/company/position/post.vue'),
    //   },
    //   {
    //     path: 'manage',
    //     name: 'CompJobManage',
    //     meta: { title: '职位列表' },
    //     component: () => import('@/views/company/position/list.vue'),
    //   }
    // ]
  },
  {
    path: 'recruitment',
    meta: { title: '招聘管理', icon: 'Document' }, // 建议改个图标
    children: [
      {
        path: 'pending',
        name: 'CompResumePending',
        meta: { title: '新简历' }, // status = 'DELIVERED'
        component: () => import('@/views/company/recruitment/new-resumes.vue'),
      },
      {
        path: 'interview',
        name: 'CompInterview',
        meta: { title: '面试日程' }, // status = 'INTERVIEW'
        component: () => import('@/views/company/recruitment/interview.vue'),
      },
      // ✅【补上这个】人才库/已录用
      {
        path: 'talent-pool',
        name: 'CompTalentPool',
        meta: { title: '录用/归档' }, // status = 'OFFER' 或 'REJECT'
        component: () => import('@/views/company/recruitment/talent-pool.vue'),
      }
    ]
  },
  {
    path: 'profile',
    name: 'CompProfile',
    meta: { title: '企业信息' },
    component: () => import('@/views/company/profile/info.vue'),
  },
  {
    path: 'person',
    meta: { title: '个人中心' },
    children: [
      {
        path: 'profile',
        name: 'CompanyProfile',
        meta: { title: '基本信息' },
        component: () => import('@/views/admin/person/info.vue'), // 后续替换为真实页面
      },
      {
        path: 'password',
        name: 'CompanyChangePassword',
        meta: { title: '修改密码' },
        component: () => import('@/views/admin/person/password.vue'),
      }
    ]
  }
]
// --- 学校端菜单 ---
const schoolMenu: RouteRecordRaw[] = [
  {
    path: 'home',
    name: 'SchoolHome',
    meta: { title: '学校工作台', affix: true },
    component: () => import('@/views/school/home/index.vue'),
  },

  // 学生管理
  {
    path: 'student',
    meta: { title: '学生管理' },
    children: [
      {
        path: 'list',
        name: 'SchoolStudentList',
        meta: { title: '学生档案' },
        component: () => import('@/views/school/student/list.vue'),
      },
      {
        path: 'employment',
        name: 'SchoolStudentEmployment',
        meta: { title: '就业情况' },
        component: () => import('@/views/school/student/employment.vue'),
      }
    ]
  },

  // 教师管理
  {
    path: 'teacher',
    meta: { title: '教师管理' },
    children: [
      {
        path: 'list',
        name: 'SchoolTeacherList',
        meta: { title: '教师档案' },
        component: () => import('@/views/school/teacher/list.vue'),
      },
      {
        path: 'guidance',
        name: 'SchoolTeacherGuidance',
        meta: { title: '指导记录' },
        component: () => import('@/views/school/teacher/guidance.vue'),
      }
    ]
  },

  // 创业项目
  {
    path: 'project',
    meta: { title: '创业项目' },
    children: [
      {
        path: 'list',
        name: 'SchoolProjectList',
        meta: { title: '项目管理', affix: true },
        component: () => import('@/views/school/project/list.vue'),
      }
    ]
  },

  // 数据统计
  {
    path: 'statistics',
    meta: { title: '数据统计' },
    children: [
      {
        path: 'employment',
        name: 'SchoolStatsEmployment',
        meta: { title: '就业统计' },
        component: () => import('@/views/school/statistics/employment.vue'),
      },
      {
        path: 'entrepreneurship',
        name: 'SchoolStatsEntrep',
        meta: { title: '创业统计' },
        component: () => import('@/views/school/statistics/entrepreneurship.vue'),
      }
    ]
  },

  // 通知公告
  {
    path: 'notice',
    name: 'SchoolNotice',
    meta: { title: '通知公告' },
    component: () => import('@/views/school/notice/index.vue'),
  },

  // 个人中心
  {
    path: 'person',
    meta: { title: '个人中心' },
    children: [
      {
        path: 'profile',
        name: 'SchoolProfile',
        meta: { title: '基本信息' },
        component: () => import('@/views/admin/person/info.vue'),
      },
      {
        path: 'password',
        name: 'SchoolChangePassword',
        meta: { title: '修改密码' },
        component: () => import('@/views/admin/person/password.vue'),
      }
    ]
  }
]

// --- 教师端菜单 ---
const teacherMenu: RouteRecordRaw[] = [
  {
    path: 'home',
    name: 'TeacherHome',
    meta: { title: '工作台', hideNavBar: true },
    component: () => import('@/views/teacher/home/index.vue')
  },
  {
    path: 'projects',
    name: 'TeacherProjects',
    meta: { title: '创业项目' },
    component: () => import('@/views/teacher/projects/index.vue')
  },
  {
    path: 'project/:id',
    name: 'TeacherProjectDetail',
    meta: { title: '项目详情', hideNavBar: true, hideTabBar: true },
    component: () => import('@/views/teacher/project/detail.vue') // 教师端专用项目详情页
  },
  {
    path: 'guidance',
    name: 'TeacherGuidance',
    meta: { title: '指导记录' },
    component: () => import('@/views/teacher/guidance/index.vue')
  },
  {
    path: 'profile',
    name: 'TeacherProfile',
    meta: { title: '个人中心' },
    component: () => import('@/views/teacher/profile/index.vue')
  },
  {
    path: 'profile/info',
    name: 'TeacherProfileInfo',
    meta: { title: '个人信息', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/teacher/profile/info.vue') // 教师端独立的个人信息页
  },
  {
    path: 'settings/password',
    name: 'TeacherChangePassword',
    meta: { title: '修改密码', hideNavBar: false, hideTabBar: true },
    component: () => import('@/views/mobile/settings/password.vue') // 复用学生端的修改密码页
  }
]

export const roleMenus: Record<UserRole, RouteRecordRaw[]> = {
  admin: adminMenu,
  student: studentMenu,
  company: companyMenu,
  school: schoolMenu,
  teacher: teacherMenu,
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
