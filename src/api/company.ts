import request from '@/utils/request'

// --- 类型定义 ---

// 职位查询参数
export interface JobQuery {
  pageNum: number
  pageSize: number
  jobName?: string
  audit?: number | null  // 0=待审核, 1=已通过, 2=已驳回
  status?: number | null  // 0=已下架, 1=在招
}

// 职位列表项
export interface JobListItem {
  id: string  // 后端返回的是 id，不是 jobId
  jobId?: string  // 兼容字段
  companyId: string
  jobName: string
  salaryRange: string
  city: string
  education: string
  experience: string
  tags?: string
  audit: number
  status: number
  viewCount: number
  deliveryCount?: number  // 投递数量（可能不存在）
  createTime: string
  description: string
  requirement: string
  contactPhone: string
  hrId: string
  reason?: string  // 驳回原因
}

// 职位表单
export interface JobForm {
  jobId?: string
  jobName: string
  salaryRange: string
  city: string
  education: string
  experience: string
  tags?: string
  description: string
  requirement: string
  contactPhone: string
}

// 职位详情
export interface JobDetail extends JobForm {
  jobId: string
  companyId: string
  companyName: string
  companyLogo: string
  hrId: string
  hrName: string
  status: number  // 1=在招, 0=已下架
  audit: number  // 0=待审核, 1=已通过, 2=已驳回
  reason?: string  // 驳回原因
  viewCount: number
  createTime: string
}

// 企业信息
export interface CompanyInfo {
  id: string
  name: string
  code: string  // 统一社会信用代码
  industry: string  // 所属行业
  scale: string  // 企业规模
  foundedDate?: string  // 成立时间
  registeredCapital?: string  // 注册资本
  website?: string  // 企业网站
  logo?: string  // 企业LOGO
  address: string  // 企业地址
  contactPerson: string  // 联系人
  contactPhone: string  // 联系电话
  email: string  // 联系邮箱
  description: string  // 企业简介
  benefits?: string  // 福利待遇
  status: number  // 认证状态：0=待审核, 1=已认证, 2=审核未通过
  createTime: string
  updateTime: string
}

// --- API 方法 ---

/**
 * 获取职位列表
 */
export function getJobList(params: JobQuery) {
  const cleanParams = { ...params }
  Object.keys(cleanParams).forEach(key => {
    const value = cleanParams[key as keyof JobQuery]
    if (value === null || value === undefined || value === '') {
      delete cleanParams[key as keyof JobQuery]
    }
  })
  return request.get<any, { data: { data: JobListItem[], total: number } }>('/company/job/list', { params: cleanParams })
}

/**
 * 发布新职位
 */
export function addJob(data: JobForm) {
  return request.post('/company/job/add', data)
}

/**
 * 更新职位
 */
export function updateJob(data: JobForm & { jobId: string }) {
  return request.put('/company/job/update', data)
}

/**
 * 获取职位详情
 */
export function getJobDetail(jobId: string) {
  return request.get<any, { data: JobDetail }>(`/company/job/detail/${jobId}`)
}

/**
 * 删除职位
 */
export function deleteJob(jobId: string) {
  return request.delete(`/company/job/delete/${jobId}`)
}

/**
 * 下架职位
 */
export function offlineJob(jobId: string) {
  return request.put(`/company/job/offline/${jobId}`)
}

/**
 * 上架职位
 */
export function onlineJob(jobId: string) {
  return request.put(`/company/job/online/${jobId}`)
}

/**
 * 获取企业信息
 */
export function getCompanyInfo() {
  return request.get<any, { data: CompanyInfo }>('/company/profile/info')
}

/**
 * 更新企业信息
 */
export function updateCompanyInfo(data: CompanyInfo) {
  return request.put('/company/profile/update', data)
}

// --- 企业工作台 ---

// 工作台数据
export interface DashboardData {
  companyName: string
  companyLogo: string
  hrName: string
  activeJobCount: number  // 在招职位数
  pendingResumeCount: number  // 待处理简历数
  todayInterviewCount: number  // 今日面试数
  monthResumeCount: number  // 本月简历数
  pendingResumes: PendingResume[]  // 待处理简历列表（最新5条）
  todayInterviews: TodayInterview[]  // 今日面试列表
  resumeTrend: ResumeTrend  // 7天简历趋势
  jobRank: JobRank[]  // 职位投递排行TOP5
}

// 待处理简历
export interface PendingResume {
  id: string  // 投递记录ID
  studentName: string
  studentAvatar?: string
  jobName: string
  createTime: string
}

// 今日面试
export interface TodayInterview {
  id: string  // 面试ID
  studentName: string
  jobName: string
  interviewTime: string
  type: number  // 1=线下, 2=视频, 3=电话
}

// 简历趋势
export interface ResumeTrend {
  dates: string[]  // 日期数组
  counts: number[]  // 对应的简历数量
}

// 职位排行
export interface JobRank {
  jobName: string
  count: number
}

/**
 * 获取企业工作台数据
 */
export function getCompanyDashboard() {
  return request.get<any, { data: DashboardData }>('/company/dashboard')
}

// 企业实体 VO (对应 CompanyEntity)
export interface CompanyVo {
  id: string
  name: string
  code: string
  industry: string
  scale: string
  logo: string
  description: string
  address: string
  contactPerson: string
  contactPhone: string
  email: string
  licenseUrl: string
  status: number
  auditReason?: string
  auditTime?: string
  auditorId?: string
  createTime?: string
  updateTime?: string
  isDeleted?: number
  defaultAccountId?: string
  fundingStage?: string
  tags?: string
  website?: string
  images?: string
}

// 列表查询参数
export interface CompanyQueryParams {
  pageNum: number
  pageSize: number
  name?: string
  code?: string
  status?: number
}

// 更新/创建企业参数 (对应 CompanyCreateReq)
export interface CompanyUpdateReq {
  id?: string
  logo: string
  licenseUrl?: string
  name: string
  code: string
  adminAccount: string
  password?: string // 修改时可能不需要传或必传，根据实际业务判断
  industry?: string
  scale?: string
  contactPerson?: string
  contactPhone: string
  email?: string
  address?: string
  description?: string
}

// 审核/更新状态参数 (对应 AuditCompanyReq)
export interface AuditCompanyReq {
  id: string
  status: number
  reason?: string // 驳回原因等
}

// --- API 方法定义 ---

// 1. 获取企业列表 (分页)
export function getCompanyList(params: CompanyQueryParams) {
  return request.get('/companyMgr/list', { params })
}

// 2. 审核企业入驻
export function auditCompany(data: AuditCompanyReq) {
  return request.post('/companyMgr/audit', data)
}

// 3. 更新企业信息
export function updateCompany(data: CompanyUpdateReq) {
  return request.post('/companyMgr/update', data)
}

// 4. 删除企业 (逻辑删除)
export function deleteCompany(id: string) {
  return request.delete(`/companyMgr/delete/${id}`)
}

// 5. 更新企业状态 (启用/禁用)
export function updateCompanyStatus(data: AuditCompanyReq) {
  return request.post('/companyMgr/updateStatus', data)
}
