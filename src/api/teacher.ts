import request from '@/utils/request'

// 获取教师工作台数据
export const getTeacherDashboard = () => {
  return request({
    url: '/teacher/dashboard',
    method: 'get'
  })
}

// 获取教师项目列表
export const getTeacherProjects = (params: {
  pageNum: number
  pageSize: number
  keyword?: string
  scope?: 'all' | 'school' // all: 全网项目, school: 本校项目
  status?: string
  domain?: string
}) => {
  return request({
    url: '/teacher/projects',
    method: 'get',
    params
  })
}

// 获取指导记录列表
export const getGuidanceList = (params: {
  pageNum: number
  pageSize: number
  keyword?: string
}) => {
  return request({
    url: '/teacher/guidance/list',
    method: 'get',
    params
  })
}

// 获取指导统计数据
export const getGuidanceStats = () => {
  return request({
    url: '/teacher/guidance/stats',
    method: 'get'
  })
}

// 发表指导意见
export const addGuidance = (data: {
  projectId: string
  stageId: string // 新增：阶段ID
  content: string
}) => {
  return request({
    url: '/teacher/guidance/add',
    method: 'post',
    data
  })
}

// 获取教师信息
export const getTeacherInfo = () => {
  return request({
    url: '/teacher/info',
    method: 'get'
  })
}

// 更新教师信息
export const updateTeacherInfo = (data: {
  avatar?: string
  gender?: string
  phone: string
  email?: string
  expertise?: string
  intro?: string
}) => {
  return request({
    url: '/teacher/info/update',
    method: 'put',
    data
  })
}

// 获取教师端项目详情
export const getTeacherProjectDetail = (projectId: string) => {
  return request({
    url: `/teacher/project/${projectId}`,
    method: 'get'
  })
}

// 获取项目指导记录列表
export const getProjectGuidanceList = (projectId: string) => {
  return request({
    url: `/teacher/project/${projectId}/guidance`,
    method: 'get'
  })
}

// 获取项目领域字典
export const getProjectDomains = () => {
  return request({
    url: '/teacher/projects/domain',
    method: 'get'
  })
}

// 获取项目阶段列表（教师端）
export const getTeacherProjectStages = (projectId: string) => {
  return request({
    url: `/teacher/project/${projectId}/stages`,
    method: 'get'
  })
}

// 获取阶段指导记录（教师端）
export const getTeacherStageGuidance = (stageId: string) => {
  return request({
    url: `/teacher/project/stage/${stageId}/guidance`,
    method: 'get'
  })
}
