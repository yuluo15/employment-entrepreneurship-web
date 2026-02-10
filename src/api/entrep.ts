import request from '@/utils/request'

// --- 类型定义 ---

// 项目查询参数
export interface ProjectQuery {
  pageNum: number
  pageSize: number
  projectName?: string
  schoolId?: string
  domain?: string
  status?: number | null
}

// 项目列表项
export interface ProjectItem {
  projectId: string
  projectName: string
  logo: string
  slogan: string
  schoolId: string
  schoolName: string
  leaderName: string
  mentorName: string
  teamSize: number
  domain: string
  domainLabel: string
  status: number  // 0=审核中, 1=孵化中, 2=已驳回, 3=已完结
  description: string
  needs: string
  auditReason?: string
  createTime: string
}

// 审核参数
export interface AuditProjectReq {
  projectId: string
  status: number  // 1=通过, 2=驳回
  reason?: string  // 驳回原因
}

// 学校列表项
export interface SchoolItem {
  id: string
  schoolName: string
}

// --- API 方法 ---

/**
 * 获取创业项目列表
 */
export function getProjectList(params: ProjectQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof ProjectQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof ProjectQuery]
    }
  })
  return request.get('/entrep/list', { params: cleanParams })
}

/**
 * 审核项目
 */
export function auditProject(data: AuditProjectReq) {
  return request.post('/entrep/audit', data)
}

/**
 * 完结项目
 */
export function completeProject(projectId: string) {
  return request.post(`/entrep/complete/${projectId}`)
}

/**
 * 获取学校列表 (用于筛选)
 */
export function getSchoolList() {
  return request.get('/entrep/schoolList')
}

/**
 * 获取项目领域字典
 */
export function getProjectDomains() {
  return request.get('/entrep/domains')
}
